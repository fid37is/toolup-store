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

    console.log(`Fetching orders for userId: ${userId}`);

    try {
        console.log('Authorizing JWT client...');
        await authorizeJwtClient();
        
        const sheets = getSheets();
        const sheetId = process.env.GOOGLE_SHEET_ID;
        
        if (!sheetId) {
            console.error('GOOGLE_SHEET_ID environment variable is not set');
            return res.status(500).json({ error: 'Sheet ID not configured' });
        }
        
        console.log(`Using sheet ID: ${sheetId}`);

        // Fetch orders from Orders sheet
        console.log('Fetching data from Orders sheet...');
        const orderResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'Orders!A:R',
        });

        const orderRows = orderResponse.data.values || [];
        if (!orderRows.length) {
            console.log('Orders sheet is empty or not accessible');
            return res.status(200).json([]);
        }
        
        const orderHeaders = orderRows[0];
        console.log('Order headers:', orderHeaders);
        
        // Find the index of userId column
        const userIdColumnIndex = orderHeaders.findIndex(header => 
            header && (header.toLowerCase() === 'userid' || 
                     header.toLowerCase() === 'user_id' || 
                     header.toLowerCase() === 'customerid' || 
                     header.toLowerCase() === 'uid'));
        
        console.log(`userId column index: ${userIdColumnIndex}`);
        
        if (userIdColumnIndex === -1) {
            console.error('UserId column not found in Order headers:', orderHeaders);
            return res.status(500).json({ error: 'UserId column not found in Orders sheet' });
        }

        // Filter orders by user ID
        const userOrderRows = orderRows.slice(1).filter(row => {
            // Ensure the row has enough elements and the user ID matches
            return row.length > userIdColumnIndex && row[userIdColumnIndex] === userId;
        });

        console.log(`Found ${userOrderRows.length} orders for user ${userId}`);

        if (!userOrderRows.length) {
            return res.status(200).json([]); // Return empty array if no orders found
        }

        // Find the orderId column index
        const orderIdIndex = orderHeaders.findIndex(header => 
            header && header.toLowerCase() === 'orderid');
            
        if (orderIdIndex === -1) {
            console.error('OrderId column not found in Order headers:', orderHeaders);
            return res.status(500).json({ error: 'OrderId column not found in Orders sheet' });
        }

        // Fetch order items from OrderItems sheet for batch processing
        console.log('Fetching data from OrderItems sheet...');
        const itemsResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'OrderItems!A:R',
        });

        const itemRows = itemsResponse.data.values || [];
        if (!itemRows.length) {
            console.log('OrderItems sheet is empty or not accessible');
            // Continue without items
        }
        
        const itemHeaders = itemRows.length > 0 ? itemRows[0] : [];
        
        // Map all order IDs from filtered orders
        const orderIds = userOrderRows.map(row => {
            return row.length > orderIdIndex ? row[orderIdIndex] : null;
        }).filter(Boolean);

        console.log(`Order IDs for this user: ${orderIds.join(', ')}`);

        // Create a map of order items by order ID
        const orderItemsMap = {};
        
        if (itemRows.length > 0 && itemHeaders.length > 0) {
            const itemOrderIdIndex = itemHeaders.findIndex(header => 
                header && header.toLowerCase() === 'orderid');
                
            if (itemOrderIdIndex !== -1) {
                itemRows.slice(1).forEach(row => {
                    if (row.length > itemOrderIdIndex) {
                        const orderId = row[itemOrderIdIndex];
                        if (orderIds.includes(orderId)) {
                            if (!orderItemsMap[orderId]) {
                                orderItemsMap[orderId] = [];
                            }
                            
                            const item = {};
                            itemHeaders.forEach((header, index) => {
                                if (header && index < row.length) {
                                    item[header] = row[index] || '';
                                }
                            });
                            
                            orderItemsMap[orderId].push(item);
                        }
                    }
                });
            } else {
                console.log('OrderId column not found in OrderItems headers');
            }
        }

        // Extract column indices for required fields
        const dateIndex = orderHeaders.findIndex(header => 
            header && (header.toLowerCase() === 'orderdate' || header.toLowerCase() === 'date'));
        const statusIndex = orderHeaders.findIndex(header => 
            header && header.toLowerCase() === 'status');
        const totalIndex = orderHeaders.findIndex(header => 
            header && (header.toLowerCase() === 'totalamount' || header.toLowerCase() === 'total'));
        const paymentMethodIndex = orderHeaders.findIndex(header => 
            header && header.toLowerCase() === 'paymentmethod');

        // Create order objects for response
        const orders = userOrderRows.map(row => {
            // Find orderId in the current row
            const orderId = row.length > orderIdIndex ? row[orderIdIndex] : null;
            
            // Get the items for this order
            const items = orderItemsMap[orderId] || [];
            
            // Format the response
            return {
                orderId: orderId,
                date: row.length > dateIndex && dateIndex !== -1 ? row[dateIndex] : '',
                status: row.length > statusIndex && statusIndex !== -1 ? row[statusIndex] : 'pending',
                total: row.length > totalIndex && totalIndex !== -1 ? row[totalIndex] : '0',
                paymentMethod: row.length > paymentMethodIndex && paymentMethodIndex !== -1 ? row[paymentMethodIndex] : '',
                items: items.map(item => ({
                    productId: item.productId || '',
                    name: item.productName || '',
                    quantity: parseInt(item.quantity) || 0,
                    price: item.price || '0'
                }))
            };
        });

        console.log('Formatted orders:', JSON.stringify(orders.slice(0, 1)));
        return res.status(200).json(orders);

    } catch (error) {
        console.error('Error fetching user orders:', error);
        // Send detailed error for debugging
        return res.status(500).json({ 
            error: 'Failed to fetch orders', 
            message: error.message,
            stack: error.stack
        });
    }
}