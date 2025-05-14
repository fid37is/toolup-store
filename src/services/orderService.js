import { google } from 'googleapis';

let jwtClient = null;

const createJwtClient = () => {
    if (process.env.GOOGLE_CREDENTIALS_B64) {
        const decoded = Buffer.from(process.env.GOOGLE_CREDENTIALS_B64, 'base64').toString('utf-8');
        const credentials = JSON.parse(decoded);
        return new google.auth.JWT(
            credentials.client_email,
            null,
            credentials.private_key,
            ['https://www.googleapis.com/auth/spreadsheets']
        );
    } else {
        return new google.auth.JWT(
            process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.GOOGLE_CLIENT_EMAIL,
            null,
            (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
            ['https://www.googleapis.com/auth/spreadsheets']
        );
    }
};

const authorizeJwtClient = async () => {
    if (!jwtClient) jwtClient = createJwtClient();
    return new Promise((resolve, reject) => {
        jwtClient.authorize(err => {
            if (err) {
                console.error('JWT Authorization failed:', err);
                reject(err);
            } else {
                resolve(jwtClient);
            }
        });
    });
};

const getSheets = () => google.sheets({ version: 'v4', auth: jwtClient });

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const ORDERS_RANGE = 'Orders!A:K';

export const placeOrder = async (orderData) => {
    await authorizeJwtClient();
    const sheets = getSheets();

    const newRow = [
        orderData.id,
        orderData.customerName || '',
        orderData.customerEmail || '',
        orderData.phone || '',
        orderData.address || '',
        orderData.city || '',
        orderData.items || '',
        orderData.total || '',
        orderData.status || 'Processing',
        new Date().toISOString(),
        orderData.note || ''
    ];

    await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: ORDERS_RANGE,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [newRow]
        }
    });

    return { success: true };
};

export const fetchOrders = async () => {
    await authorizeJwtClient();
    const sheets = getSheets();

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: ORDERS_RANGE
    });

    const rows = response.data.values;
    if (!rows || rows.length < 2) return [];

    const headers = rows[0];
    return rows.slice(1).map((row) => {
        const obj = {};
        headers.forEach((h, i) => {
            obj[h] = row[i] || '';
        });
        return obj;
    });
};

export const fetchOrderById = async (id) => {
    const all = await fetchOrders();
    return all.find(o => o.id === id) || null;
};

export const cancelOrderById = async (id) => {
    await authorizeJwtClient();
    const sheets = getSheets();

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: ORDERS_RANGE
    });

    const rows = response.data.values;
    const headers = rows[0];
    const idIndex = headers.indexOf('id');
    const statusIndex = headers.indexOf('status');

    const targetIndex = rows.findIndex((row, i) => i > 0 && row[idIndex] === id);
    if (targetIndex === -1) return { success: false, message: 'Order not found' };

    rows[targetIndex][statusIndex] = 'Cancelled';

    await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Orders!A${targetIndex + 1}:K${targetIndex + 1}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [rows[targetIndex]]
        }
    });

    return { success: true, message: 'Order cancelled' };
};
