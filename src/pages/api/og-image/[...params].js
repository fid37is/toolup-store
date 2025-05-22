import { ImageResponse } from '@vercel/og';
import Image from 'next/image';

export const config = {
    runtime: 'edge',
};

export default async function handler(request) {
    try {
        const { searchParams } = new URL(request.url);
        
        const title = searchParams.get('title') || 'ToolUp Store';
        const price = searchParams.get('price');
        const image = searchParams.get('image');
        const category = searchParams.get('category');

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
                        <div style={{ display: 'flex', width: '100%', height: '100%' }}>
                            {/* Product Image */}
                            {image && (
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Image
                                        src={image}
                                        alt={title}
                                        style={{
                                            maxWidth: '300px',
                                            maxHeight: '300px',
                                            width: 'auto',
                                            height: 'auto',
                                            objectFit: 'contain',
                                            borderRadius: '10px',
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
                                    padding: '0 40px',
                                }}
                            >
                                {category && (
                                    <div
                                        style={{
                                            fontSize: '24px',
                                            color: '#6B7280',
                                            marginBottom: '10px',
                                        }}
                                    >
                                        {category}
                                    </div>
                                )}
                                
                                <div
                                    style={{
                                        fontSize: '48px',
                                        fontWeight: 'bold',
                                        color: '#111827',
                                        marginBottom: '20px',
                                        lineHeight: 1.2,
                                    }}
                                >
                                    {title}
                                </div>
                                
                                {price && (
                                    <div
                                        style={{
                                            fontSize: '36px',
                                            fontWeight: 'bold',
                                            color: '#2563EB',
                                            marginBottom: '20px',
                                        }}
                                    >
                                        ₦{parseInt(price).toLocaleString()}
                                    </div>
                                )}
                                
                                <div
                                    style={{
                                        fontSize: '28px',
                                        fontWeight: 'bold',
                                        color: '#2563EB',
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    🛠️ ToolUp Store
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
                emoji: 'twemoji',
            }
        );
    } catch (e) {
        console.log(`${e.message}`);
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}