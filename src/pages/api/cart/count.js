// src/pages/api/cart/count.js - API endpoint to get cart item count
export default function handler(req, res) {
    try {
        if (req.method !== 'GET') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        // In a real app, this would fetch from a database based on user session
        // Returning a mock count of 0 - frontend will use localStorage count if this fails
        res.status(200).json({ count: 0 });
    } catch (error) {
        console.error('Error fetching cart count:', error);
        res.status(500).json({ error: 'Failed to fetch cart count' });
    }
}