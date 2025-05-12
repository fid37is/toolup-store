// src/components/ProductList.jsx
import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';

const ProductList = ({ products, isLoading, error }) => {
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortOption, setSortOption] = useState('default');
    const [searchQuery, setSearchQuery] = useState('');

    // Extract unique categories from products
    const categories = products ? ['all', ...new Set(products.map(product => product.category).filter(Boolean))] : ['all'];

    useEffect(() => {
        if (!products) return;

        let filtered = [...products];

        // Apply category filter
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(product => product.category === selectedCategory);
        }

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(product =>
                product.name?.toLowerCase().includes(query) ||
                product.description?.toLowerCase().includes(query)
            );
        }

        // Apply sorting
        switch (sortOption) {
            case 'price-asc':
                filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
                break;
            case 'price-desc':
                filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
                break;
            case 'name-asc':
                filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                break;
            case 'stock-desc':
                filtered.sort((a, b) => (b.stock || 0) - (a.stock || 0));
                break;
            default:
                // Keep default order
                break;
        }

        setFilteredProducts(filtered);
    }, [products, selectedCategory, sortOption, searchQuery]);

    if (isLoading) {
        return (
            <div className="flex h-96 w-full items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
                    <p className="text-gray-600">Loading products...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="my-8 rounded-lg bg-red-50 p-4 text-red-700">
                <p className="font-medium">Error loading products</p>
                <p className="text-sm">{error.message || 'Please try again later.'}</p>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 py-2 pl-4 pr-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="absolute right-3 top-2.5 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                        </svg>
                    </span>
                </div>

                <div className="flex flex-wrap gap-2">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        {categories.map(category => (
                            <option key={category} value={category}>
                                {category === 'all' ? 'All Categories' : category}
                            </option>
                        ))}
                    </select>

                    <select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="default">Default Sorting</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="name-asc">Name: A to Z</option>
                        <option value="stock-desc">Availability</option>
                    </select>
                </div>
            </div>

            {filteredProducts.length === 0 ? (
                <div className="my-16 text-center">
                    <h3 className="mb-2 text-xl font-medium">No products found</h3>
                    <p className="text-gray-600">Try adjusting your search or filter criteria</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductList;