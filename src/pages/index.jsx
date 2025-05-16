// src/pages/index.jsx - Updated with improved styling and separated ProductCard component
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ImageViewModal from '../components/ImageViewModal';
import ProductCard from '../components/ProductCard';

export default function Home() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Search and filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [sortOption, setSortOption] = useState('');
    const [categories, setCategories] = useState([]);
    const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
    const [inStockOnly, setInStockOnly] = useState(false);

    // Image view modal states
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState('');
    const [selectedProductName, setSelectedProductName] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/products');
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                setProducts(data);
                setFilteredProducts(data);

                // Extract unique categories
                const uniqueCategories = [...new Set(data.map(product => product.category).filter(Boolean))];
                setCategories(uniqueCategories);

                // Find min and max prices
                if (data.length > 0) {
                    const prices = data.map(p => parseFloat(p.price));
                    setPriceRange({
                        min: Math.floor(Math.min(...prices)),
                        max: Math.ceil(Math.max(...prices))
                    });
                }
            } catch (err) {
                console.error('Error loading products:', err);
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Apply filters whenever dependencies change
    useEffect(() => {
        applyFilters();
    }, [searchQuery, selectedCategory, sortOption, inStockOnly, products]);

    const applyFilters = () => {
        let result = [...products];

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(product =>
                product.name.toLowerCase().includes(query) ||
                (product.description && product.description.toLowerCase().includes(query))
            );
        }

        // Apply category filter
        if (selectedCategory) {
            result = result.filter(product => product.category === selectedCategory);
        }

        // Apply in-stock filter
        if (inStockOnly) {
            result = result.filter(product => {
                if (typeof product.quantity === 'number') {
                    return product.quantity > 0;
                } else if (typeof product.quantity === 'boolean') {
                    return product.quantity;
                } else if (typeof product.quantity === 'string') {
                    return product.quantity.toLowerCase() === 'in stock' || product.quantity !== '0';
                }
                return product.quantity !== 0 && product.quantity !== '0' && product.quantity !== false;
            });
        }

        // Apply sorting
        if (sortOption === 'price-asc') {
            result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        } else if (sortOption === 'price-desc') {
            result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        } else if (sortOption === 'name-asc') {
            result.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortOption === 'name-desc') {
            result.sort((a, b) => b.name.localeCompare(a.name));
        }

        setFilteredProducts(result);
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
    };

    const handleSortChange = (e) => {
        setSortOption(e.target.value);
    };

    const handleInStockChange = (e) => {
        setInStockOnly(e.target.checked);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('');
        setSortOption('');
        setInStockOnly(false);
    };

    // Image modal handlers
    const handleOpenImageModal = (imageUrl, productName) => {
        setSelectedImageUrl(imageUrl);
        setSelectedProductName(productName);
        setIsImageModalOpen(true);
    };

    const closeImageModal = () => {
        setIsImageModalOpen(false);
    };

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

            <main className="container mx-auto flex-grow px-4 py-6 md:py-8">
                {/* Search and Filter Section */}
                <div className="mb-6 rounded-lg bg-gray-50 p-4 shadow-sm">
                    <div className="grid gap-4 md:grid-cols-5">
                        <h1 className="mb-2 text-left text-xl font-bold md:mb-4 md:text-2xl">Featured Products</h1>
                        {/* Search */}
                        <div className="md:col-span-2">
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    id="search"
                                    value={searchQuery}
                                    onChange={handleSearch}
                                    placeholder="Search for products..."
                                    className="block w-full rounded-md border border-gray-300 bg-white p-2 pl-10 pr-3 text-sm"
                                />
                            </div>
                        </div>

                        {/* Category filter */}
                        <div>
                            <select
                                id="category"
                                value={selectedCategory}
                                onChange={handleCategoryChange}
                                className="block w-full rounded-md border border-gray-300 bg-white p-2 text-sm"
                            >
                                <option value="">All Categories</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sort options */}
                        <div>
                            <select
                                id="sort"
                                value={sortOption}
                                onChange={handleSortChange}
                                className="block w-full rounded-md border border-gray-300 bg-white p-2 text-sm"
                            >
                                <option value="">Sort By</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                                <option value="name-asc">Name: A to Z</option>
                                <option value="name-desc">Name: Z to A</option>
                            </select>
                        </div>
                    </div>

                    {/* Additional filters */}
                    <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="inStock"
                                checked={inStockOnly}
                                onChange={handleInStockChange}
                                className="h-4 w-4 rounded border-gray-300 text-primary-700"
                            />
                            <label htmlFor="inStock" className="ml-2 text-sm text-gray-700">
                                In Stock Only
                            </label>
                        </div>

                        {/* Clear filters button */}
                        <button
                            onClick={clearFilters}
                            className="rounded-md bg-gray-200 px-3 py-1 text-sm text-gray-700 hover:bg-gray-300"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>

                {/* Result count */}
                <div className="mb-4 text-sm text-gray-600">
                    Showing {filteredProducts.length} of {products.length} products
                </div>

                {filteredProducts.length === 0 ? (
                    <div className="rounded-lg bg-gray-50 p-8 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4 h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-gray-600">No products match your search criteria.</p>
                        <button
                            onClick={clearFilters}
                            className="mt-4 rounded bg-primary-500 px-4 py-2 text-white hover:bg-primary-700"
                        >
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {filteredProducts.map((product) => (
                            <ProductCard 
                                key={product.id} 
                                product={product} 
                                onViewImage={handleOpenImageModal}
                            />
                        ))}
                    </div>
                )}
            </main>

            <Footer />

            {/* Image View Modal */}
            {isImageModalOpen && (
                <ImageViewModal
                    isOpen={isImageModalOpen}
                    imageUrl={selectedImageUrl}
                    productName={selectedProductName}
                    onClose={closeImageModal}
                />
            )}
        </div>
    );
}