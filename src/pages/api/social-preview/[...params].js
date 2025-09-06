// pages/api/social-preview/[...params].js
export default async function handler(req, res) {
    const { params } = req.query;
    
    // Handle different routes
    if (!params || params.length === 0) {
        return res.status(404).json({ error: 'Invalid route' });
    }
    
    const [type, id] = params;
    
    try {
        let socialData;
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.toolup.store';
        
        if (type === 'product' && id) {
            // Fix: Use the correct internal API URL structure
            const apiUrl = process.env.NODE_ENV === 'production' 
                ? `${baseUrl}/api/product/${id}`
                : `http://localhost:3000/api/product/${id}`;
                
            const productRes = await fetch(apiUrl);
            
            if (!productRes.ok) {
                throw new Error('Product not found');
            }
            
            const product = await productRes.json();
            
            // Enhanced product social data
            socialData = {
                title: `${product.name} | ToolUp Store - Premium Tools`,
                description: `${product.name} - ${product.price ? `₦${product.price.toLocaleString()}` : 'Price on request'} | ${product.category || 'Quality Tools'} | ${product.quantity > 0 ? 'In Stock' : 'Limited Availability'} | Professional tools and equipment at ToolUp Store, Port Harcourt.`,
                image: product.imageUrl || `${baseUrl}/logo-2.png`,
                url: `${baseUrl}/product/${id}`, // Match your working route structure
                type: 'product',
                price: product.price,
                currency: 'NGN',
                availability: product.quantity > 0 ? 'in stock' : 'out of stock',
                category: product.category || 'Tools',
                brand: 'ToolUp Store',
                siteName: 'ToolUp Store'
            };
            
            // Generate HTML preview for social crawlers
            const html = generateProductPreviewHTML(socialData);
            
            // If this is a crawler request, return HTML
            const userAgent = req.headers['user-agent'] || '';
            const isCrawler = /facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegram/i.test(userAgent);
            
            if (isCrawler || req.query.format === 'html') {
                res.setHeader('Content-Type', 'text/html');
                return res.send(html);
            }
            
        } else if (type === 'home') {
            socialData = {
                title: 'ToolUp Store - Premium Tools & Equipment in Port Harcourt',
                description: 'Shop quality electronic gadgets, phones, and professional tools for experts and DIY enthusiasts. Premium equipment delivered across Nigeria with warranty support.',
                image: `${baseUrl}/logo-2.png`,
                url: baseUrl,
                type: 'website',
                siteName: 'ToolUp Store'
            };
        } else {
            return res.status(404).json({ error: 'Invalid preview type' });
        }
        
        // Set proper caching headers
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
        res.setHeader('Access-Control-Allow-Origin', '*');
        
        return res.status(200).json(socialData);
        
    } catch (error) {
        console.error('Social preview error:', error);
        
        // Robust fallback
        const fallbackData = {
            title: 'ToolUp Store - Quality Tools & Equipment',
            description: 'Premium tools and equipment for professionals and enthusiasts in Port Harcourt, Nigeria. Shop with confidence.',
            image: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.toolup.store'}/logo-2.png`,
            url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.toolup.store',
            type: 'website',
            siteName: 'ToolUp Store'
        };
        
        return res.status(200).json(fallbackData);
    }
}

// Helper function to generate HTML preview for crawlers
function generateProductPreviewHTML(socialData) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Primary Meta Tags -->
    <title>${socialData.title}</title>
    <meta name="title" content="${socialData.title}">
    <meta name="description" content="${socialData.description}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="${socialData.type}">
    <meta property="og:url" content="${socialData.url}">
    <meta property="og:title" content="${socialData.title}">
    <meta property="og:description" content="${socialData.description}">
    <meta property="og:image" content="${socialData.image}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="${socialData.siteName}">
    <meta property="og:locale" content="en_US">
    
    <!-- Product specific tags -->
    ${socialData.type === 'product' ? `
    <meta property="product:price:amount" content="${socialData.price}">
    <meta property="product:price:currency" content="${socialData.currency}">
    <meta property="product:availability" content="${socialData.availability}">
    <meta property="product:category" content="${socialData.category}">
    <meta property="product:brand" content="${socialData.brand}">
    ` : ''}
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${socialData.url}">
    <meta property="twitter:title" content="${socialData.title}">
    <meta property="twitter:description" content="${socialData.description}">
    <meta property="twitter:image" content="${socialData.image}">
    <meta name="twitter:site" content="@ToolUpStore">
    
    <!-- WhatsApp -->
    <meta property="og:image:alt" content="${socialData.title}">
    
    <!-- Additional SEO -->
    <link rel="canonical" href="${socialData.url}">
    <meta name="robots" content="index, follow">
    
    <!-- Redirect to actual page after a brief moment -->
    <meta http-equiv="refresh" content="0;url=${socialData.url}">
</head>
<body>
    <h1>${socialData.title}</h1>
    <p>${socialData.description}</p>
    <img src="${socialData.image}" alt="${socialData.title}" style="max-width: 100%; height: auto;">
    <p><a href="${socialData.url}">View Product</a></p>
</body>
</html>`;
}