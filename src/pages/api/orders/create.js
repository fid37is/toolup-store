// src/pages/api/orders/create.js
import { generateOrderId, createOrder } from '../../../services/orderService';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { items, customer, isAuthenticated, shippingFee, paymentMethod, totalAmount, currency } = req.body;

        // Validate required fields
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Order must include items' });
        }

        if (!customer) {
            return res.status(400).json({ error: 'Customer information is required' });
        }

        // Generate a unique order ID
        const orderId = generateOrderId();
        const orderDate = new Date().toISOString();

        // Prepare order data for Google Sheets
        const orderValues = [
            [
                orderId,
                orderDate,
                `${customer.firstName} ${customer.lastName}`,
                customer.email,
                customer.phoneNumber,
                customer.address,
                customer.city || '',
                customer.state || '',
                customer.lga || '',
                customer.town || '',
                customer.zip || '',
                customer.additionalInfo || '',
                paymentMethod || 'card',
                (shippingFee || 0).toString(),
                (totalAmount || 0).toString(),
                currency || 'NGN',
                isAuthenticated ? 'Yes' : 'No',
                'Pending' // Initial order status
            ]
        ];

        // Prepare order items data
        const orderItemsValues = items.map(item => [
            orderId,
            item.productId || '',
            item.name || '',
            (item.quantity || 1).toString(),
            ((item.price || 0) * 800).toString(), // Convert to Naira using rate
            (((item.price || 0) * (item.quantity || 1)) * 800).toString(), // Subtotal in Naira
            orderDate
        ]);

        // Create the order using the service
        await createOrder({
            orderId,
            orderValues,
            orderItemsValues
        });

        // Return success response with the order ID
        return res.status(200).json({
            success: true,
            message: 'Order created successfully',
            order: {
                orderId,
                orderDate,
                status: 'Pending'
            }
        });

    } catch (error) {
        console.error('Error creating order:', error);
        return res.status(500).json({ error: 'Failed to create order', details: error.message });
    }
}