// src/pages/api/products/index.js
import { getProducts } from '../../../utils/sheetsService';

export default async function handler(req, res) {
    try {
        if (req.method !== 'GET') {
            return res.status(405).json({ message: 'Method not allowed' });
        }

        const products = await getProducts();
        return res.status(200).json(products);
    } catch (error) {
        console.error('Error in /api/products:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}