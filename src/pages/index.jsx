// src/pages/index.jsx
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductList from '../components/ProductList';

export default function Home() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/products');

                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }

                const data = await response.json();
                setProducts(data);
            } catch (err) {
                console.error('Failed to fetch products:', err);
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return (
        <div className="flex min-h-screen flex-col">
            <Head>
                <title>ToolUp Store - Quality Tools & Equipment</title>
                <meta name="description" content="Shop the best selection of tools and equipment for professionals and DIY enthusiasts" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Header />

            <main className="container mx-auto flex-grow px-4 py-8">
                <section className="mb-12">
                    <div className="mb-16 rounded-lg bg-blue-600 p-8 text-center text-white shadow-lg">
                        <h1 className="mb-4 text-4xl font-bold">Welcome to ToolUp Store</h1>
                        <p className="mx-auto mb-8 max-w-2xl text-lg">
                            Your trusted source for professional-grade tools and equipment.
                            Browse our extensive selection to find exactly what you need.
                        </p>
                        <button className="rounded-lg bg-white px-6 py-3 font-semibold text-blue-600 transition-colors hover:bg-gray-100">
                            Shop Now
                        </button>
                    </div>

                    <h2 className="mb-6 text-2xl font-bold">Our Products</h2>
                    <ProductList
                        products={products}
                        isLoading={isLoading}
                        error={error}
                    />
                </section>
            </main>

            <Footer />
        </div>
    );
}