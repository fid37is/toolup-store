export const generateProductSocialData = (product, router, baseUrl) => {
    // Handle undefined baseUrl with proper fallback
    const safeBaseUrl = baseUrl || 
                        process.env.NEXT_PUBLIC_SITE_URL || 
                        (typeof window !== 'undefined' ? window.location.origin : 'https://www.toolup.store');
    
    const productUrl = `${safeBaseUrl}${router.asPath}`;
    
    // Generate rich description with better formatting
    const description = product.description ? 
        `${product.description.slice(0, 100)}...` :
        `Premium ${product.category || 'tool'} available at ToolUp Store. ` +
        `${product.price ? `Starting from ₦${product.price.toLocaleString()}. ` : ''}` +
        `${product.quantity > 0 ? 'In stock and ready to ship!' : 'Contact us for availability.'}`;

    // Generate OG image URL with proper encoding
    const ogParams = new URLSearchParams({
        title: product.name,
        price: product.price?.toString() || '',
        image: product.imageUrl || '',
        category: product.category || ''
    });
    
    const ogImageUrl = `${safeBaseUrl}/api/og?${ogParams.toString()}`;

    return {
        title: `${product.name} | ToolUp Store`,
        description: description.slice(0, 160),
        imageUrl: ogImageUrl,
        url: productUrl,
        type: 'product',
        price: product.price,
        currency: 'NGN',
        availability: product.quantity > 0 ? 'in stock' : 'out of stock',
        productCategory: product.category,
        brand: 'ToolUp Store'
    };
};

export const generateStoreSocialData = (baseUrl) => {
    // Handle undefined baseUrl with proper fallback
    const safeBaseUrl = baseUrl || 
                        process.env.NEXT_PUBLIC_SITE_URL || 
                        (typeof window !== 'undefined' ? window.location.origin : 'https://www.toolup.store');
    
    return {
        title: 'ToolUp Store - Premium Gadgets & Phone Acccessories',
        description: 'Discover premium quality gadgets and phone accessories at ToolUp Store. From professional-grade gadgets to everyday essentials, we have everything you need at competitive prices.',
        imageUrl: `${safeBaseUrl}/api/og?title=ToolUp Store&category=Premium Tools`,
        url: safeBaseUrl,
        type: 'website'
    };
};