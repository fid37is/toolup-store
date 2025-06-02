// Enhanced version with circular infinite scroll
import { useState, useEffect, useCallback, useRef } from 'react';
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ImageViewModal from '../components/ImageViewModal';
import ProductCard from '../components/ProductCard';
import LoadingScreen from '../components/LoadingScreen';
import SocialHead from '../components/SocialHead';

export default function Home() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [displayedProducts, setDisplayedProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState(null);

    // Search and filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [sortOption, setSortOption] = useState('');
    const [categories, setCategories] = useState([]);
    const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
    const [inStockOnly, setInStockOnly] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Image view modal states
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState('');
    const [selectedProductName, setSelectedProductName] = useState('');

    // Circular infinite scroll settings
    const ITEMS_PER_PAGE = 12;
    const [currentCycle, setCurrentCycle] = useState(0); // Track how many times we've cycled through
    const observer = useRef();

    // Utility function to shuffle array randomly
    const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    // Load more products for circular infinite scroll
    const loadMoreProducts = useCallback(() => {
        if (isLoadingMore || filteredProducts.length === 0) return;

        setIsLoadingMore(true);
        
        setTimeout(() => {
            // Calculate how many products we've already shown
            const totalShown = displayedProducts.length;
            const productsInCurrentCycle = totalShown % filteredProducts.length;
            
            // Determine how many more products to add
            const remainingInCycle = filteredProducts.length - productsInCurrentCycle;
            const itemsToAdd = Math.min(ITEMS_PER_PAGE, remainingInCycle);
            
            // Get next batch of products
            let newProducts = [];
            
            if (itemsToAdd > 0) {
                // Add remaining products from current cycle
                newProducts = filteredProducts.slice(productsInCurrentCycle, productsInCurrentCycle + itemsToAdd);
            }
            
            // If we need more products to fill the batch, start a new cycle
            if (newProducts.length < ITEMS_PER_PAGE) {
                const additionalNeeded = ITEMS_PER_PAGE - newProducts.length;
                
                // Optionally shuffle for variety in new cycles
                const nextCycleProducts = sortOption === 'random' || sortOption === '' ? 
                    shuffleArray(filteredProducts) : filteredProducts;
                
                const additionalProducts = nextCycleProducts.slice(0, additionalNeeded);
                newProducts = [...newProducts, ...additionalProducts];
                
                setCurrentCycle(prev => prev + 1);
            }

            // Add unique keys to distinguish between cycles
            const productsWithCycleKeys = newProducts.map((product, index) => ({
                ...product,
                cycleKey: `cycle-${currentCycle}-${product.id}-${totalShown + index}`
            }));

            setDisplayedProducts(prev => [...prev, ...productsWithCycleKeys]);
            setIsLoadingMore(false);
        }, 300); // Reduced delay for smoother experience
    }, [filteredProducts, displayedProducts, isLoadingMore, currentCycle, sortOption]);

    // Ref callback for intersection observer
    const lastProductElementRef = useCallback(node => {
        if (isLoadingMore) return;
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                loadMoreProducts();
            }
        }, {
            threshold: 0.1,
            rootMargin: '200px' // Increased margin for smoother loading
        });
        
        if (node) observer.current.observe(node);
    }, [isLoadingMore, loadMoreProducts]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/products');
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                
                // Shuffle products randomly on initial load
                const shuffledProducts = shuffleArray(data);
                setProducts(shuffledProducts);
                setFilteredProducts(shuffledProducts);

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

    // Apply filters and reset pagination
    useEffect(() => {
        applyFilters();
    }, [searchQuery, selectedCategory, sortOption, inStockOnly, products]);

    // Reset displayed products when filters change
    useEffect(() => {
        setDisplayedProducts([]);
        setCurrentCycle(0);
        
        // Load initial batch with cycle keys
        if (filteredProducts.length > 0) {
            const initialProducts = filteredProducts.slice(0, ITEMS_PER_PAGE);
            const productsWithKeys = initialProducts.map((product, index) => ({
                ...product,
                cycleKey: `cycle-0-${product.id}-${index}`
            }));
            setDisplayedProducts(productsWithKeys);
        }
    }, [filteredProducts]);

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

        // Apply sorting (but maintain randomness when no sort is selected)
        if (sortOption === 'price-asc') {
            result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        } else if (sortOption === 'price-desc') {
            result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        } else if (sortOption === 'name-asc') {
            result.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortOption === 'name-desc') {
            result.sort((a, b) => b.name.localeCompare(a.name));
        } else if (sortOption === 'random') {
            result = shuffleArray(result);
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
        return <LoadingScreen message="Loading products..." />;
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
                            className="rounded-lg bg-primary-700 px-6 py-2 text-white hover:bg-primary-500"
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
        <div className="flex min-h-screen flex-col bg-white">
            <Head>
                <title>ToolUp Store - Professional Tools & Equipment</title>
                <meta name="description" content="Shop quality tools and equipment for professionals and DIY enthusiasts at ToolUp Store." />
            </Head>

            <Header />

            <main className="container mx-auto flex-grow px-4 py-6 md:py-8">
                {/* Header with search bar always visible */}
                <div className="mb-6">
                    {/* Title, Search Bar, and Filter Button in one row */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                        <h1 className="text-xl font-bold md:text-2xl text-gray-800 flex-shrink-0">Featured Products</h1>
                        
                        {/* Search bar - responsive width */}
                        <div className="relative flex-1 max-w-md sm:max-w-lg">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                id="search"
                                value={searchQuery}
                                onChange={handleSearch}
                                placeholder="Search for products..."
                                className="block w-full rounded border border-gray-200 bg-white p-2 pl-10 pr-3 text-sm focus:border-accent-500 focus:ring-1 focus:ring-accent-400 transition-all"
                            />
                        </div>

                        {/* Filter button */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center justify-center rounded bg-gray-200 px-4 py-2 text-sm text-primary-700 hover:bg-gray-300 transition-colors flex-shrink-0 sm:ml-auto"
                        >
                            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                            </svg>
                            <span className="hidden sm:inline">{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
                            <span className="sm:hidden">Filters</span>
                        </button>
                    </div>

                    {/* Collapsible Filter Section */}
                    {showFilters && (
                        <div className="rounded-lg bg-gray-50 border border-gray-100 p-4 animate-in slide-in-from-top-2 duration-200">
                            <div className="grid gap-4 md:grid-cols-3">
                                {/* Category filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        id="category"
                                        value={selectedCategory}
                                        onChange={handleCategoryChange}
                                        className="block w-full rounded-md border border-gray-200 bg-white p-2 text-sm focus:border-accent-500 focus:ring-1 focus:ring-blue-200"
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
                                    <select
                                        id="sort"
                                        value={sortOption}
                                        onChange={handleSortChange}
                                        className="block w-full rounded-md border border-gray-200 bg-white p-2 text-sm focus:border-[#ffcc66] focus:ring-1 focus:ring-blue-200"
                                    >
                                        <option value="">Random Order</option>
                                        <option value="price-asc">Price: Low to High</option>
                                        <option value="price-desc">Price: High to Low</option>
                                        <option value="name-asc">Name: A to Z</option>
                                        <option value="name-desc">Name: Z to A</option>
                                        <option value="random">Shuffle Again</option>
                                    </select>
                                </div>

                                {/* In Stock Filter */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="inStock"
                                            checked={inStockOnly}
                                            onChange={handleInStockChange}
                                            className="h-4 w-4 rounded border-gray-300 text-primary-700 focus:ring-primary-500"
                                        />
                                        <label htmlFor="inStock" className="ml-2 text-sm text-gray-700">
                                            In Stock Only
                                        </label>
                                    </div>

                                    <button
                                        onClick={clearFilters}
                                        className="rounded-md bg-gray-200 px-3 py-1 text-sm text-gray-700 hover:bg-gray-300 transition-colors"
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {filteredProducts.length === 0 ? (
                    <div className="rounded-lg bg-gray-50 border border-gray-100 p-8 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4 h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-gray-600 mb-4">No products match your search criteria.</p>
                        <button
                            onClick={clearFilters}
                            className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                            {displayedProducts.map((product, index) => (
                                <div
                                    key={product.cycleKey}
                                    ref={index === displayedProducts.length - 1 ? lastProductElementRef : null}
                                >
                                    <ProductCard 
                                        product={product} 
                                        onViewImage={handleOpenImageModal}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Loading more indicator */}
                        {isLoadingMore && (
                            <div className="mt-8 flex justify-center">
                                <div className="flex items-center space-x-2">
                                    <svg className="h-6 w-6 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    <span className="text-gray-600">Loading more products...</span>
                                </div>
                            </div>
                        )}
                    </>
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