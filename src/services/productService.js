// src/services/productServiceFixed.js
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

// This is a completely rewritten version that focuses specifically on the price issue
export const fetchProducts = async () => {
    try {
        await authorizeJwtClient();
        const sheets = getSheets();
        const sheetId = process.env.GOOGLE_SHEET_ID;
        const range = 'Inventory!A:K';

        // Fetch the raw data
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range
        });

        const rows = response.data.values;
        if (!rows || rows.length < 2) return [];

        // Extract and clean headers
        const originalHeaders = rows[0];
        const cleanedHeaders = originalHeaders.map(h => h ? h.trim() : '');
        
        console.log('Original headers:', originalHeaders);
        console.log('Cleaned headers:', cleanedHeaders);
        
        // Get all columns that might contain price information
        const priceColumns = [];
        cleanedHeaders.forEach((header, index) => {
            if (header && header.toLowerCase().includes('price')) {
                priceColumns.push({ index, name: header });
            }
        });
        
        console.log('Found possible price columns:', priceColumns);
        
        // Process the data, prioritizing direct price handling
        const products = [];
        
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length === 0) continue;
            
            const product = {};
            
            // Process each column
            for (let j = 0; j < cleanedHeaders.length; j++) {
                const header = cleanedHeaders[j];
                if (!header) continue;
                
                // Get the raw value
                const rawValue = j < row.length ? row[j] : '';
                
                // Special handling for price columns
                if (priceColumns.some(col => col.index === j)) {
                    try {
                        // Remove currency symbols, spaces, commas
                        const cleanedValue = rawValue.toString().replace(/[$,£€\s]/g, '');
                        const numValue = parseFloat(cleanedValue);
                        product[header] = isNaN(numValue) ? 0 : numValue;
                        
                        // Debug logging for the first few rows
                        if (i < 4) {
                            console.log(`Row ${i+1} price conversion: "${rawValue}" → ${product[header]}`);
                        }
                    } catch (e) {
                        console.error(`Error processing price for row ${i+1}:`, e);
                        product[header] = 0;
                    }
                } else {
                    // For non-price columns, just use the raw value
                    product[header] = rawValue;
                }
            }
            
            products.push(product);
        }
        
        // Debug output the first couple of products
        console.log('First 2 products:', JSON.stringify(products.slice(0, 2), null, 2));
        
        return products;
    } catch (error) {
        console.error('Error fetching products from Google Sheets:', error);
        console.error('Detailed error:', error.stack);
        throw new Error('Failed to fetch products from Google Sheets');
    }
};

// Helper to log the raw data of the spreadsheet for debugging
export const debugRawSpreadsheetData = async () => {
    try {
        await authorizeJwtClient();
        const sheets = getSheets();
        const sheetId = process.env.GOOGLE_SHEET_ID;
        const range = 'Inventory!A:K';

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range
        });

        console.log('Raw spreadsheet data:');
        console.log(JSON.stringify(response.data, null, 2));
        
        return response.data;
    } catch (error) {
        console.error('Error debugging spreadsheet:', error);
        return null;
    }
};

// Helper method to get a specific product by ID
export const getProductById = async (productId) => {
    try {
        const products = await fetchProducts();
        const product = products.find(p => 
            (p.ID && p.ID === productId) || 
            (p.id && p.id === productId) ||
            (p.SKU && p.SKU === productId) ||
            (p.sku && p.sku === productId)
        );
        
        if (!product) {
            console.warn(`Product with ID ${productId} not found`);
        }
        
        return product;
    } catch (error) {
        console.error(`Error fetching product with ID ${productId}:`, error);
        throw new Error(`Failed to fetch product with ID ${productId}`);
    }
};