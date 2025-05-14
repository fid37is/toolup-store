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
        jwtClient.authorize((err) => {
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

const ORDER_HEADERS = [
    'Order ID', 'Customer Name', 'Customer Email', 'Phone', 'Address',
    'Items', 'Total', 'Status', 'Created At'
];

// 🟩 Create new order
export const createOrder = async (orderData) => {
    await authorizeJwtClient();
    const sheets = getSheets();

    const sheetId = process.env.GOOGLE_SHEET_ID;
    const range = 'Orders!A:I';

    const values = [
        ORDER_HEADERS.map((h) => orderData[h] || '')
    ];

    await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values }
    });

    return { success: true };
};

// 🟨 Fetch a specific order by ID
export const fetchOrderById = async (orderId) => {
    await authorizeJwtClient();
    const sheets = getSheets();

    const sheetId = process.env.GOOGLE_SHEET_ID;
    const range = 'Orders!A:I';
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range });

    const rows = res.data.values;
    const headers = rows[0];
    const dataRows = rows.slice(1);

    const found = dataRows.find((row) => row[0] === orderId);
    if (!found) return null;

    const order = {};
    headers.forEach((h, i) => {
        order[h] = found[i] || '';
    });

    return order;
};

// 🟥 Cancel an order (set status to Cancelled)
export const cancelOrderById = async (orderId) => {
    await authorizeJwtClient();
    const sheets = getSheets();

    const sheetId = process.env.GOOGLE_SHEET_ID;
    const range = 'Orders!A:I';
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range });

    const rows = res.data.values;
    const headers = rows[0];
    const dataRows = rows.slice(1);

    const orderIndex = dataRows.findIndex((row) => row[0] === orderId);
    if (orderIndex === -1) return { success: false, message: 'Order not found' };

    const rowNumber = orderIndex + 2; // +2 to account for header + 1-indexing

    await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `Orders!H${rowNumber}`, // Status column = H
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [['Cancelled']]
        }
    });

    return { success: true };
};
