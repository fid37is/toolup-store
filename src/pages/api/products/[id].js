// src/pages/api/products/[id].js
export const runtime = "nodejs";
export default async function handler(req, res) {
    const { id } = req.query;

    try {
        // First, fetch all products from your main API endpoint
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/products`);

        if (!response.ok) {
            throw new Error(`Error fetching products: ${response.status}`);
        }

        const products = await response.json();

        // Find the product with the matching ID
        const product = products.find(p => p.id === id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        return res.status(200).json(product);
    } catch (error) {
        console.error('API error fetching product:', error);
        return res.status(500).json({ error: 'Failed to fetch product' });
    }
}