// src/services/orderService.js
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

// Create an order in Google Sheets
export const createOrder = async (orderData) => {
    try {
        await authorizeJwtClient();
        const sheets = getSheets();
        const sheetId = process.env.GOOGLE_SHEET_ID;
        
        const { orderId, orderValues, orderItemsValues } = orderData;
        
        // Save the order header
        await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: 'Orders!A:R',
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            resource: {
                values: orderValues
            }
        });
        
        // Save the order items
        await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: 'OrderItems!A:G',
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            resource: {
                values: orderItemsValues
            }
        });
        
        return {
            success: true,
            orderId
        };
    } catch (error) {
        console.error('Error creating order in Google Sheets:', error);
        throw new Error('Failed to create order in database');
    }
};

// Fetch orders from Google Sheets
export const fetchOrders = async () => {
    try {
        await authorizeJwtClient();
        const sheets = getSheets();
        const sheetId = process.env.GOOGLE_SHEET_ID;
        const range = 'Orders!A:R';

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range
        });

        const rows = response.data.values;
        if (!rows || rows.length < 2) return [];

        const headers = rows[0];
        const orders = rows.slice(1).map((row) => {
            const order = {};
            headers.forEach((h, i) => {
                order[h] = row[i] || '';
            });
            return order;
        });

        return orders;
    } catch (error) {
        console.error('Error fetching orders from Google Sheets:', error);
        throw new Error('Failed to fetch orders');
    }
};

// Fetch order items for a specific order
export const fetchOrderItems = async (orderId) => {
    try {
        await authorizeJwtClient();
        const sheets = getSheets();
        const sheetId = process.env.GOOGLE_SHEET_ID;
        const range = 'OrderItems!A:G';

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range
        });

        const rows = response.data.values;
        if (!rows || rows.length < 2) return [];

        const headers = rows[0];
        const items = rows.slice(1)
            .filter(row => row[0] === orderId)
            .map((row) => {
                const item = {};
                headers.forEach((h, i) => {
                    item[h] = row[i] || '';
                });
                return item;
            });

        return items;
    } catch (error) {
        console.error('Error fetching order items from Google Sheets:', error);
        throw new Error('Failed to fetch order items');
    }
};

// Generate a unique order ID
export const generateOrderId = () => {
    const timestamp = new Date().getTime();
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `ORD-${timestamp.toString().slice(-6)}-${randomStr}`.toUpperCase();
};