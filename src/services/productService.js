// src/services/productService.js
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

export const fetchProducts = async () => {
    try {
        await authorizeJwtClient();
        const sheets = getSheets();
        const sheetId = process.env.GOOGLE_SHEET_ID;
        const range = 'Inventory!A:K';

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range
        });

        const rows = response.data.values;
        if (!rows || rows.length < 2) return [];

        const headers = rows[0];
        const items = rows.slice(1).map((row) => {
            const item = {};
            headers.forEach((h, i) => {
                item[h] = row[i] || '';
            });
            return item;
        });

        return items;
    } catch (error) {
        console.error('Error fetching products from Google Sheets:', error);
        throw new Error('Failed to fetch products');
    }
};
