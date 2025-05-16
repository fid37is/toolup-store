// src/pages/api/orders/user.js
import { getUserOrders } from '../../../services/orderService';
import { withAuth } from '../../../utils/auth';

// API handler with authentication
async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // User email is available from the auth middleware
        const userEmail = req.user.email;

        // Get all orders for this user using our service
        const orders = await getUserOrders(userEmail);

        return res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        return res.status(500).json({ error: 'Failed to fetch orders', details: error.message });
    }
}

// Apply auth middleware
export default withAuth(handler);