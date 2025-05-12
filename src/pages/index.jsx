// src/pages/index.jsx - Fixed with proper error handling
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getImageUrl } from '../utils/driveService';

export default function Home() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/products');
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                setProducts(data);
            } catch (err) {
                console.error('Error loading products:', err);
                setError(err);
            } finally {
                setIsLoading(false); // Fixed: using setIsLoading instead of setLoading
            }
        };

        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div>
                <Header />
                <div className="container mx-auto flex h-96 items-center justify-center">
                    <div className="text-center">
                        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
                        <p className="text-gray-600">Loading products...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <Header />
                <div className="container mx-auto my-16 px-4">
                    <div className="rounded-lg bg-red-50 p-6 text-center">
                        <h1 className="mb-4 text-2xl font-bold text-red-700">Error Loading Products</h1>
                        <p className="mb-6 text-gray-700">
                            Sorry, we encountered an error while loading the products: {error.message}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Head>
                <title>ToolUp Store - Professional Tools & Equipment</title>
                <meta name="description" content="Shop quality tools and equipment for professionals and DIY enthusiasts at ToolUp Store." />
            </Head>

            <Header />

            <main className="container mx-auto flex-grow px-4 py-8">
                <h1 className="mb-8 text-center text-3xl font-bold">Featured Products</h1>

                {products.length === 0 ? (
                    <div className="text-center">
                        <p className="text-gray-600">No products available at this time.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {products.map((product) => {
                            const imageUrl = product.imageId ? getImageUrl(product.imageId) : '/placeholder-product.jpg';

                            return (
                                <Link key={product.id} href={`/product/${product.id}`} legacyBehavior>
                                    <a className="block h-full">
                                        <div className="h-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                                            <div className="relative h-48 w-full bg-gray-100">
                                                {/* Option 1: Use Next.js Image with unoptimized prop */}
                                                <Image
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    className="object-contain"
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    unoptimized={true} /* Add this line to bypass Next.js image optimization */
                                                />

                                                {/* Option 2: Use a regular img tag instead of Next.js Image if everything else fails */}
                                                {/* 
                        <img
                            src={imageUrl}
                            alt={product.name}
                            className="h-full w-full object-contain" 
                        />
                        */}
                                            </div>
                                            <div className="p-4">
                                                <h2 className="mb-2 text-lg font-medium text-gray-900">{product.name}</h2>
                                                <p className="mb-2 text-sm text-gray-500">
                                                    {product.category || 'Uncategorized'}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-lg font-bold">${parseFloat(product.price).toFixed(2)}</span>
                                                    {product.stock === 0 ? (
                                                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
                                                            Out of Stock
                                                        </span>
                                                    ) : (
                                                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                                                            In Stock
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </a>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}