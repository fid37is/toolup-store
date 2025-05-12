// src/pages/product/[id].jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { getImageUrl } from '../../utils/driveService';

export default function ProductDetail() {
    const router = useRouter();
    const { id } = router.query;

    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) return;

        const fetchProduct = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/products/${id}`);

                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }

                const data = await response.json();
                setProduct(data);
            } catch (err) {
                console.error(`Failed to fetch product ${id}:`, err);
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    if (isLoading) {
        return (
            <div>
                <Header />
                <div className="container mx-auto flex h-96 items-center justify-center">
                    <div className="text-center">
                        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
                        <p className="text-gray-600">Loading product details...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div>
                <Header />
                <div className="container mx-auto my-16 px-4">
                    <div className="rounded-lg bg-red-50 p-6 text-center">
                        <h1 className="mb-4 text-2xl font-bold text-red-700">Product Not Found</h1>
                        <p className="mb-6 text-gray-700">
                            Sorry, we couldn't find the product you're looking for.
                        </p>
                        <Link
                            href="/"
                            className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
                        >
                            Return to Home
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // Calculate stock status
    const isOutOfStock = product.stock === 0;
    const isLowStock = product.stock > 0 && product.stock <= 5;

    const imageUrl = product.imageId ? getImageUrl(product.imageId) : '/placeholder-product.jpg';

    return (
        <div className="flex min-h-screen flex-col">
            <Head>
                <title>{product.name} | ToolUp Store</title>
                <meta name="description" content={product.description || `Buy ${product.name} at ToolUp Store`} />
            </Head>

            <Header />

            <main className="container mx-auto flex-grow px-4 py-8">
                <div className="mb-6">
                    <Link href="/" className="inline-flex items-center text-blue-600 hover:underline">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Back to Products
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    {/* Product Image */}
                    <div className="relative min-h-[300px] overflow-hidden rounded-lg bg-gray-100 md:min-h-[500px]">
                        <Image
                            src={imageUrl}
                            alt={product.name}
                            className="object-contain"
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            priority
                        />
                    </div>

                    {/* Product Info */}
                    <div>
                        <h1 className="mb-2 text-3xl font-bold text-gray-900">{product.name}</h1>

                        {product.category && (
                            <p className="mb-4 text-sm text-gray-500">
                                Category: <span className="font-medium">{product.category}</span>
                            </p>
                        )}

                        <div className="mb-6 mt-4">
                            <p className="text-3xl font-bold text-gray-900">${parseFloat(product.price).toFixed(2)}</p>

                            <div className="mt-4">
                                {isOutOfStock ? (
                                    <span className="inline-block rounded-full bg-red-100 px-4 py-1 text-sm font-medium text-red-800">
                                        Out of Stock
                                    </span>
                                ) : isLowStock ? (
                                    <span className="inline-block rounded-full bg-amber-100 px-4 py-1 text-sm font-medium text-amber-800">
                                        Only {product.stock} left
                                    </span>
                                ) : (
                                    <span className="inline-block rounded-full bg-green-100 px-4 py-1 text-sm font-medium text-green-800">
                                        In Stock
                                    </span>
                                )}
                            </div>
                        </div>

                        {product.description && (
                            <div className="mb-6">
                                <h2 className="mb-2 text-lg font-medium">Description</h2>
                                <p className="text-gray-700">{product.description}</p>
                            </div>
                        )}

                        {product.specs && (
                            <div className="mb-6">
                                <h2 className="mb-2 text-lg font-medium">Specifications</h2>
                                <p className="text-gray-700">{product.specs}</p>
                            </div>
                        )}

                        <div className="mt-8">
                            <button
                                className={`w-full rounded-lg px-6 py-3 font-medium text-white transition-colors ${isOutOfStock
                                        ? 'cursor-not-allowed bg-gray-400'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                                disabled={isOutOfStock}
                            >
                                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}