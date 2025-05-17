// src/pages/api/orders/[orderId].js
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

    const { orderId } = req.query;

    if (!orderId) {
        return res.status(400).json({ error: 'Order ID is required' });
    }

    try {
        await authorizeJwtClient();
        const sheets = getSheets();
        const sheetId = process.env.GOOGLE_SHEET_ID;

        // Fetch order details from Orders sheet
        const orderResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'Orders!A:R',
        });

        const orderRows = orderResponse.data.values || [];
        const orderHeaders = orderRows[0];

        // Find the order by ID
        const orderRow = orderRows.slice(1).find(row => row[0] === orderId);

        if (!orderRow) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Create order object from row
        const order = {};
        orderHeaders.forEach((header, index) => {
            order[header] = orderRow[index] || '';
        });

        // Fetch order items from OrderItems sheet
        const itemsResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'OrderItems!A:R',
        });

        const itemRows = itemsResponse.data.values || [];
        const itemHeaders = itemRows[0];

        // Filter items by order ID
        const orderItemRows = itemRows.slice(1).filter(row => row[0] === orderId);

        // Map item rows to objects
        const orderItems = orderItemRows.map(row => {
            const item = {};
            itemHeaders.forEach((header, index) => {
                item[header] = row[index] || '';
            });
            return item;
        });

        // Fetch products to get image URLs
        const productsResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'Inventory!A:K',
        });

        const productRows = productsResponse.data.values || [];
        const productHeaders = productRows[0];

        // Create product map for easy lookup
        const products = {};
        productRows.slice(1).forEach(row => {
            const product = {};
            productHeaders.forEach((header, index) => {
                product[header] = row[index] || '';
            });
            products[product.id] = product;
        });

        // Add image URLs to items based on product ID
        const itemsWithImages = orderItems.map(item => {
            const product = products[item.productId];
            return {
                ...item,
                imageUrl: product ? product.imageUrl : null,
            };
        });

        // Format response
        const response = {
            orderId: order.orderId,
            orderDate: order.orderDate,
            status: order.status,
            total: parseInt(order.totalAmount),
            paymentMethod: order.paymentMethod,
            shippingDetails: {
                fullName: order.customerName,
                email: order.customerEmail,
                phone: order.customerPhone,
                address: order.shippingAddress,
                state: order.state,
                lga: order.lga,
                town: order.town,
                zip: order.zip,
                additionalInfo: order.additionalInfo
            },
            items: itemsWithImages.map(item => ({
                productId: item.productId,
                name: item.productName,
                quantity: parseInt(item.quantity),
                price: parseInt(item.price),
                imageUrl: item.imageUrl
            }))
        };

        return res.status(200).json(response);

    } catch (error) {
        console.error('Error fetching order:', error);
        return res.status(500).json({ error: 'Failed to fetch order', details: error.message });
    }
}