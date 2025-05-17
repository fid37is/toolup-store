/* eslint-disable @typescript-eslint/no-unused-vars */
// src/pages/api/orders/create.js
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

// Generate a unique order ID
const generateOrderId = () => {
    const timestamp = new Date().getTime().toString().substr(-6);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD-${timestamp}-${random}`;
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const {
            userId,
            items,
            totalAmount,
            paymentMethod,
            customerName,
            customerEmail,
            customerPhone,
            shippingAddress,
            state,
            lga,
            town,
            zip,
            additionalInfo
        } = req.body;

        // Basic validation
        if (!userId || !items || !items.length || !totalAmount || !paymentMethod) {
            return res.status(400).json({
                error: 'Missing required fields',
                requiredFields: 'userId, items (array), totalAmount, paymentMethod'
            });
        }

        await authorizeJwtClient();
        const sheets = getSheets();
        const sheetId = process.env.GOOGLE_SHEET_ID;

        if (!sheetId) {
            console.error('GOOGLE_SHEET_ID environment variable is not set');
            return res.status(500).json({ error: 'Sheet ID not configured' });
        }

        // Generate a new order ID
        const orderId = generateOrderId();
        const orderDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        const status = 'pending'; // Initial status

        // Step 1: Get the headers from the Orders sheet to ensure we insert data in the right order
        let orderHeaders = [];
        try {
            const headersResponse = await sheets.spreadsheets.values.get({
                spreadsheetId: sheetId,
                range: 'Orders!1:1', // First row only (headers)
            });
            
            if (headersResponse.data.values && headersResponse.data.values.length > 0) {
                orderHeaders = headersResponse.data.values[0];
            } else {
                // If no headers exist, define the default structure
                orderHeaders = [
                    'orderId', 'userId', 'orderDate', 'status', 'totalAmount', 'paymentMethod',
                    'customerName', 'customerEmail', 'customerPhone', 'shippingAddress', 'state',
                    'lga', 'town', 'zip', 'additionalInfo'
                ];
                
                // Create the headers if they don't exist
                await sheets.spreadsheets.values.update({
                    spreadsheetId: sheetId,
                    range: 'Orders!A1',
                    valueInputOption: 'RAW',
                    resource: {
                        values: [orderHeaders]
                    }
                });
            }
        } catch (error) {
            // If the sheet doesn't exist, create it with our headers
            try {
                await sheets.spreadsheets.batchUpdate({
                    spreadsheetId: sheetId,
                    resource: {
                        requests: [{
                            addSheet: {
                                properties: {
                                    title: 'Orders'
                                }
                            }
                        }]
                    }
                });
                
                orderHeaders = [
                    'orderId', 'userId', 'orderDate', 'status', 'totalAmount', 'paymentMethod',
                    'customerName', 'customerEmail', 'customerPhone', 'shippingAddress', 'state',
                    'lga', 'town', 'zip', 'additionalInfo'
                ];
                
                await sheets.spreadsheets.values.update({
                    spreadsheetId: sheetId,
                    range: 'Orders!A1',
                    valueInputOption: 'RAW',
                    resource: {
                        values: [orderHeaders]
                    }
                });
            } catch (createError) {
                if (createError.message.includes('already exists')) {
                    // Sheet exists but something else went wrong with getting headers
                    return res.status(500).json({
                        error: 'Failed to read Orders sheet structure',
                        details: createError.message
                    });
                } else {
                    return res.status(500).json({
                        error: 'Failed to create Orders sheet',
                        details: createError.message
                    });
                }
            }
        }

        // Create a row for the Orders sheet with values in the correct order
        const orderRow = Array(orderHeaders.length).fill(''); // Initialize with empty strings
        
        // Map values to the correct positions based on headers
        orderHeaders.forEach((header, index) => {
            const lowerHeader = header.toLowerCase();
            if (lowerHeader === 'orderid') orderRow[index] = orderId;
            else if (lowerHeader === 'userid' || lowerHeader === 'user_id') orderRow[index] = userId;
            else if (lowerHeader === 'orderdate' || lowerHeader === 'date') orderRow[index] = orderDate;
            else if (lowerHeader === 'status') orderRow[index] = status;
            else if (lowerHeader === 'totalamount' || lowerHeader === 'total') orderRow[index] = totalAmount.toString();
            else if (lowerHeader === 'paymentmethod') orderRow[index] = paymentMethod;
            else if (lowerHeader === 'customername') orderRow[index] = customerName || '';
            else if (lowerHeader === 'customeremail') orderRow[index] = customerEmail || '';
            else if (lowerHeader === 'customerphone') orderRow[index] = customerPhone || '';
            else if (lowerHeader === 'shippingaddress') orderRow[index] = shippingAddress || '';
            else if (lowerHeader === 'state') orderRow[index] = state || '';
            else if (lowerHeader === 'lga') orderRow[index] = lga || '';
            else if (lowerHeader === 'town') orderRow[index] = town || '';
            else if (lowerHeader === 'zip') orderRow[index] = zip || '';
            else if (lowerHeader === 'additionalinfo') orderRow[index] = additionalInfo || '';
        });

        // Step 2: Add the new order to the Orders sheet
        await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: 'Orders!A:Z', // Wide range to ensure we capture all headers
            valueInputOption: 'RAW',
            resource: {
                values: [orderRow]
            }
        });

        // Step 3: Now handle the OrderItems sheet
        let itemHeaders = [];
        try {
            const itemsHeaderResponse = await sheets.spreadsheets.values.get({
                spreadsheetId: sheetId,
                range: 'OrderItems!1:1', // First row only (headers)
            });
            
            if (itemsHeaderResponse.data.values && itemsHeaderResponse.data.values.length > 0) {
                itemHeaders = itemsHeaderResponse.data.values[0];
            } else {
                // If no headers exist, define the default structure
                itemHeaders = ['orderId', 'productId', 'productName', 'quantity', 'price'];
                
                // Create the headers if they don't exist
                await sheets.spreadsheets.values.update({
                    spreadsheetId: sheetId,
                    range: 'OrderItems!A1',
                    valueInputOption: 'RAW',
                    resource: {
                        values: [itemHeaders]
                    }
                });
            }
        } catch (error) {
            // If the sheet doesn't exist, create it with our headers
            try {
                await sheets.spreadsheets.batchUpdate({
                    spreadsheetId: sheetId,
                    resource: {
                        requests: [{
                            addSheet: {
                                properties: {
                                    title: 'OrderItems'
                                }
                            }
                        }]
                    }
                });
                
                itemHeaders = ['orderId', 'productId', 'productName', 'quantity', 'price'];
                
                await sheets.spreadsheets.values.update({
                    spreadsheetId: sheetId,
                    range: 'OrderItems!A1',
                    valueInputOption: 'RAW',
                    resource: {
                        values: [itemHeaders]
                    }
                });
            } catch (createError) {
                if (createError.message.includes('already exists')) {
                    // Sheet exists but something else went wrong with getting headers
                    return res.status(500).json({
                        error: 'Failed to read OrderItems sheet structure',
                        details: createError.message
                    });
                } else {
                    return res.status(500).json({
                        error: 'Failed to create OrderItems sheet',
                        details: createError.message
                    });
                }
            }
        }

        // Step 4: Prepare and insert order items
        const itemRows = items.map(item => {
            const row = Array(itemHeaders.length).fill(''); // Initialize with empty strings
            
            // Map values to the correct positions based on headers
            itemHeaders.forEach((header, index) => {
                const lowerHeader = header.toLowerCase();
                if (lowerHeader === 'orderid') row[index] = orderId;
                else if (lowerHeader === 'productid') row[index] = item.productId || '';
                else if (lowerHeader === 'productname' || lowerHeader === 'name') row[index] = item.name || '';
                else if (lowerHeader === 'quantity' || lowerHeader === 'qty') row[index] = item.quantity?.toString() || '1';
                else if (lowerHeader === 'price') row[index] = item.price?.toString() || '0';
            });
            
            return row;
        });

        // Add items to the OrderItems sheet
        if (itemRows.length > 0) {
            await sheets.spreadsheets.values.append({
                spreadsheetId: sheetId,
                range: 'OrderItems!A:Z', // Wide range to ensure we capture all headers
                valueInputOption: 'RAW',
                resource: {
                    values: itemRows
                }
            });
        }

        // Return success with order information
        return res.status(201).json({
            success: true,
            orderId,
            message: 'Order created successfully',
            order: {
                orderId,
                userId,
                orderDate,
                status,
                totalAmount,
                paymentMethod,
                items: items.map(item => ({
                    productId: item.productId,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                }))
            }
        });

    } catch (error) {
        console.error('Error creating order:', error);
        return res.status(500).json({
            error: 'Failed to create order',
            message: error.message
        });
    }
}