/* eslint-disable @typescript-eslint/no-unused-vars */
// src/pages/api/orders/user.js
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

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    console.log(`Looking for orders for userId: ${userId}`);

    try {
        // Step 1: Authorize and get sheets API client
        await authorizeJwtClient();
        const sheets = getSheets();
        const sheetId = process.env.GOOGLE_SHEET_ID;

        if (!sheetId) {
            console.error('GOOGLE_SHEET_ID environment variable is not set');
            return res.status(500).json({ error: 'Sheet ID not configured' });
        }

        // Step 2: Get the sheet data - try both ways of referring to the orders sheet
        let orderRows = [];
        let orderResponse;
        
        try {
            // Try first with 'Orders'
            orderResponse = await sheets.spreadsheets.values.get({
                spreadsheetId: sheetId,
                range: 'Orders!A:R',
            });
            orderRows = orderResponse.data.values || [];
        } catch (e) {
            // If that fails, try with lowercase 'orders'
            try {
                orderResponse = await sheets.spreadsheets.values.get({
                    spreadsheetId: sheetId,
                    range: 'orders!A:R',
                });
                orderRows = orderResponse.data.values || [];
            } catch (innerError) {
                console.error('Error fetching Orders sheet:', innerError.message);
                return res.status(500).json({ 
                    error: 'Failed to fetch orders sheet',
                    details: innerError.message
                });
            }
        }

        // If we have no data, return empty array early
        if (!orderRows.length) {
            console.log('No data found in Orders sheet');
            return res.status(200).json([]);
        }

        // Step 3: Find the right columns
        const orderHeaders = orderRows[0].map(header => header ? header.toLowerCase() : '');
        console.log('Order headers:', orderHeaders);
        
        // Look for user ID column - check multiple possible names
        const userIdColumnIndex = orderHeaders.findIndex(header => 
            header === 'userid' || 
            header === 'user_id' || 
            header === 'customerid' || 
            header === 'customer_id' || 
            header === 'uid');
        
        if (userIdColumnIndex === -1) {
            console.error('Could not find user ID column in headers:', orderHeaders);
            return res.status(200).json([]); // Return empty array instead of error
        }
        
        // Look for other important columns
        const orderIdIndex = orderHeaders.findIndex(header => header === 'orderid' || header === 'order_id');
        const dateIndex = orderHeaders.findIndex(header => header === 'orderdate' || header === 'date');
        const statusIndex = orderHeaders.findIndex(header => header === 'status');
        const totalIndex = orderHeaders.findIndex(header => header === 'totalamount' || header === 'total');
        const paymentMethodIndex = orderHeaders.findIndex(header => header === 'paymentmethod' || header === 'payment_method');
        
        // Step 4: Filter for this user's orders
        const userOrderRows = [];
        
        for (let i = 1; i < orderRows.length; i++) {
            const row = orderRows[i];
            // Skip rows that are too short
            if (row.length <= userIdColumnIndex) continue;
            
            // Compare user IDs, being careful about type conversions and trim spaces
            const rowUserId = (row[userIdColumnIndex] || '').trim();
            const queryUserId = userId.trim();
            
            if (rowUserId === queryUserId) {
                userOrderRows.push(row);
            }
        }
        
        console.log(`Found ${userOrderRows.length} orders for user ${userId}`);
        
        // If no orders found, return empty array
        if (!userOrderRows.length) {
            return res.status(200).json([]);
        }
        
        // Step 5: Get order items if needed
        let orderItems = {};
        
        // Only proceed with items if we have an order ID column
        if (orderIdIndex !== -1) {
            // Get all order IDs for this user
            const orderIds = userOrderRows
                .map(row => row.length > orderIdIndex ? row[orderIdIndex] : null)
                .filter(Boolean);
                
            console.log(`Order IDs to look up: ${orderIds.join(', ')}`);
            
            try {
                // Try to get order items - try both capitalization patterns
                let itemsResponse;
                let itemRows = [];
                
                try {
                    itemsResponse = await sheets.spreadsheets.values.get({
                        spreadsheetId: sheetId,
                        range: 'OrderItems!A:R',
                    });
                    itemRows = itemsResponse.data.values || [];
                } catch (e) {
                    // Try lowercase
                    try {
                        itemsResponse = await sheets.spreadsheets.values.get({
                            spreadsheetId: sheetId,
                            range: 'orderitems!A:R',
                        });
                        itemRows = itemsResponse.data.values || [];
                    } catch (innerError) {
                        console.log('Could not fetch order items:', innerError.message);
                        // Continue without items
                    }
                }
                
                if (itemRows.length > 0) {
                    const itemHeaders = itemRows[0].map(header => header ? header.toLowerCase() : '');
                    const itemOrderIdIndex = itemHeaders.findIndex(header => header === 'orderid' || header === 'order_id');
                    
                    if (itemOrderIdIndex !== -1) {
                        // Get indices for item data
                        const productIdIndex = itemHeaders.findIndex(header => header === 'productid' || header === 'product_id');
                        const productNameIndex = itemHeaders.findIndex(header => header === 'productname' || header === 'product_name' || header === 'name');
                        const quantityIndex = itemHeaders.findIndex(header => header === 'quantity' || header === 'qty');
                        const priceIndex = itemHeaders.findIndex(header => header === 'price');
                        
                        // Process item rows into a map keyed by order ID
                        for (let i = 1; i < itemRows.length; i++) {
                            const row = itemRows[i];
                            if (row.length <= itemOrderIdIndex) continue;
                            
                            const orderId = row[itemOrderIdIndex];
                            if (!orderIds.includes(orderId)) continue;
                            
                            if (!orderItems[orderId]) {
                                orderItems[orderId] = [];
                            }
                            
                            // Only add the item if we have product information
                            if (productNameIndex !== -1 && row.length > productNameIndex) {
                                orderItems[orderId].push({
                                    productId: productIdIndex !== -1 && row.length > productIdIndex ? row[productIdIndex] : '',
                                    name: row[productNameIndex],
                                    quantity: quantityIndex !== -1 && row.length > quantityIndex ? parseInt(row[quantityIndex]) || 1 : 1,
                                    price: priceIndex !== -1 && row.length > priceIndex ? row[priceIndex] : '0'
                                });
                            }
                        }
                    }
                }
            } catch (error) {
                // Log but continue without items if there's an error
                console.log('Error processing order items, continuing without items:', error.message);
            }
        }
        
        // Step 6: Format orders for response
        const orders = userOrderRows.map(row => {
            // Get order ID if available
            const orderId = orderIdIndex !== -1 && row.length > orderIdIndex ? row[orderIdIndex] : `unknown-${Math.random().toString(36).substring(2, 9)}`;
            
            // Create response object with fallbacks for missing data
            return {
                orderId: orderId,
                date: dateIndex !== -1 && row.length > dateIndex ? row[dateIndex] : new Date().toISOString().split('T')[0],
                status: statusIndex !== -1 && row.length > statusIndex ? row[statusIndex] : 'pending',
                total: totalIndex !== -1 && row.length > totalIndex ? row[totalIndex] : '0',
                paymentMethod: paymentMethodIndex !== -1 && row.length > paymentMethodIndex ? row[paymentMethodIndex] : '',
                items: orderItems[orderId] || []
            };
        });
        
        console.log(`Successfully processed ${orders.length} orders for user ${userId}`);
        return res.status(200).json(orders);

    } catch (error) {
        console.error('Error in user orders API:', error);
        return res.status(500).json({ 
            error: 'Failed to fetch orders', 
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}