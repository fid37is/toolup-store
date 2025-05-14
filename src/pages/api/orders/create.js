// src/pages/api/orders/create.js
import { google } from 'googleapis';

// Set up Google Sheets integration
const getGoogleSheetsClient = async () => {
    try {
        // Load service account credentials from environment variables
        const credentials = JSON.parse(
            Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_KEY, 'base64').toString()
        );

        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const client = await auth.getClient();
        const sheets = google.sheets({ version: 'v4', auth: client });

        return sheets;
    } catch (error) {
        console.error('Failed to initialize Google Sheets client:', error);
        throw new Error('Google Sheets connection failed');
    }
};

// Generate a unique order ID
const generateOrderId = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD-${timestamp}${random}`;
};

// Format order data for Google Sheets
const formatOrderData = (orderId, orderData) => {
    const { items, customer, totalAmount, paymentMethod, shippingFee } = orderData;

    // Format the current date and time
    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const formattedTime = now.toLocaleTimeString('en-US', { hour12: false }); // HH:MM:SS

    // Format items as a JSON string
    const formattedItems = JSON.stringify(items.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity
    })));

    // Create the row for Google Sheets
    return [
        orderId,                              // Order ID
        formattedDate,                        // Order Date
        formattedTime,                        // Order Time
        customer.email,                       // Customer Email
        `${customer.firstName} ${customer.lastName}`, // Customer Name
        customer.phoneNumber,                 // Customer Phone
        `${customer.address}, ${customer.town}, ${customer.lga}, ${customer.state}, ${customer.zip}`, // Customer Address
        customer.additionalInfo || 'None',    // Additional Info
        formattedItems,                       // Order Items
        totalAmount,                          // Total Amount
        shippingFee,                          // Shipping Fee
        paymentMethod,                        // Payment Method
        'Pending'                             // Order Status
    ];
};

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const orderData = req.body;

        // Basic validation
        if (!orderData.items || !orderData.customer || !orderData.totalAmount) {
            return res.status(400).json({ message: 'Invalid order data' });
        }

        // Generate a unique order ID
        const orderId = generateOrderId();

        // Initialize Google Sheets client
        const sheets = await getGoogleSheetsClient();

        // Spreadsheet ID and range
        const spreadsheetId = process.env.GOOGLE_SHEETS_ORDER_SPREADSHEET_ID;
        const range = 'Orders!A:M'; // Adjust based on your spreadsheet structure

        // Format the data for Google Sheets
        const values = [formatOrderData(orderId, orderData)];

        // Append the order to Google Sheets
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption: 'USER_ENTERED',
            resource: { values },
        });

        // Save data to database if needed
        // This would be where you'd add logic to save to your database

        return res.status(200).json({
            success: true,
            orderId,
            message: 'Order created successfully'
        });
    } catch (error) {
        console.error('Order creation error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create order',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}