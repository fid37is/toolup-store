
export const optimizeImageForSocialMedia = (imageUrl) => {
    if (!imageUrl || imageUrl === 'undefined' || !imageUrl.trim()) {
        return '/og-default.jpg'; // fallback image
    }

    // Handle Google Drive URLs
    if (imageUrl.includes('drive.google.com')) {
        const fileIdMatch = imageUrl.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
        if (fileIdMatch) {
            return `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`;
        }
    }

    // Handle relative URLs
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.toolup.store';
    if (imageUrl.startsWith('/')) {
        return `${baseUrl}${imageUrl}`;
    }

    // Handle absolute URLs that don't start with http
    if (!imageUrl.startsWith('http')) {
        return `${baseUrl}/${imageUrl}`;
    }

    return imageUrl;
};

export const generateSocialShareData = (product, baseUrl) => {
    const productUrl = `${baseUrl}/products/${product.id}`;
    const optimizedImage = optimizeImageForSocialMedia(product.imageUrl);
    
    // Enhanced description for better social media engagement
    const price = product.price ? `₦${product.price.toLocaleString()}` : '';
    const stock = product.quantity > 0 ? 'In Stock' : 'Limited Stock';
    const category = product.category ? ` | ${product.category}` : '';
    
    const description = `${product.name}${price ? ` - ${price}` : ''}${category} | ${stock} | Quality tools and equipment at ToolUp Store, Port Harcourt`;

    return {
        // Basic sharing data
        title: `${product.name} | ToolUp Store`,
        description,
        url: productUrl,
        image: optimizedImage,
        
        // Platform-specific optimizations
        whatsapp: {
            text: `🛠️ Check out ${product.name}${price ? ` - Only ${price}` : ''}\n\n${stock} at ToolUp Store! 🚚\n\nShop now: ${productUrl}`,
        },
        twitter: {
            text: `🛠️ ${product.name}${price ? ` - ${price}` : ''}${category}\n\n${stock} ✅\n\n#ToolUpStore #Nigeria #Tools`,
            url: productUrl
        },
        facebook: {
            title: `${product.name} | ToolUp Store`,
            description: `${description}\n\nShop quality tools and equipment in Port Harcourt, Nigeria.`,
            url: productUrl
        },
        linkedin: {
            title: `${product.name} | ToolUp Store - Professional Tools`,
            summary: `Professional quality ${product.name}${price ? ` at ${price}` : ''}. ${stock} and ready for delivery. ToolUp Store - Your trusted partner for quality tools and equipment in Port Harcourt.`,
            url: productUrl
        },
        telegram: {
            text: `🛠️ *${product.name}*${price ? `\n💰 Price: ${price}` : ''}\n📦 ${stock}\n\n${productUrl}`,
            parse_mode: 'Markdown'
        }
    };
};

// Helper to validate image URLs for social media
export const validateSocialImage = async (imageUrl) => {
    if (!imageUrl) return false;
    
    try {
        const response = await fetch(imageUrl, { method: 'HEAD' });
        const contentType = response.headers.get('content-type');
        
        return response.ok && contentType && contentType.startsWith('image/');
    } catch {
        return false;
    }
};

// Generate Open Graph meta tags as a string (useful for server-side rendering)
export const generateOpenGraphTags = (socialData) => {
    const tags = [
        `<meta property="og:title" content="${socialData.title}" />`,
        `<meta property="og:description" content="${socialData.description}" />`,
        `<meta property="og:image" content="${socialData.image}" />`,
        `<meta property="og:url" content="${socialData.url}" />`,
        `<meta property="og:type" content="product" />`,
        `<meta property="og:site_name" content="ToolUp Store" />`,
        `<meta property="og:locale" content="en_NG" />`,
        // WhatsApp specific
        `<meta property="whatsapp:image" content="${socialData.image}" />`,
        `<meta property="whatsapp:title" content="${socialData.title}" />`,
        `<meta property="whatsapp:description" content="${socialData.whatsapp?.text || socialData.description}" />`,
        // Twitter Card
        `<meta name="twitter:card" content="summary_large_image" />`,
        `<meta name="twitter:title" content="${socialData.title}" />`,
        `<meta name="twitter:description" content="${socialData.description}" />`,
        `<meta name="twitter:image" content="${socialData.image}" />`,
    ];
    
    return tags.join('\n');
};