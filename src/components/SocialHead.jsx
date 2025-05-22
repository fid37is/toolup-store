import Head from 'next/head';

export default function SocialHead({
    title,
    description,
    imageUrl,
    url,
    type = 'website',
    siteName = 'ToolUp Store',
    twitterHandle = '@toolupstore', // Replace with your actual Twitter handle
    price,
    currency = 'NGN',
    availability = 'in stock'
}) {
    // Ensure URLs are absolute
    const absoluteImageUrl = imageUrl?.startsWith('http') 
        ? imageUrl 
        : `${process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'}${imageUrl}`;
    
    const absoluteUrl = url?.startsWith('http') 
        ? url 
        : `${process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'}${url}`;

    return (
        <Head>
            {/* Basic Meta Tags */}
            <title>{title}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={absoluteUrl} />

            {/* Open Graph Meta Tags */}
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={absoluteImageUrl} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content={title} />
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
                </>
            )}

            {/* Twitter Card Meta Tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content={twitterHandle} />
            <meta name="twitter:creator" content={twitterHandle} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={absoluteImageUrl} />
            <meta name="twitter:image:alt" content={title} />

            {/* Additional Twitter tags for products */}
            {type === 'product' && price && (
                <>
                    <meta name="twitter:label1" content="Price" />
                    <meta name="twitter:data1" content={`${currency} ${price}`} />
                    <meta name="twitter:label2" content="Availability" />
                    <meta name="twitter:data2" content={availability} />
                </>
            )}

            {/* Facebook App ID (optional - get from Facebook Developers) */}
            {/* <meta property="fb:app_id" content="YOUR_FB_APP_ID" /> */}

            {/* WhatsApp specific (uses Open Graph) */}
            <meta property="og:image:type" content="image/jpeg" />
        </Head>
    );
}