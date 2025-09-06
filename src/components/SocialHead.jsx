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
    brand = 'ToolUp Store',
    keywords,
    author = 'ToolUp Store',
    locale = 'en_NG',
    alternateLocale = 'en_US',
    productSKU,
    productCondition = 'new',
    rating,
    ratingCount,
    publishedTime,
    modifiedTime,
    section,
    tags = []
}) {
    // Ensure we have proper URLs
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.toolup.store';
    
    // Clean and validate URLs
    const absoluteImageUrl = imageUrl?.startsWith('http') 
        ? imageUrl 
        : imageUrl?.startsWith('/') 
            ? `${baseUrl}${imageUrl}`
            : `${baseUrl}/${imageUrl || 'og-default.jpg'}`;
    
    const absoluteUrl = url?.startsWith('http') 
        ? url 
        : url?.startsWith('/')
            ? `${baseUrl}${url}`
            : `${baseUrl}/${url || ''}`;

    // Optimize description for different platforms
    const shortDescription = description?.length > 160 
        ? `${description.substring(0, 157)}...`
        : description || `Discover quality tools and equipment at ${siteName}. Professional-grade products for all your needs.`;
    
    const longDescription = description?.length > 320 
        ? `${description.substring(0, 317)}...`
        : description || shortDescription;

    // Generate comprehensive structured data
    const structuredData = {
        "@context": "https://schema.org",
        "@type": type === 'product' ? 'Product' : 'WebSite',
        "name": title,
        "description": shortDescription,
        "url": absoluteUrl,
        "image": absoluteImageUrl,
        ...(type === 'product' && {
            "@id": absoluteUrl,
            "sku": productSKU || `TOOL-${Date.now()}`,
            "brand": {
                "@type": "Brand",
                "name": brand
            },
            "category": productCategory,
            "itemCondition": `https://schema.org/${productCondition.charAt(0).toUpperCase() + productCondition.slice(1)}Condition`,
            ...(rating && {
                "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": rating,
                    "reviewCount": ratingCount || 1
                }
            }),
            "offers": {
                "@type": "Offer",
                "url": absoluteUrl,
                "price": price,
                "priceCurrency": currency,
                "availability": availability === 'in stock' 
                    ? "https://schema.org/InStock" 
                    : availability === 'out of stock'
                        ? "https://schema.org/OutOfStock"
                        : "https://schema.org/LimitedAvailability",
                "seller": {
                    "@type": "Organization",
                    "name": siteName,
                    "url": baseUrl,
                    "logo": `${baseUrl}/logo-2.png`
                },
                "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                "itemCondition": `https://schema.org/${productCondition.charAt(0).toUpperCase() + productCondition.slice(1)}Condition`,
                "shippingDetails": {
                    "@type": "OfferShippingDetails",
                    "shippingRate": {
                        "@type": "MonetaryAmount",
                        "value": "0",
                        "currency": currency
                    },
                    "shippingDestination": {
                        "@type": "DefinedRegion",
                        "addressCountry": "NG"
                    },
                    "deliveryTime": {
                        "@type": "ShippingDeliveryTime",
                        "handlingTime": {
                            "@type": "QuantitativeValue",
                            "minValue": 0,
                            "maxValue": 1,
                            "unitCode": "DAY"
                        },
                        "transitTime": {
                            "@type": "QuantitativeValue",
                            "minValue": 1,
                            "maxValue": 5,
                            "unitCode": "DAY"
                        }
                    }
                }
            }
        }),
        ...(type === 'website' && {
            "potentialAction": {
                "@type": "SearchAction",
                "target": `${baseUrl}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string"
            },
            "publisher": {
                "@type": "Organization",
                "name": siteName,
                "logo": {
                    "@type": "ImageObject",
                    "url": `${baseUrl}/logo-2.png`
                }
            }
        })
    };

    // BreadcrumbList structured data
    const breadcrumbData = type === 'product' && productCategory ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": baseUrl
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": productCategory,
                "item": `${baseUrl}/category/${productCategory.toLowerCase().replace(/\s+/g, '-')}`
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": title,
                "item": absoluteUrl
            }
        ]
    } : null;

    // Generate keywords
    const defaultKeywords = [
        'tools', 'equipment', 'professional tools', 'Port Harcourt', 'Nigeria',
        'toolup store', 'quality tools', 'hardware', 'construction tools'
    ];
    
    const productKeywords = type === 'product' ? [
        title.toLowerCase(),
        productCategory?.toLowerCase(),
        brand?.toLowerCase(),
        ...tags
    ].filter(Boolean) : [];
    
    const allKeywords = [...new Set([...productKeywords, ...defaultKeywords, ...(keywords || [])])];

    return (
        <Head>
            {/* Primary Meta Tags */}
            <title>{title}</title>
            <meta name="title" content={title} />
            <meta name="description" content={shortDescription} />
            <meta name="keywords" content={allKeywords.join(', ')} />
            <meta name="author" content={author} />
            <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
            <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
            <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
            <link rel="canonical" href={absoluteUrl} />
            
            {/* Alternate language versions */}
            <link rel="alternate" hrefLang={locale} href={absoluteUrl} />
            {alternateLocale && <link rel="alternate" hrefLang={alternateLocale} href={absoluteUrl} />}
            <link rel="alternate" hrefLang="x-default" href={absoluteUrl} />

            {/* Open Graph / Facebook Meta Tags */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={absoluteUrl} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={longDescription} />
            <meta property="og:image" content={absoluteImageUrl} />
            <meta property="og:image:secure_url" content={absoluteImageUrl} />
            <meta property="og:image:type" content="image/png" />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content={title} />
            <meta property="og:site_name" content={siteName} />
            <meta property="og:locale" content={locale} />
            {alternateLocale && <meta property="og:locale:alternate" content={alternateLocale} />}
            
            {/* Article metadata for blog posts */}
            {publishedTime && <meta property="article:published_time" content={publishedTime} />}
            {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
            {section && <meta property="article:section" content={section} />}
            {tags.length > 0 && tags.map((tag, index) => (
                <meta key={index} property="article:tag" content={tag} />
            ))}

            {/* Product-specific Open Graph tags */}
            {type === 'product' && (
                <>
                    <meta property="product:price:amount" content={price} />
                    <meta property="product:price:currency" content={currency} />
                    <meta property="product:availability" content={availability} />
                    <meta property="product:condition" content={productCondition} />
                    <meta property="product:brand" content={brand} />
                    {productCategory && <meta property="product:category" content={productCategory} />}
                    {productSKU && <meta property="product:retailer_item_id" content={productSKU} />}
                    {rating && <meta property="product:rating" content={rating} />}
                </>
            )}

            {/* Twitter Card Meta Tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={absoluteUrl} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={shortDescription} />
            <meta name="twitter:image" content={absoluteImageUrl} />
            <meta name="twitter:image:alt" content={title} />
            <meta name="twitter:site" content={twitterHandle} />
            <meta name="twitter:creator" content={twitterHandle} />
            
            {/* Twitter product labels */}
            {type === 'product' && price && (
                <>
                    <meta name="twitter:label1" content="Price" />
                    <meta name="twitter:data1" content={`₦${price?.toLocaleString('en-NG')}`} />
                    <meta name="twitter:label2" content="Availability" />
                    <meta name="twitter:data2" content={availability === 'in stock' ? 'In Stock ✓' : 'Out of Stock'} />
                </>
            )}

            {/* WhatsApp specific (uses Open Graph) */}
            <meta property="og:image:type" content="image/png" />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />

            {/* Telegram specific */}
            <meta property="telegram:image" content={absoluteImageUrl} />

            {/* LinkedIn specific */}
            <meta property="og:image:secure_url" content={absoluteImageUrl} />
            
            {/* Pinterest Rich Pins */}
            <meta property="og:see_also" content={baseUrl} />
            {type === 'product' && (
                <>
                    <meta property="og:price:amount" content={price} />
                    <meta property="og:price:currency" content={currency} />
                    <meta property="og:availability" content={availability} />
                </>
            )}

            {/* Apple specific meta tags */}
            <meta name="apple-mobile-web-app-title" content={siteName} />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="black" />
            
            {/* Microsoft specific meta tags */}
            <meta name="msapplication-TileColor" content="#2563EB" />
            <meta name="msapplication-config" content="/browserconfig.xml" />
            <meta name="theme-color" content="#2563EB" />

            {/* Additional SEO meta tags */}
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
            <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
            <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
            <meta name="format-detection" content="telephone=no" />
            <meta name="HandheldFriendly" content="True" />
            <meta name="MobileOptimized" content="320" />
            
            {/* DNS Prefetch for performance */}
            <link rel="dns-prefetch" href="//fonts.googleapis.com" />
            <link rel="dns-prefetch" href="//www.googletagmanager.com" />
            
            {/* Preconnect for critical resources */}
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            
            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(structuredData)
                }}
            />
            
            {/* Breadcrumb Structured Data */}
            {breadcrumbData && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(breadcrumbData)
                    }}
                />
            )}

            {/* Organization Structured Data (for all pages) */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Organization",
                        "name": siteName,
                        "url": baseUrl,
                        "logo": `${baseUrl}/logo-2.png`,
                        "sameAs": [
                            "https://twitter.com/toolupstore",
                            "https://facebook.com/toolupstore",
                            "https://instagram.com/toolupstore"
                        ],
                        "address": {
                            "@type": "PostalAddress",
                            "streetAddress": "Your Street Address",
                            "addressLocality": "Port Harcourt",
                            "addressRegion": "Rivers State",
                            "postalCode": "500001",
                            "addressCountry": "NG"
                        },
                        "contactPoint": {
                            "@type": "ContactPoint",
                            "telephone": "+234-XXX-XXXX-XXX",
                            "contactType": "customer service",
                            "areaServed": "NG",
                            "availableLanguage": ["English"]
                        }
                    })
                }}
            />
        </Head>
    );
}