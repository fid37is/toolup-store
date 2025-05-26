/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

export default async function handler(req) {
    try {
        const { searchParams } = new URL(req.url);
        
        // Extract parameters with better fallbacks
        const title = searchParams.get('title') || 'Quality Tools & Equipment';
        const price = searchParams.get('price');
        const image = searchParams.get('image');
        const category = searchParams.get('category');
        const description = searchParams.get('description') || 'Find the best tools for your projects';

        // Format price safely
        const formatPrice = (priceStr) => {
            if (!priceStr || priceStr === 'null' || priceStr === 'undefined') return null;
            const num = parseFloat(priceStr.replace(/[^0-9.-]/g, ''));
            return isNaN(num) ? null : num.toLocaleString();
        };

        const formattedPrice = formatPrice(price);

        // Validate and process image URL
        let validImage = null;
        if (image && image !== 'null' && image !== 'undefined' && !image.includes('undefined')) {
            try {
                // Handle relative URLs
                if (image.startsWith('/')) {
                    validImage = `https://www.toolup.store${image}`;
                } else if (image.startsWith('http')) {
                    validImage = image;
                } else {
                    validImage = `https://www.toolup.store/${image}`;
                }
                
                // Test if URL is valid
                new URL(validImage);
            } catch (error) {
                validImage = null;
            }
        }

        // Truncate title if too long
        const truncatedTitle = title.length > 50 ? title.substring(0, 47) + '...' : title;

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#fff',
                        backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    }}
                >
                    {/* Main content card */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: 'white',
                            borderRadius: '24px',
                            padding: '50px',
                            margin: '40px',
                            boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
                            width: '90%',
                            maxWidth: '1100px',
                            height: '80%',
                            position: 'relative',
                        }}
                    >
                        {/* Content Section */}
                        <div style={{ 
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            flex: validImage ? '1' : '1',
                            paddingRight: validImage ? '40px' : '0',
                            height: '100%',
                        }}>
                            {/* Category badge */}
                            {category && (
                                <div
                                    style={{
                                        fontSize: '18px',
                                        color: '#6366F1',
                                        marginBottom: '12px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        fontWeight: '600',
                                        display: 'flex',
                                        backgroundColor: '#EEF2FF',
                                        padding: '8px 16px',
                                        borderRadius: '20px',
                                        width: 'fit-content',
                                    }}
                                >
                                    {category.toUpperCase()}
                                </div>
                            )}
                            
                            {/* Title */}
                            <div
                                style={{
                                    fontSize: validImage ? '44px' : '52px',
                                    fontWeight: '800',
                                    color: '#1F2937',
                                    marginBottom: '20px',
                                    lineHeight: '1.1',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                }}
                            >
                                {truncatedTitle}
                            </div>
                            
                            {/* Price */}
                            {formattedPrice && (
                                <div
                                    style={{
                                        fontSize: '36px',  
                                        fontWeight: '700',
                                        color: '#059669',
                                        marginBottom: '20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                    }}
                                >
                                    <span style={{ fontSize: '28px', color: '#6B7280' }}>₦</span>
                                    {formattedPrice}
                                </div>
                            )}
                            
                            {/* Description */}
                            {!validImage && description && (
                                <div
                                    style={{
                                        fontSize: '22px',
                                        color: '#6B7280',
                                        marginBottom: '30px',
                                        lineHeight: '1.4',
                                        display: 'flex',
                                        maxWidth: '600px',
                                    }}
                                >
                                    {description.length > 80 ? description.substring(0, 77) + '...' : description}
                                </div>
                            )}
                            
                            {/* Store branding */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    marginTop: 'auto',
                                }}
                            >
                                <div
                                    style={{
                                        width: '48px',
                                        height: '48px',
                                        backgroundColor: '#3B82F6',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '24px',
                                        fontWeight: 'bold',
                                        color: 'white',
                                    }}
                                >
                                    T
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div
                                        style={{
                                            fontSize: '28px',
                                            fontWeight: '700',
                                            color: '#1F2937',
                                            display: 'flex',
                                        }}
                                    >
                                        ToolUp Store
                                    </div>
                                    <div
                                        style={{
                                            fontSize: '16px',
                                            color: '#6B7280',
                                            display: 'flex',
                                        }}
                                    >
                                        Quality Tools & Equipment
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Product Image */}
                        {validImage && (
                            <div style={{ 
                                flex: '0 0 300px',
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                height: '100%',
                            }}>
                                <div style={{
                                    width: '300px',
                                    height: '300px',
                                    borderRadius: '20px',
                                    overflow: 'hidden',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: '#F9FAFB',
                                    border: '1px solid #E5E7EB',
                                }}>
                                    <img
                                        src={validImage}
                                        alt={title}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                        
                        {/* Decorative elements */}
                        <div
                            style={{
                                position: 'absolute',
                                top: '-10px',
                                right: '-10px',
                                width: '100px',
                                height: '100px',
                                borderRadius: '50%',
                                background: 'linear-gradient(45deg, #F59E0B, #EF4444)',
                                opacity: '0.1',
                                display: 'flex',
                            }}
                        />
                        <div
                            style={{
                                position: 'absolute',
                                bottom: '-20px',
                                left: '-20px',
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: 'linear-gradient(45deg, #3B82F6, #8B5CF6)',
                                opacity: '0.1',
                                display: 'flex',
                            }}
                        />
                    </div>
                    
                    {/* Footer */}
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            color: 'white',
                            fontSize: '18px',
                            fontWeight: '500',
                            opacity: '0.9',
                        }}
                    >
                        <div
                            style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: 'white',
                                display: 'flex',
                            }}
                        />
                        <span>www.toolup.store</span>
                        <div
                            style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: 'white',
                                display: 'flex',
                            }}
                        />
                        <span>Premium Tools & Equipment</span>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
                headers: {
                    'Cache-Control': 'public, max-age=31536000, immutable',
                },
            }
        );

    } catch (error) {
        console.error('OG Image Error:', error);
        
        // Enhanced fallback with better design
        return new ImageResponse(
            (
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#1F2937',
                        backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                    }}
                >
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: '20px',
                        marginBottom: '30px' 
                    }}>
                        <div
                            style={{
                                width: '80px',
                                height: '80px',
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                borderRadius: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '40px',
                                fontWeight: 'bold',
                                backdropFilter: 'blur(10px)',
                            }}
                        >
                            T
                        </div>
                        <div style={{ 
                            fontSize: '64px',
                            fontWeight: 'bold',
                            display: 'flex',
                        }}>
                            ToolUp Store
                        </div>
                    </div>
                    <div style={{ 
                        fontSize: '28px',
                        opacity: '0.9',
                        display: 'flex',
                        textAlign: 'center',
                    }}>
                        Quality Tools & Equipment for Every Project
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
                headers: {
                    'Cache-Control': 'public, max-age=31536000, immutable',
                },
            }
        );
    }
}