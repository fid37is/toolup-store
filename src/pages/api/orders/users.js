import { getOrders, getUserIdFromToken } from '@/services/orderService';

export default async function handler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Extract the auth token from the request header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Get user ID from the token
        const userId = await getUserIdFromToken(authHeader);

        if (!userId) {
            return res.status(401).json({ error: 'Invalid authentication token' });
        }

        // Fetch the user's orders
        const orders = await getOrders(userId);

        // Sort orders by date (newest first)
        orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

        return res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching user orders:', error);
        return res.status(500).json({ error: 'Failed to fetch orders' });
    }
}