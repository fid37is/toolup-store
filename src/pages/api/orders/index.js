import { createOrder, getOrderById, getUserIdFromToken } from '@/services/orderService';

export default async function handler(req, res) {
    // Handle different HTTP methods
    switch (req.method) {
        case 'POST':
            return handleCreateOrder(req, res);
        case 'GET':
            return handleGetOrder(req, res);
        default:
            return res.status(405).json({ error: 'Method not allowed' });
    }
}

// Create a new order
async function handleCreateOrder(req, res) {
    try {
        // Get user ID from token if available
        let userId = 'guest';
        const authHeader = req.headers.authorization;

        if (authHeader) {
            const tokenUserId = await getUserIdFromToken(authHeader);
            if (tokenUserId) {
                userId = tokenUserId;
            }
        }

        // Get order data from request body
        const orderData = req.body;

        // Validate required fields
        if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
            return res.status(400).json({ error: 'Order must contain at least one item' });
        }

        if (!orderData.shippingDetails) {
            return res.status(400).json({ error: 'Shipping details are required' });
        }

        // Set the user ID (from token or guest)
        orderData.userId = userId;

        // Set order date if not provided
        if (!orderData.orderDate) {
            orderData.orderDate = new Date().toISOString();
        }

        // Create the order
        const result = await createOrder(orderData);

        return res.status(201).json({
            success: true,
            orderId: result.orderId
        });
    } catch (error) {
        console.error('Error creating order:', error);
        return res.status(500).json({ error: 'Failed to create order' });
    }
}

// Get a specific order by ID
async function handleGetOrder(req, res) {
    try {
        // Get the order ID from the query parameters
        const { orderId } = req.query;

        if (!orderId) {
            return res.status(400).json({ error: 'Order ID is required' });
        }

        // Get the order details
        const order = await getOrderById(orderId);

        return res.status(200).json(order);
    } catch (error) {
        console.error('Error retrieving order:', error);
        return res.status(500).json({ error: 'Failed to retrieve order' });
    }
}