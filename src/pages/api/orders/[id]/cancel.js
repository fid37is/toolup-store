import { cancelOrderById } from '@/services/orderService';

export default async function handler(req, res) {
    try {
        if (req.method !== 'POST') {
            return res.status(405).json({ message: 'Method Not Allowed' });
        }

        const { id } = req.query;
        const result = await cancelOrderById(id);

        if (!result.success) {
            return res.status(404).json({ message: result.message });
        }

        return res.status(200).json({ message: result.message });
    } catch (err) {
        console.error('Cancel order error:', err);
        res.status(500).json({ message: 'Server error' });
    }
}
