// src/pages/api/orders/detail.js
import { getOrderById } from '../../../services/orderService';
import { withAuth } from '../../../utils/auth';

// API handler with authentication
async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Get the order ID from query
    const { orderId } = req.query;
    if (!orderId) {
        return res.status(400).json({ error: 'Order ID is required' });
    }

    try {
        // User email is available from the auth middleware
        const userEmail = req.user.email;

        // Get order details using our service
        const order = await getOrderById(orderId, userEmail);

        return res.status(200).json(order);
    } catch (error) {
        console.error('Error fetching order details:', error);

        if (error.message.includes('Order not found')) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (error.message.includes('Access denied')) {
            return res.status(403).json({ error: 'Access denied: This order does not belong to you' });
        }

        return res.status(500).json({ error: 'Failed to fetch order details', details: error.message });
    }
}

// Apply auth middleware
export default withAuth(handler);