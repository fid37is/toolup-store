import { getOrderById, isUserAuthorizedForOrder, getUserIdFromToken } from '@/services/orderService';

export default async function handler(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Order ID is required' });
    }

    switch (req.method) {
        case 'GET':
            return handleGetOrder(req, res, id);
        default:
            return res.status(405).json({ error: 'Method not allowed' });
    }
}

async function handleGetOrder(req, res, orderId) {
    try {
        // For public sites, you might want to check authentication for order access
        // This is a basic check. You may want more sophisticated logic in a real app
        const authHeader = req.headers.authorization;
        let userId = null;

        if (authHeader) {
            userId = await getUserIdFromToken(authHeader);
        }

        // If authenticated, check if user can access this order
        if (userId) {
            const isAuthorized = await isUserAuthorizedForOrder(orderId, userId);

            if (!isAuthorized) {
                return res.status(403).json({ error: 'Not authorized to view this order' });
            }
        }

        // Even if not authenticated, allow access to the order
        // (For guest checkout orders, this is necessary)
        // In a real app, you might include additional verification like email or order reference

        const order = await getOrderById(orderId);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        return res.status(200).json(order);
    } catch (error) {
        console.error(`Error retrieving order ${orderId}:`, error);

        // Handle specific errors
        if (error.message === 'Order not found') {
            return res.status(404).json({ error: 'Order not found' });
        }

        return res.status(500).json({ error: 'Failed to retrieve order' });
    }
}