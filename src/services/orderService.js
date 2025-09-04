// src/services/orderService.js
import { google } from 'googleapis';

// Initialize Google Sheets API
const getAuth = async () => {
    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    return auth;
};

/**
 * Generate a unique order ID
 * @returns {string} - A unique order ID
 */
export const generateOrderId = () => {
    const timestamp = Date.now().toString().slice(-6);
    const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `ORD-${timestamp}-${randomStr}`;
};

/**
 * Create an order in Google Sheets
 * @param {Object} orderData - The order data
 * @returns {Promise} - A promise that resolves when the order is created
 */
export const createOrder = async ({ orderId, orderValues, orderItemsValues }) => {
    try {
        const auth = await getAuth();
        const sheets = google.sheets({ version: 'v4', auth });

        // Append to the Orders sheet
        await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: 'Orders',
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            resource: {
                values: orderValues
            }
        });

        // Append to the OrderItems sheet
        await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: 'OrderItems',
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            resource: {
                values: orderItemsValues
            }
        });

        return { success: true, orderId };
    } catch (error) {
        console.error('Error creating order in Google Sheets:', error);
        throw error;
    }
};

/**
 * Get orders for a specific user
 * @param {string} userEmail - The user's email
 * @returns {Promise<Array>} - A promise that resolves to an array of orders
 */
export const getUserOrders = async (userEmail) => {
    try {
        const auth = await getAuth();
        const sheets = google.sheets({ version: 'v4', auth });

        // Get all orders
        const ordersResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: 'Orders!A2:R',
        });

        // Get all order items
        const orderItemsResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: 'OrderItems!A2:G',
        });

        // Get all products for image URLs
        const productsResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: 'Inventory!A2:F',
        });

        const ordersRows = ordersResponse.data.values || [];
        const orderItemsRows = orderItemsResponse.data.values || [];
        const productsRows = productsResponse.data.values || [];

        // Create products map for quick lookups
        const productsMap = new Map();
        productsRows.forEach(product => {
            const productId = product[0]; // Assuming column A is productId
            const imageUrl = product[4];  // Assuming column E is imageUrl
            productsMap.set(productId, {
                id: productId,
                name: product[1],
                price: parseFloat(product[2] || 0),
                imageUrl: imageUrl || ''
            });
        });

        // Filter orders by user email
        const userOrders = ordersRows.filter(row => row[3] === userEmail);

        // Format orders
        const formattedOrders = userOrders.map(order => {
            const orderId = order[0];

            // Get items for this order
            const items = orderItemsRows
                .filter(item => item[0] === orderId)
                .map(item => {
                    const productId = item[1];
                    const name = item[2];
                    const quantity = parseInt(item[3] || 1);
                    const price = parseFloat(item[4] || 0);

                    // Get image URL from product map
                    const product = productsMap.get(productId);
                    const imageUrl = product ? product.imageUrl : null;

                    return {
                        productId,
                        name,
                        quantity,
                        price,
                        imageUrl
                    };
                });

            // Calculate total
            const total = parseFloat(order[14] || 0);

            return {
                orderId,
                orderDate: order[1],
                customerName: order[2],
                email: order[3],
                status: order[17] || 'Pending',
                total,
                items
            };
        });

        return formattedOrders;
    } catch (error) {
        console.error('Error fetching user orders:', error);
        throw error;
    }
};

/**
 * Get a specific order by ID
 * @param {string} orderId - The order ID
 * @param {string} userEmail - The user's email (for verification)
 * @returns {Promise<Object>} - A promise that resolves to the order details
 */
export const getOrderById = async (orderId, userEmail) => {
    try {
        const auth = await getAuth();
        const sheets = google.sheets({ version: 'v4', auth });

        // Get all orders
        const ordersResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: 'Orders!A2:R',
        });

        // Get all order items
        const orderItemsResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: 'OrderItems!A2:G',
        });

        // Get all products for image URLs
        const productsResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: 'Inventory!A2:F',
        });

        const ordersRows = ordersResponse.data.values || [];
        const orderItemsRows = orderItemsResponse.data.values || [];
        const productsRows = productsResponse.data.values || [];

        // Find the specific order
        const orderRow = ordersRows.find(row => row[0] === orderId);

        if (!orderRow) {
            throw new Error('Order not found');
        }

        // Check if the order belongs to the user
        const orderEmail = orderRow[3]; // Assuming column D is email

        if (orderEmail !== userEmail) {
            throw new Error('Access denied: This order does not belong to you');
        }

        // Create products map for quick lookups
        const productsMap = new Map();
        productsRows.forEach(product => {
            const productId = product[0]; // Assuming column A is productId
            const imageUrl = product[4];  // Assuming column E is imageUrl
            productsMap.set(productId, {
                id: productId,
                name: product[1],
                price: parseFloat(product[2] || 0),
                imageUrl: imageUrl || ''
            });
        });

        // Get items for this order
        const items = orderItemsRows
            .filter(item => item[0] === orderId)
            .map(item => {
                const productId = item[1];
                const name = item[2];
                const quantity = parseInt(item[3] || 1);
                const price = parseFloat(item[4] || 0);

                // Get image URL from product map
                const product = productsMap.get(productId);
                const imageUrl = product ? product.imageUrl : null;

                return {
                    productId,
                    name,
                    quantity,
                    price,
                    imageUrl
                };
            });

        // Format the order
        const order = {
            orderId: orderRow[0],
            orderDate: orderRow[1],
            customerName: orderRow[2],
            email: orderRow[3],
            phoneNumber: orderRow[4],
            status: orderRow[17] || 'Pending',
            paymentMethod: orderRow[12] || 'N/A',
            shippingFee: parseFloat(orderRow[13] || 0),
            total: parseFloat(orderRow[14] || 0),
            currency: orderRow[15] || 'NGN',
            shippingAddress: {
                address: orderRow[5] || '',
                city: orderRow[6] || '',
                state: orderRow[7] || '',
                lga: orderRow[8] || '',
                town: orderRow[9] || '',
                zip: orderRow[10] || '',
                additionalInfo: orderRow[11] || ''
            },
            items
        };

        return order;
    } catch (error) {
        console.error('Error fetching order details:', error);
        throw error;
    }
};