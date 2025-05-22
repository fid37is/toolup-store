// src/utils/socialUtils.js - Utilities for social sharing
export const generateProductSocialData = (product, router) => {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';
    const productUrl = `${baseUrl}${router.asPath}`;
    
    // Generate rich description
    const description = product.description || 
        `${product.name} - Premium quality ${product.category || 'tool'} available at ToolUp Store. ` +
        `Starting from ₦${product.price?.toLocaleString() || 'N/A'}. ` +
        `${product.quantity > 0 ? 'In stock and ready to ship!' : 'Contact us for availability.'}`;

    return {
        title: `${product.name} | ToolUp Store`,
        description: description.slice(0, 160), // Optimal length for social platforms
        imageUrl: product.imageUrl,
        url: productUrl,
        type: 'product',
        price: product.price,
        availability: product.quantity > 0 ? 'in stock' : 'out of stock'
    };
};

export const generateStoreSocialData = () => {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';
    
    return {
        title: 'ToolUp Store - Premium Tools & Equipment',
        description: 'Discover premium quality tools and equipment at ToolUp Store. From professional-grade tools to everyday essentials, we have everything you need at competitive prices.',
        imageUrl: '/og-image-store.jpg', // Create a branded store image
        url: baseUrl,
        type: 'website'
    };
};
