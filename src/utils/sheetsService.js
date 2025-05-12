// src/utils/sheetsService.js
import { google } from 'googleapis';

let jwtClient = null;

// Create a JWT client either from full base64 credentials or individual vars
const createJwtClient = () => {
    if (process.env.GOOGLE_CREDENTIALS_B64) {
        // Use full credentials from base64-encoded JSON (for Vercel)
        const decoded = Buffer.from(process.env.GOOGLE_CREDENTIALS_B64, 'base64').toString('utf-8');
        const credentials = JSON.parse(decoded);

        return new google.auth.JWT(
            credentials.client_email,
            null,
            credentials.private_key,
            [
                'https://www.googleapis.com/auth/spreadsheets',
                'https://www.googleapis.com/auth/drive'
            ]
        );
    } else {
        // Use individual .env.local vars (for local dev)
        return new google.auth.JWT(
            process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.GOOGLE_CLIENT_EMAIL,
            null,
            (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
            [
                'https://www.googleapis.com/auth/spreadsheets',
                'https://www.googleapis.com/auth/drive'
            ]
        );
    }
};

// Authorize client
export const authorizeJwtClient = async () => {
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

// Reusable sheets and drive clients
export const getSheets = () => google.sheets({ version: 'v4', auth: jwtClient });
export const getDrive = () => google.drive({ version: 'v3', auth: jwtClient });

// Fetch all products from sheet
export const getProducts = async () => {
    try {
        await authorizeJwtClient();
        const sheets = getSheets();

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEETS_ID,
            range: process.env.GOOGLE_SHEETS_RANGE || 'Products!A2:Z', // Assumes headers in row 1
        });

        const rows = response.data.values || [];

        // Get headers from first row of the sheet
        const headerResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEETS_ID,
            range: process.env.GOOGLE_SHEETS_HEADER_RANGE || 'Products!A1:Z1',
        });

        const headers = headerResponse.data.values?.[0] || [];

        // Map rows to objects with header keys
        return rows.map((row) => {
            const product = {};
            headers.forEach((header, index) => {
                if (row[index] !== undefined) {
                    product[header] = row[index];
                }
            });

            // Convert numeric strings to numbers
            if (product.price) product.price = parseFloat(product.price);
            if (product.stock) product.stock = parseInt(product.stock, 10);

            return product;
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
};

// Get a single product by ID
export const getProductById = async (productId) => {
    try {
        const products = await getProducts();
        return products.find(product => product.id === productId);
    } catch (error) {
        console.error(`Error fetching product with ID ${productId}:`, error);
        throw error;
    }
};