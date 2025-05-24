/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

export default async function handler(req) {
    try {
        const { searchParams } = new URL(req.url);
        
        // Extract parameters with fallbacks
        const title = searchParams.get('title') ?? 'ToolUp Store';
        const price = searchParams.get('price');
        const image = searchParams.get('image');
        const category = searchParams.get('category');

        // Format price safely
        const formatPrice = (priceStr) => {
            if (!priceStr) return null;
            const num = parseFloat(priceStr);
            return isNaN(num) ? null : num.toLocaleString();
        };

        const formattedPrice = formatPrice(price);

        // Set proper headers for caching and content type
        const headers = {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=31536000, immutable',
        };

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
                        backgroundImage: 'linear-gradient(45deg, #2563EB 0%, #1D4ED8 100%)',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'white',
                            borderRadius: '20px',
                            padding: '40px',
                            margin: '40px',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                            width: '90%',
                            height: '80%',
                        }}
                    >
                        <div style={{ 
                            display: 'flex', 
                            width: '100%', 
                            height: '100%',
                            alignItems: 'center',
                        }}>
                            {/* Product Image */}
                            {image && (
                                <div style={{ 
                                    flex: 1, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    paddingRight: '20px',
                                }}>
                                    <img
                                        src={image}
                                        alt={title}
                                        style={{
                                            maxWidth: '280px',
                                            maxHeight: '280px',
                                            width: 'auto',
                                            height: 'auto',
                                            objectFit: 'contain',
                                            borderRadius: '12px',
                                        }}
                                    />
                                </div>
                            )}
                            
                            {/* Product Info */}
                            <div
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    padding: image ? '0 20px 0 0' : '0 40px',
                                }}
                            >
                                {category && (
                                    <div
                                        style={{
                                            fontSize: '22px',
                                            color: '#6B7280',
                                            marginBottom: '8px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                        }}
                                    >
                                        {category}
                                    </div>
                                )}
                                
                                <div
                                    style={{
                                        fontSize: image ? '42px' : '48px',
                                        fontWeight: 'bold',
                                        color: '#111827',
                                        marginBottom: '16px',
                                        lineHeight: 1.1,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}
                                >
                                    {title}
                                </div>
                                
                                {formattedPrice && (
                                    <div
                                        style={{
                                            fontSize: '32px',
                                            fontWeight: 'bold',
                                            color: '#10B981',
                                            marginBottom: '16px',
                                        }}
                                    >
                                        ₦{formattedPrice}
                                    </div>
                                )}
                                
                                <div
                                    style={{
                                        fontSize: '24px',
                                        fontWeight: '600',
                                        color: '#2563EB',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                    }}
                                >
                                    <span>🛠️</span>
                                    <span>ToolUp Store</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
                headers
            }
        );
    } catch (error) {
        console.error('OG Image generation error:', error);
        
        // Return a simple fallback image with proper headers
        return new ImageResponse(
            (
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#2563EB',
                        color: 'white',
                        fontSize: '48px',
                        fontWeight: 'bold',
                        fontFamily: 'system-ui, sans-serif',
                    }}
                >
                    🛠️ ToolUp Store
                </div>
            ),
            {
                width: 1200,
                height: 630,
                headers: {
                    'Content-Type': 'image/png',
                    'Cache-Control': 'public, max-age=31536000, immutable',
                }
            }
        );
    }
}
