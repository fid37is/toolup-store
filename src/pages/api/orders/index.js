import { placeOrder, fetchOrders } from '@/services/orderService';

export default async function handler(req, res) {
    try {
        if (req.method === 'POST') {
            const result = await placeOrder(req.body);
            return res.status(200).json(result);
        }

        if (req.method === 'GET') {
            const orders = await fetchOrders();
            return res.status(200).json(orders);
        }

        return res.status(405).json({ message: 'Method Not Allowed' });
    } catch (err) {
        console.error('Order API error:', err);
        res.status(500).json({ message: 'Server error' });
    }
}
