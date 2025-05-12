// src/pages/api/products/[id].js
import { getProductById } from '../../../utils/sheetsService';

export default async function handler(req, res) {
    try {
        if (req.method !== 'GET') {
            return res.status(405).json({ message: 'Method not allowed' });
        }

        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ message: 'Product ID is required' });
        }

        const product = await getProductById(id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        return res.status(200).json(product);
    } catch (error) {
        console.error(`Error in /api/products/${req.query.id}:`, error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}