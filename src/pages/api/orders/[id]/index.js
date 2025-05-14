import { fetchOrderById } from '@/services/orderService';

export default async function handler(req, res) {
    try {
        const { id } = req.query;
        const order = await fetchOrderById(id);

        if (!order) return res.status(404).json({ message: 'Order not found' });

        return res.status(200).json(order);
    } catch (err) {
        console.error('Fetch single order error:', err);
        res.status(500).json({ message: 'Server error' });
    }
}
