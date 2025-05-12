// src/utils/sheetsService.js
import { google } from 'googleapis';

// Initialize the Google Sheets API client
async function getAuthClient() {
    try {
        // Check if we're using base64 encoded credentials (Vercel) or raw credentials (local)
        let clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
        let privateKey = process.env.GOOGLE_PRIVATE_KEY;

        // If we have base64 encoded credentials, decode them
        if (process.env.GOOGLE_CREDENTIALS_BASE64) {
            try {
                // Decode the base64 string
                const credentialsJson = Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString();
                const credentials = JSON.parse(credentialsJson);

                // Extract client_email and private_key from the decoded credentials
                clientEmail = credentials.client_email;
                privateKey = credentials.private_key;
            } catch (decodeError) {
                console.error('Error decoding base64 credentials:', decodeError);
                throw new Error('Failed to decode base64 credentials: ' + decodeError.message);
            }
        } else if (privateKey) {
            // Fix common newline issue with private keys in plain environment variables
            privateKey = privateKey.replace(/\\n/g, '\n');
        }

        // Create the auth client with the appropriate credentials
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: clientEmail,
                private_key: privateKey,
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });

        return auth;
    } catch (error) {
        console.error('Auth client error:', error);
        throw new Error('Failed to initialize Google Sheets client: ' + error.message);
    }
}

// Function to fetch all products from Google Sheets
export async function getProducts() {
    try {
        // Check if required environment variables are set
        if (!process.env.GOOGLE_SPREADSHEET_ID) {
            throw new Error('GOOGLE_SPREADSHEET_ID environment variable is not set');
        }

        // Check if we have either direct credentials or base64 encoded credentials
        if (!process.env.GOOGLE_CREDENTIALS_BASE64 &&
            (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY)) {
            throw new Error('Google API credentials are not set. Provide either GOOGLE_CREDENTIALS_BASE64 or both GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY');
        }

        const auth = await getAuthClient();
        const sheets = google.sheets({ version: 'v4', auth });

        const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
        const range = process.env.GOOGLE_SHEET_RANGE || 'Products!A2:G'; // Assuming headers in row 1

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });

        const rows = response.data.values || [];

        // Transform the raw spreadsheet data into structured product objects
        // Assuming columns: ID, Name, Description, Price, Category, ImageUrl, Stock
        return rows.map((row) => ({
            id: row[0],
            name: row[1],
            description: row[2],
            price: parseFloat(row[3]) || 0,
            category: row[4] || '',
            imageUrl: row[5] || '',
            stock: parseInt(row[6], 10) || 0,
        }));
    } catch (error) {
        console.error('Error fetching products from Google Sheets:', error);
        throw error;
    }
}

// Function to fetch a specific product by ID
export async function getProductById(id) {
    try {
        const products = await getProducts();
        return products.find(product => product.id.toString() === id.toString()) || null;
    } catch (error) {
        console.error(`Error fetching product with ID ${id}:`, error);
        throw error;
    }
}