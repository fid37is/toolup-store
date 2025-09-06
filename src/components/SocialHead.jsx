// components/SocialHead.js
import Head from 'next/head';

const SocialHead = ({ 
    title,
    description,
    imageUrl,
    url,
    type = 'website',
    price,
    currency,
    availability,
    productCategory,
    brand,
    siteName = 'ToolUp Store'
}) => {
    // Ensure URLs are absolute
    const absoluteImageUrl = imageUrl?.startsWith('http') 
        ? imageUrl 
        : `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.toolup.store'}${imageUrl || '/logo-2.png'}`;
    
    const absoluteUrl = url?.startsWith('http') 
        ? url 
        : `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.toolup.store'}${url || ''}`;
    
    // Clean and validate data
    const cleanTitle = title?.replace(/[^\w\s\-|.]/g, '') || 'ToolUp Store';
    const cleanDescription = description?.replace(/[^\w\s\-.,!?]/g, '') || 'Quality tools and equipment';
    
    return (
        <Head>
            {/* Primary Meta Tags */}
            <title>{cleanTitle}</title>
            <meta name="title" content={cleanTitle} />
            <meta name="description" content={cleanDescription} />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            
            {/* Canonical URL */}
            <link rel="canonical" href={absoluteUrl} />
            
            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={absoluteUrl} />
            <meta property="og:title" content={cleanTitle} />
            <meta property="og:description" content={cleanDescription} />
            <meta property="og:image" content={absoluteImageUrl} />
            <meta property="og:image:secure_url" content={absoluteImageUrl} />
            <meta property="og:image:type" content="image/png" />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content={cleanTitle} />
            <meta property="og:site_name" content={siteName} />
            <meta property="og:locale" content="en_US" />
            
            {/* Product-specific Open Graph tags */}
            {type === 'product' && price && (
                <>
                    <meta property="product:price:amount" content={price} />
                    <meta property="product:price:currency" content={currency || 'NGN'} />
                    <meta property="product:availability" content={availability || 'in stock'} />
                    <meta property="product:condition" content="new" />
                    {productCategory && <meta property="product:category" content={productCategory} />}
                    {brand && <meta property="product:brand" content={brand} />}
                </>
            )}
            
            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content="@ToolUpStore" />
            <meta name="twitter:creator" content="@ToolUpStore" />
            <meta name="twitter:url" content={absoluteUrl} />
            <meta name="twitter:title" content={cleanTitle} />
            <meta name="twitter:description" content={cleanDescription} />
            <meta name="twitter:image" content={absoluteImageUrl} />
            <meta name="twitter:image:alt" content={cleanTitle} />
            
            {/* WhatsApp specific */}
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            
            {/* Telegram specific */}
            <meta property="tg:site_verification" content="ToolUpStore" />
            
            {/* Additional SEO */}
            <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
            <meta name="author" content="ToolUp Store" />
            <meta name="publisher" content="ToolUp Store" />
            <meta name="application-name" content="ToolUp Store" />
            
            {/* Structured Data - JSON-LD */}
            <script 
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": type === 'product' ? 'Product' : 'Organization',
                        ...(type === 'product' ? {
                            name: cleanTitle,
                            image: absoluteImageUrl,
                            description: cleanDescription,
                            brand: {
                                "@type": "Brand",
                                name: brand || "ToolUp Store"
                            },
                            offers: {
                                "@type": "Offer",
                                url: absoluteUrl,
                                priceCurrency: currency || "NGN",
                                price: price,
                                availability: availability === 'in stock' 
                                    ? "https://schema.org/InStock" 
                                    : "https://schema.org/OutOfStock",
                                seller: {
                                    "@type": "Organization",
                                    name: "ToolUp Store"
                                }
                            }
                        } : {
                            name: siteName,
                            url: absoluteUrl,
                            logo: absoluteImageUrl,
                            description: cleanDescription,
                            sameAs: [
                                "https://facebook.com/toolupstore",
                                "https://twitter.com/toolupstore",
                                "https://instagram.com/toolupstore"
                            ]
                        })
                    })
                }}
            />
            
            {/* Preload critical resources */}
            <link rel="preload" href={absoluteImageUrl} as="image" />
            
            {/* Favicon and app icons */}
            <link rel="icon" href="/favicon.ico" />
            <link rel="apple-touch-icon" href="/logo-2.png" />
            
            {/* Theme color for mobile browsers */}
            <meta name="theme-color" content="#1f2937" />
            <meta name="msapplication-TileColor" content="#1f2937" />
        </Head>
    );
};

export default SocialHead;