/* eslint-disable @typescript-eslint/no-unused-vars */
// src/pages/api/products.js
import { fetchProducts } from '@/services/productService';

export default async function handler(req, res) {
    try {
        const products = await fetchProducts();
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching products' });
    }
}