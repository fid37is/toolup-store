import { jwtVerify } from 'jose';
import { google } from 'googleapis';

// JWT authentication for Google Sheets API
const getSheetClient = async () => {
    try {
        const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
        const auth = new google.auth.JWT(
            process.env.GOOGLE_CLIENT_EMAIL,
            null,
            privateKey,
            ['https://www.googleapis.com/auth/spreadsheets']
        );

        const sheets = google.sheets({ version: 'v4', auth });
        return sheets;
    } catch (error) {
        console.error('Error creating Google Sheets client:', error);
        throw new Error('Failed to initialize Google Sheets client');
    }
};

// Create a new order
export const createOrder = async (orderData) => {
    try {
        const sheets = await getSheetClient();

        // Generate a random order ID (you could use a UUID library in a real app)
        const orderId = 'ORD' + Date.now().toString(36).toUpperCase() +
            Math.random().toString(36).substring(2, 5).toUpperCase();

        // Prepare order row data
        // We'll store items as a JSON string in a single cell
        const orderRow = [
            orderId,
            orderData.userId || 'guest',
            orderData.orderDate,
            JSON.stringify(orderData.items),
            orderData.total,
            orderData.paymentMethod,
            orderData.status || 'pending',
            JSON.stringify(orderData.shippingDetails)
        ];

        // Insert row into Orders sheet
        await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: 'Orders!A:H', // Make sure your Orders sheet has these columns
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            resource: {
                values: [orderRow]
            }
        });

        // If it's not a guest order, update the user's order history
        if (orderData.userId && orderData.userId !== 'guest') {
            // Implementation for updating user order history if needed
            // This could involve updating a separate User Orders sheet or column
        }

        return { success: true, orderId };
    } catch (error) {
        console.error('Error creating order:', error);
        throw new Error('Failed to create order');
    }
};

// Get all orders (with optional userId filter)
export const getOrders = async (userId = null) => {
    try {
        const sheets = await getSheetClient();

        // Get all orders from the sheet
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: 'Orders!A:H',
        });

        const rows = response.data.values || [];

        // Skip header row and map data to order objects
        const orders = rows.slice(1).map(row => {
            try {
                return {
                    orderId: row[0],
                    userId: row[1],
                    orderDate: row[2],
                    items: JSON.parse(row[3] || '[]'),
                    total: Number(row[4] || 0),
                    paymentMethod: row[5],
                    status: row[6] || 'pending',
                    shippingDetails: JSON.parse(row[7] || '{}')
                };
            } catch (e) {
                console.error('Error parsing order data:', e);
                return null;
            }
        }).filter(Boolean); // Remove any orders that failed to parse

        // If userId is provided, filter orders for that user
        if (userId) {
            return orders.filter(order => order.userId === userId);
        }

        return orders;
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw new Error('Failed to fetch orders');
    }
};

// Get a single order by ID
export const getOrderById = async (orderId) => {
    try {
        const orders = await getOrders();
        const order = orders.find(order => order.orderId === orderId);

        if (!order) {
            throw new Error('Order not found');
        }

        return order;
    } catch (error) {
        console.error(`Error fetching order ${orderId}:`, error);
        throw new Error('Failed to fetch order');
    }
};

// Update order status
export const updateOrderStatus = async (orderId, status) => {
    try {
        const sheets = await getSheetClient();

        // First, find the row of the order in the sheet
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: 'Orders!A:A',
        });

        const rows = response.data.values || [];
        const orderRowIndex = rows.findIndex(row => row[0] === orderId);

        if (orderRowIndex === -1) {
            throw new Error('Order not found');
        }

        // Update the status column (column G, index 6)
        const rowNumber = orderRowIndex + 1; // +1 because sheet rows are 1-indexed
        await sheets.spreadsheets.values.update({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: `Orders!G${rowNumber}`,
            valueInputOption: 'RAW',
            resource: {
                values: [[status]]
            }
        });

        return { success: true };
    } catch (error) {
        console.error(`Error updating order ${orderId} status:`, error);
        throw new Error('Failed to update order status');
    }
};

// Authentication helpers
export const getUserIdFromToken = async (token) => {
    try {
        if (!token) return null;

        // Verify the JWT token
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token.replace('Bearer ', ''), secret);

        return payload.userId;
    } catch (error) {
        console.error('Error verifying JWT token:', error);
        return null;
    }
};

// Check if a user is authorized to view an order
export const isUserAuthorizedForOrder = async (orderId, userId) => {
    try {
        // Admin check could go here
        // if (isAdmin(userId)) return true;

        const order = await getOrderById(orderId);

        // Check if this is the user's order
        return order.userId === userId;
    } catch (error) {
        console.error('Error checking order authorization:', error);
        return false;
    }
};