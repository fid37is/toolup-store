// src/pages/product/[id].jsx - Product page with auth check integration
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import AuthCheckModal from '../../components/AuthCheckModal';
import useAuthCheck from '../../hooks/useAuthCheck';
import { formatNairaPrice } from '../../utils/currency-formatter';
import { toast } from 'sonner';
import '../../styles/globals.css'

export default function ProductDetail() {
    const router = useRouter();
    const { id } = router.query;
    const {
        isAuthenticated,
        isAuthCheckModalOpen,
        initiateAuthCheck,
        handleContinueAsGuest,
        closeAuthCheckModal
    } = useAuthCheck();

    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [addedToCartMessage, setAddedToCartMessage] = useState('');
    const [generatedDescription, setGeneratedDescription] = useState('');

    const quantityNum = Number(product?.quantity || 0);
    const isOutOfStock = quantityNum === 0;
    const isLowStock = quantityNum > 0 && quantityNum <= 4;

    useEffect(() => {
        // Only fetch when we have an ID
        if (!id) {
            return;
        }

        const fetchProduct = async () => {
            try {
                setIsLoading(true);
                console.log(`Fetching product with ID: ${id}`);
                const response = await fetch(`/api/products/${id}`);

                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }

                const data = await response.json();
                console.log('Product data received:', data);
                setProduct(data);

                // Generate AI-like description based on product data
                generateProductDescription(data);
            } catch (err) {
                console.error(`Failed to fetch product ${id}:`, err);
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    // Function to generate AI-like description
    const generateProductDescription = (productData) => {
        if (!productData) return;

        // Get product details
        const { name, category, price } = productData;

        // Array of possible description templates
        const descriptionTemplates = [
            `The ${name} is a premium quality ${category || 'tool'} designed for both professionals and enthusiasts. Featuring exceptional durability and performance, this ${price > 100 ? 'high-end' : 'affordable'} product will exceed your expectations while maintaining excellent value for money.`,

            `Discover the versatility of our ${name}, a standout ${category || 'product'} that combines innovative design with practical functionality. Whether you're a seasoned professional or just starting out, this ${price > 100 ? 'investment-grade' : 'budget-friendly'} tool delivers reliable performance for all your projects.`,

            `Meet the ${name} - the perfect addition to any ${category || 'toolbox'}. With its ergonomic design and precision engineering, this ${price > 100 ? 'professional-grade' : 'cost-effective'} solution offers unmatched performance and durability that will serve you for years to come.`,

            `Engineered for excellence, the ${name} represents the pinnacle of ${category || 'tool'} design. Featuring premium materials and expert craftsmanship, this ${price > 100 ? 'professional' : 'accessible'} product combines power, precision, and reliability in one comprehensive package.`,

            `The ${name} stands out in the ${category || 'tools'} market for its exceptional quality and attention to detail. This ${price > 100 ? 'premium' : 'value-oriented'} product has been designed with the end-user in mind, ensuring comfort, efficiency, and outstanding results every time.`
        ];

        // Select a random description template
        const randomIndex = Math.floor(Math.random() * descriptionTemplates.length);
        setGeneratedDescription(descriptionTemplates[randomIndex]);
    };

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value > 0) {
            setQuantity(value);
        }
    };

    const handleAddToCart = async () => {
        if (!product || !id) {
            console.error("Product or product ID is missing");
            return;
        }

        try {
            console.log("Adding to cart:", {
                productId: id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                quantity: quantity
            });

            // First, fetch the current cart items
            let cartItems = [];
            try {
                const storedCart = localStorage.getItem('cart');
                if (storedCart) {
                    cartItems = JSON.parse(storedCart);
                    console.log("Existing cart items:", cartItems);
                }
            } catch (err) {
                console.error('Error parsing stored cart:', err);
            }

            // Check if product already exists in cart
            const existingItemIndex = cartItems.findIndex(item => item.productId === id);

            if (existingItemIndex >= 0) {
                // Update quantity if item already exists
                cartItems[existingItemIndex].quantity += quantity;
                console.log("Updated existing item quantity:", cartItems[existingItemIndex]);
            } else {
                // Add new item
                cartItems.push({
                    productId: id,
                    name: product.name,
                    price: product.price,
                    imageUrl: product.imageUrl,
                    quantity: quantity
                });
                console.log("Added new item to cart");
            }

            // Save to localStorage
            console.log("Saving cart to localStorage:", cartItems);
            localStorage.setItem('cart', JSON.stringify(cartItems));

            // Make API call (in a real app, this would save to database)
            try {
                const response = await fetch('/api/cart', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        productId: id,
                        quantity: quantity
                    }),
                });
                console.log("API response:", response.ok ? "success" : "failed");
            } catch (err) {
                console.log("API call failed, but cart was saved to localStorage");
            }

            toast.success(`${product.name} added to cart`);

            // Notify other components that cart has been updated
            window.dispatchEvent(new CustomEvent('cartUpdated'));
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Failed to add item to cart. Please try again.');
        }

    };

    const handleBuyNow = () => {
        if (!product || !id) {
            console.error("Product or product ID is missing");
            return;
        }

        try {
            // Create a checkout item for this single product
            const checkoutItem = {
                productId: id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                quantity: quantity
            };

            // Store this as the direct purchase item
            localStorage.setItem('directPurchaseItem', JSON.stringify(checkoutItem));

            // Initiate auth check instead of direct navigation
            initiateAuthCheck('/checkout?mode=direct');

        } catch (error) {
            console.error('Error processing direct purchase:', error);
            alert('Failed to proceed to checkout. Please try again.');
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen flex-col">
                <Header />
                <div className="container mx-auto flex flex-grow items-center justify-center py-16">
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
            <div className="flex min-h-screen flex-col">
                <Header />
                <div className="container mx-auto my-16 px-4 flex-grow">
                    <div className="rounded-lg bg-red-50 p-6 text-center">
                        <h1 className="mb-4 text-2xl font-bold text-red-700">Product Not Found</h1>
                        <p className="mb-6 text-gray-700">
                            Sorry, we couldn't find the product you're looking for.
                            {error && <span className="block mt-2 text-sm text-red-600">Error: {error.message}</span>}
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

    return (
        <div className="flex min-h-screen flex-col">
            <Head>
                <title>{product.name} | ToolUp Store</title>
                <meta name="description" content={generatedDescription || `Buy ${product.name} at ToolUp Store`} />
            </Head>

            <Header />

            <main className="container mx-auto flex-grow px-4 py-8">
                <div className="mb-6">
                    <Link
                        href="/"
                        className="inline-flex items-center text-blue-600 hover:underline"
                    >
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
                            src={product.imageUrl || '/placeholder-product.jpg'}
                            alt={product.name}
                            className="object-contain"
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            priority
                            unoptimized={true}
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
                            <p className="text-3xl font-bold text-gray-900">{formatNairaPrice(product.price)}</p>

                            <div className="mt-4">
                                {isOutOfStock ? (
                                    <span className="inline-block rounded-full bg-red-100 px-4 py-1 text-sm font-medium text-red-800">
                                        Out of Stock
                                    </span>
                                ) : isLowStock ? (
                                    <span className="inline-block rounded-full bg-amber-100 px-4 py-1 text-sm font-medium text-amber-800">
                                        Only {product.quantity} left
                                    </span>
                                ) : (
                                    <span className="inline-block rounded-full bg-green-100 px-4 py-1 text-sm font-medium text-green-800">
                                        In Stock
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Success message */}
                        {addedToCartMessage && (
                            <div className="mb-4 rounded-md bg-green-50 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-green-800">{addedToCartMessage}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* AI-Generated Description */}
                        <div className="mb-6">
                            <h2 className="mb-2 text-lg font-medium">Description</h2>
                            <p className="text-gray-700">{generatedDescription || product.description || "Product description unavailable."}</p>
                        </div>

                        {product.specs && (
                            <div className="mb-6">
                                <h2 className="mb-2 text-lg font-medium">Specifications</h2>
                                <p className="text-gray-700">{product.specs}</p>
                            </div>
                        )}

                        {/* Quantity Selector - Simplified without increment/decrement buttons */}
                        <div className="mb-6">
                            <label htmlFor="quantity" className="mb-2 block text-sm font-medium text-gray-700">
                                Quantity
                            </label>
                            <div className="flex items-center">
                                <input
                                    type="number"
                                    id="quantity"
                                    name="quantity"
                                    min="1"
                                    max={product.quantity || 1}
                                    value={quantity}
                                    onChange={handleQuantityChange}
                                    disabled={isOutOfStock}
                                    className="h-10 w-24 rounded-lg border border-gray-300 bg-white py-2 px-3 text-center text-gray-900 disabled:cursor-not-allowed disabled:bg-gray-100"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <button
                                onClick={handleAddToCart}
                                className={`rounded-lg px-6 py-3 font-medium text-white transition-colors ${isOutOfStock
                                    ? 'cursor-not-allowed bg-gray-400'
                                    : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                                disabled={isOutOfStock}
                            >
                                Add to Cart
                            </button>

                            <button
                                onClick={handleBuyNow}
                                className={`rounded-lg px-6 py-3 font-medium text-white transition-colors ${isOutOfStock
                                    ? 'cursor-not-allowed bg-gray-400'
                                    : 'bg-green-600 hover:bg-green-700'
                                    }`}
                                disabled={isOutOfStock}
                            >
                                Buy Now
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            {/* Auth Check Modal */}
            <AuthCheckModal
                isOpen={isAuthCheckModalOpen}
                onClose={closeAuthCheckModal}
                onContinueAsGuest={handleContinueAsGuest}
                redirectPath="/checkout?mode=direct"
            />
        </div>
    );
}