/* eslint-disable @typescript-eslint/no-unused-vars */
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

        // Validate image URL if provided
        let validImage = null;
        if (image) {
            try {
                const imageUrl = new URL(image);
                if (imageUrl.protocol === 'https:' || imageUrl.protocol === 'http:') {
                    validImage = image;
                }
            } catch (imageError) {
                // Invalid image URL, use null
            }
        }

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
                            {validImage && (
                                <div style={{ 
                                    flex: 1, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    paddingRight: '20px',
                                }}>
                                    <img
                                        src={validImage}
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
                                    padding: validImage ? '0 20px 0 0' : '0 40px',
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
                                            display: 'flex',
                                        }}
                                    >
                                        {category}
                                    </div>
                                )}
                                
                                <div
                                    style={{
                                        fontSize: validImage ? '42px' : '48px',
                                        fontWeight: 'bold',
                                        color: '#111827',
                                        marginBottom: '16px',
                                        lineHeight: 1.1,
                                        display: 'flex',
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
                                            display: 'flex',
                                        }}
                                    >
                                        NGN {formattedPrice}
                                    </div>
                                )}
                                
                                {/* Store branding */}
                                <div
                                    style={{
                                        fontSize: '24px',
                                        fontWeight: '600',
                                        color: '#2563EB',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                    }}
                                >
                                    {/* Replace the URL below with your logo URL */}
                                    <img
                                        src="https://www.toolup.store/logo-2.png"
                                        alt="Logo"
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            objectFit: 'contain',
                                        }}
                                    />
                                    <span>Toolup Store</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );

    } catch (error) {
        console.error('OG Image Error:', error);
        
        // Simple fallback without complex styling
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
                        backgroundColor: '#2563EB',
                        color: 'white',
                        fontSize: '48px',
                        fontWeight: 'bold',
                        fontFamily: 'system-ui, sans-serif',
                    }}
                >
                    <div style={{ display: 'flex', marginBottom: '20px' }}>
                        <img
                            src="https://your-domain.com/logo.png"
                            alt="Logo"
                            style={{
                                width: '48px',
                                height: '48px',
                                objectFit: 'contain',
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex' }}>Your Store Name</div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );
    }
}