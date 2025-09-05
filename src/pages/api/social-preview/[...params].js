// pages/api/social-preview/[...params].js
export default async function handler(req, res) {
    const { params } = req.query;
    
    // Handle different routes: /api/social-preview/product/[id] or /api/social-preview/home
    if (!params || params.length === 0) {
        return res.status(404).json({ error: 'Invalid route' });
    }
    
    const [type, id] = params;
    
    try {
        let socialData;
        
        if (type === 'product' && id) {
            // Fetch product data
            const productRes = await fetch(`${req.headers.host}/api/products/${id}`);
            if (!productRes.ok) {
                throw new Error('Product not found');
            }
            const product = await productRes.json();
            
            // Generate social media preview data for product
            socialData = {
                title: `${product.name} | ToolUp Store`,
                description: `${product.name} - ₦${product.price?.toLocaleString()} | ${product.category || 'Quality Tools'} | ${product.quantity > 0 ? 'In Stock' : 'Out of Stock'} | ToolUp Store - Professional Tools & Equipment`,
                image: product.imageUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/logo-2.png`,
                url: `${process.env.NEXT_PUBLIC_SITE_URL}/products/${id}`,
                type: 'product',
                price: product.price,
                currency: 'NGN',
                availability: product.quantity > 0 ? 'in stock' : 'out of stock',
                category: product.category || 'Tools',
                brand: 'ToolUp Store'
            };
        } else if (type === 'home') {
            // Generate social media preview data for homepage
            socialData = {
                title: 'ToolUp Store - Premium Tools & Equipment in Port Harcourt',
                description: 'Shop quality electronic gadgets, phones, and accessories for professionals and DIY enthusiasts. Premium tools and equipment delivered across Nigeria.',
                image: `${process.env.NEXT_PUBLIC_SITE_URL}/logo-2.png`,
                url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.toolup.store',
                type: 'website',
                siteName: 'ToolUp Store'
            };
        } else {
            return res.status(404).json({ error: 'Invalid preview type' });
        }
        
        // Return data in a format that social media crawlers can easily parse
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
        
        return res.status(200).json(socialData);
        
    } catch (error) {
        console.error('Social preview error:', error);
        
        // Return fallback data
        const fallbackData = {
            title: 'ToolUp Store - Quality Tools & Equipment',
            description: 'Premium tools and equipment for professionals and enthusiasts in Port Harcourt, Nigeria.',
            image: `${process.env.NEXT_PUBLIC_SITE_URL}/logo-2.png`,
            url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.toolup.store',
            type: 'website'
        };
        
        return res.status(200).json(fallbackData);
    }
}