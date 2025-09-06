export default async function handler(req, res) {
    const { id } = req.query;
    
    try {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.toolup.store';
        
        // Fetch product data
        const productRes = await fetch(`${baseUrl}/api/products/${id}`);
        
        if (!productRes.ok) {
            throw new Error('Product not found');
        }
        
        const product = await productRes.json();
        
        // Generate optimized social media data
        const socialData = {
            title: `${product.name} | ToolUp Store`,
            description: `${product.name} - ₦${product.price?.toLocaleString() || 'Contact for price'} | ${product.category || 'Quality Tools'} | ${Number(product.quantity) > 0 ? 'In Stock' : 'Limited Stock'} | Premium tools at ToolUp Store, Port Harcourt`,
            image: product.absoluteImageUrl || `${baseUrl}/logo-2.png`,
            url: `${baseUrl}/product/${id}`,
            type: 'product',
            price: product.price,
            currency: 'NGN',
            availability: Number(product.quantity) > 0 ? 'in stock' : 'out of stock',
            category: product.category,
            brand: 'ToolUp Store'
        };
        
        // Check if request is from social media crawler
        const userAgent = req.headers['user-agent'] || '';
        const socialCrawlers = [
            'facebookexternalhit',
            'Facebot',
            'Twitterbot',
            'WhatsApp',
            'TelegramBot',
            'LinkedInBot',
            'SkypeUriPreview'
        ];
        
        const isCrawler = socialCrawlers.some(crawler => 
            userAgent.toLowerCase().includes(crawler.toLowerCase())
        );
        
        if (isCrawler) {
            // Return HTML with meta tags for crawlers
            const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${socialData.title}</title>
    <meta property="og:title" content="${socialData.title}" />
    <meta property="og:description" content="${socialData.description}" />
    <meta property="og:image" content="${socialData.image}" />
    <meta property="og:url" content="${socialData.url}" />
    <meta property="og:type" content="product" />
    <meta property="og:site_name" content="ToolUp Store" />
    <meta property="product:price:amount" content="${socialData.price}" />
    <meta property="product:price:currency" content="${socialData.currency}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${socialData.title}" />
    <meta name="twitter:description" content="${socialData.description}" />
    <meta name="twitter:image" content="${socialData.image}" />
    <meta http-equiv="refresh" content="0;url=${socialData.url}" />
</head>
<body>
    <h1>${socialData.title}</h1>
    <p>${socialData.description}</p>
    <a href="${socialData.url}">View Product</a>
</body>
</html>`;
            
            res.setHeader('Content-Type', 'text/html');
            return res.send(html);
        }
        
        // Return JSON for regular requests
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'public, s-maxage=3600');
        return res.status(200).json(socialData);
        
    } catch (error) {
        console.error('Social meta error:', error);
        return res.status(500).json({ error: 'Failed to generate social data' });
    }
}