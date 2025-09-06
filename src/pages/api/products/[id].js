export default async function handler(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Product ID is required' });
    }

    try {
        // Set CORS headers for external access
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET');
        
        // Determine the correct API URL
        const baseUrl = process.env.NODE_ENV === 'production' 
            ? (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.toolup.store')
            : 'http://localhost:3000';
            
        const response = await fetch(`${baseUrl}/api/products`);

        if (!response.ok) {
            throw new Error(`Error fetching products: ${response.status}`);
        }

        const products = await response.json();
        const product = products.find(p => p.id === id || p.slug === id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Process image URL for social media compatibility
        let processedImageUrl = product.imageUrl;
        
        if (processedImageUrl && processedImageUrl.includes('drive.google.com')) {
            const fileIdMatch = processedImageUrl.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
            if (fileIdMatch) {
                processedImageUrl = `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`;
            }
        }

        // Return enhanced product data
        const enhancedProduct = {
            ...product,
            imageUrl: processedImageUrl,
            absoluteImageUrl: processedImageUrl?.startsWith('http') 
                ? processedImageUrl 
                : `${baseUrl}${processedImageUrl || '/logo-2.png'}`,
            productUrl: `${baseUrl}/product/${id}`,
            shareUrl: `${baseUrl}/product/${id}`
        };

        // Cache the response
        res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
        
        return res.status(200).json(enhancedProduct);
    } catch (error) {
        console.error('API error fetching product:', error);
        return res.status(500).json({ error: 'Failed to fetch product' });
    }
}