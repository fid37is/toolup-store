import Head from 'next/head';

export default function SocialHead({
    title,
    description,
    imageUrl,
    url,
    type = 'website',
    siteName = 'ToolUp Store',
    twitterHandle = '@toolupstore',
    price,
    currency = 'NGN',
    availability = 'in stock',
    productCategory,
    brand = 'ToolUp Store'
}) {
    // Ensure we have a proper base URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.toolup.store';
    
    // Ensure URLs are absolute and properly formatted
    const absoluteImageUrl = imageUrl?.startsWith('http') 
        ? imageUrl 
        : `${baseUrl}${imageUrl || '/og-default.jpg'}`;
    
    const absoluteUrl = url?.startsWith('http') 
        ? url 
        : `${baseUrl}${url || ''}`;

    // Ensure description is optimal length and ends properly
    const cleanDescription = description?.length > 160 
        ? `${description.substring(0, 157)}...`
        : description || `Discover quality tools at ${siteName}`;

    // Generate structured data for better SEO
    const structuredData = {
        "@context": "https://schema.org",
        "@type": type === 'product' ? 'Product' : 'WebSite',
        "name": title,
        "description": cleanDescription,
        "url": absoluteUrl,
        "image": absoluteImageUrl,
        ...(type === 'product' && price && {
            "brand": {
                "@type": "Brand",
                "name": brand
            },
            "category": productCategory,
            "offers": {
                "@type": "Offer",
                "price": price,
                "priceCurrency": currency,
                "availability": availability === 'in stock' 
                    ? "https://schema.org/InStock" 
                    : "https://schema.org/OutOfStock",
                "seller": {
                    "@type": "Organization",
                    "name": siteName
                }
            }
        })
    };

    return (
        <Head>
            {/* Essential Meta Tags */}
            <title>{title}</title>
            <meta name="description" content={cleanDescription} />
            <meta name="robots" content="index, follow" />
            <link rel="canonical" href={absoluteUrl} />

            {/* Open Graph Meta Tags - Essential for Facebook, WhatsApp, LinkedIn */}
            <meta property="og:title" content={title} />
            <meta property="og:description" content={cleanDescription} />
            <meta property="og:image" content={absoluteImageUrl} />
            <meta property="og:image:secure_url" content={absoluteImageUrl} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content={title} />
            <meta property="og:image:type" content="image/png" />
            <meta property="og:url" content={absoluteUrl} />
            <meta property="og:type" content={type} />
            <meta property="og:site_name" content={siteName} />
            <meta property="og:locale" content="en_US" />

            {/* Product-specific Open Graph tags */}
            {type === 'product' && price && (
                <>
                    <meta property="product:price:amount" content={price} />
                    <meta property="product:price:currency" content={currency} />
                    <meta property="product:availability" content={availability} />
                    <meta property="product:brand" content={brand} />
                    {productCategory && <meta property="product:category" content={productCategory} />}
                </>
            )}

            {/* Twitter Card Meta Tags - Essential for Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content={twitterHandle} />
            <meta name="twitter:creator" content={twitterHandle} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={cleanDescription} />
            <meta name="twitter:image" content={absoluteImageUrl} />
            <meta name="twitter:image:alt" content={title} />

            {/* Additional Twitter tags for products */}
            {type === 'product' && price && (
                <>
                    <meta name="twitter:label1" content="Price" />
                    <meta name="twitter:data1" content={`${currency} ${price?.toLocaleString()}`} />
                    <meta name="twitter:label2" content="Availability" />
                    <meta name="twitter:data2" content={availability} />
                </>
            )}

            {/* Telegram specific meta tags */}
            <meta property="telegram:image" content={absoluteImageUrl} />

            {/* Additional meta tags for better social sharing */}
            <meta name="theme-color" content="#2563EB" />
            <meta name="apple-mobile-web-app-title" content={siteName} />
            <meta name="application-name" content={siteName} />

            {/* Structured Data for rich snippets */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(structuredData)
                }}
            />

            {/* Facebook App ID (uncomment and add your actual app ID) */}
            {/* <meta property="fb:app_id" content="YOUR_FB_APP_ID" /> */}
        </Head>
    );
}