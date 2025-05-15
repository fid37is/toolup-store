import { google } from 'googleapis';
import { fetchProducts } from './productService';

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

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const ORDERS_RANGE = 'Orders!A:Z';

/**
 * Fetch all orders from the Orders sheet and enrich them with product information
 * @param {string} userEmail - Optional email to filter orders by customer
 * @returns {Promise<Array>} - Array of order objects with enriched item data
 */
export const fetchUserOrders = async (userEmail = null) => {
    try {
        // 1. Fetch all products to get their image URLs and other data
        const products = await fetchProducts();

        // Create a map of products by ID and name for quick lookup
        const productMapById = new Map();
        const productMapByName = new Map();

        products.forEach(product => {
            if (product.id) productMapById.set(product.id, product);
            if (product.name) productMapByName.set(product.name.toLowerCase(), product);
        });

        // 2. Fetch all orders from the sheet
        await authorizeJwtClient();
        const sheets = getSheets();

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: ORDERS_RANGE
        });

        const rows = response.data.values;
        if (!rows || rows.length < 2) return [];

        // Get headers from the sheet
        const headers = rows[0];

        // Find the indices for important columns
        const itemsJsonIndex = headers.findIndex(h => h === 'itemsJson');

        if (itemsJsonIndex === -1) {
            console.error('Sheet is missing itemsJson column');
            return [];
        }

        // Process all orders and filter by user email if provided
        let orders = rows.slice(1).map((row) => {
            // Create a base order object with all columns
            const order = {};
            headers.forEach((header, i) => {
                if (header === 'total') {
                    order[header] = parseFloat(row[i] || '0');
                } else {
                    order[header] = row[i] || '';
                }
            });

            // Parse items JSON
            try {
                const itemsJson = row[itemsJsonIndex];
                if (itemsJson) {
                    const items = JSON.parse(itemsJson);

                    // Enrich each item with product details including image URL
                    order.items = items.map(item => {
                        // Try to find the product by ID first, then by name
                        let matchedProduct = null;

                        if (item.productId) {
                            matchedProduct = productMapById.get(item.productId);
                        }

                        // If not found by ID, try by name
                        if (!matchedProduct && item.name) {
                            matchedProduct = productMapByName.get(item.name.toLowerCase());
                        }

                        // Merge the item with product data, prioritizing order data
                        return {
                            ...item,
                            imageUrl: matchedProduct?.imageUrl || '/api/placeholder/100/100',
                            // Add any other product details you need here
                        };
                    });
                } else {
                    order.items = [];
                }
            } catch (err) {
                console.error('Failed to parse items JSON:', err);
                order.items = [];
            }

            return order;
        });

        // Filter orders by user email if provided
        if (userEmail) {
            orders = orders.filter(order =>
                order.customerEmail &&
                order.customerEmail.toLowerCase() === userEmail.toLowerCase()
            );
        }

        // Sort orders by date (newest first)
        orders.sort((a, b) => {
            const dateA = new Date(a.date || 0);
            const dateB = new Date(b.date || 0);
            return dateB - dateA;
        });

        return orders;
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw new Error('Failed to fetch orders: ' + error.message);
    }
};

/**
 * Fetch a specific order by ID
 * @param {string} orderId - The order ID to fetch
 * @returns {Promise<Object|null>} - The order object or null if not found
 */
export const fetchOrderById = async (orderId) => {
    try {
        // Fetch all orders
        const allOrders = await fetchUserOrders();
        
        // Find the specific order by ID
        const order = allOrders.find(order => order.id === orderId);
        
        return order || null;
    } catch (error) {
        console.error(`Error fetching order ${orderId}:`, error);
        throw new Error(`Failed to fetch order: ${error.message}`);
    }
};

/**
 * Create a new order in the Orders sheet
 * @param {Object} orderData - Data for the new order
 * @returns {Promise<Object>} - The created order with ID
 */
export const createOrder = async (orderData) => {
    try {
        await authorizeJwtClient();
        const sheets = getSheets();

        // 1. First fetch the Orders sheet to get headers
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: ORDERS_RANGE
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            throw new Error('Orders sheet is empty or not properly formatted');
        }

        const headers = rows[0];

        // 2. Generate a unique order ID
        const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const currentDate = new Date().toISOString();

        // 3. Prepare the order row
        const newOrder = {
            id: orderId,
            date: currentDate,
            customerEmail: orderData.customerEmail,
            customerName: orderData.customerName || '',
            customerPhone: orderData.customerPhone || '',
            shippingAddress: orderData.shippingAddress || '',
            total: orderData.total.toString(),
            subtotal: (orderData.subtotal || orderData.total).toString(),
            tax: (orderData.tax || '0').toString(),
            shipping: (orderData.shipping || '0').toString(),
            status: orderData.status || 'Completed',
            paymentMethod: orderData.paymentMethod || '',
            itemsJson: JSON.stringify(orderData.items || [])
        };

        // 4. Create a row array that matches the header structure
        const newRow = headers.map(header => newOrder[header] || '');

        // 5. Append the new row to the sheet
        await sheets.spreadsheets.values.append({
            spreadsheetId: SHEET_ID,
            range: 'Orders!A:Z',
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            resource: {
                values: [newRow]
            }
        });

        // 6. Return the created order
        return newOrder;
    } catch (error) {
        console.error('Error creating order:', error);
        throw new Error('Failed to create order: ' + error.message);
    }
};