// src/pages/product/[id].jsx - Product page with fixed auth flow integration
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import LoadingScreen from '../../components/LoadingScreen';
import { formatNairaPrice } from '../../utils/currency-formatter';
import { toast } from 'sonner';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { initFirebase } from '../../lib/firebase';
import '../../styles/globals.css'

export default function ProductDetail() {
    const router = useRouter();
    const { id } = router.query;
    
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [generatedDescription, setGeneratedDescription] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [authCheckComplete, setAuthCheckComplete] = useState(false);

    const quantityNum = Number(product?.quantity || 0);
    const isOutOfStock = quantityNum === 0;
    const isLowStock = quantityNum > 0 && quantityNum <= 4;

    useEffect(() => {
        // Initialize Firebase and check authentication status
        const app = initFirebase();
        const auth = getAuth(app);
        
        // Set up auth state listener
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            const wasAuthenticated = isAuthenticated;
            const newAuthState = !!user;
            setIsAuthenticated(newAuthState);
            setAuthCheckComplete(true);
            
            // Check if user just logged in and has a pending checkout
            if (!wasAuthenticated && newAuthState) {
                const pendingCheckout = localStorage.getItem('pendingCheckout');
                if (pendingCheckout === 'true') {
                    // Clear the pending checkout flag
                    localStorage.removeItem('pendingCheckout');
                    
                    // If there's a directPurchaseItem, route to checkout
                    const directItem = localStorage.getItem('directPurchaseItem');
                    if (directItem) {
                        console.log('Detected login during checkout flow, redirecting to checkout');
                        // Small delay to ensure auth state is fully processed
                        setTimeout(() => {
                            router.push('/checkout?mode=direct');
                        }, 100);
                    }
                }
            }
        });
        
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
        
        // Check for redirected auth flow
        const checkPendingAuth = () => {
            // Check URL parameters for 'from=auth' to detect returning from auth page
            const fromAuth = router.query.from === 'auth';
            if (fromAuth) {
                // User has returned from auth page, check for directPurchaseItem
                const directItem = localStorage.getItem('directPurchaseItem');
                if (directItem) {
                    console.log('Detected return from auth with purchase item, redirecting to checkout');
                    // Remove pending checkout flag if it exists
                    localStorage.removeItem('pendingCheckout');
                    // Redirect to checkout
                    router.push('/checkout?mode=direct');
                }
            }
        };
        
        // Only run this check when router is ready and auth check is complete
        if (router.isReady && authCheckComplete) {
            checkPendingAuth();
        }
        
        // Clean up listener on unmount
        return () => unsubscribe();
    }, [id, router, isAuthenticated, authCheckComplete, router.isReady]);

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

    // Updated handleBuyNow to show auth modal if not authenticated
    const handleBuyNow = () => {
        if (!product || !id) {
            console.error("Product or product ID is missing");
            return;
        }

        setIsCheckingOut(true);
        
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
            
            // Check if user is authenticated
            if (isAuthenticated) {
                // Redirect directly to checkout if authenticated
                router.push('/checkout?mode=direct');
            } else {
                // Show the auth modal instead of redirecting
                setShowAuthModal(true);
            }
        } catch (error) {
            console.error('Error processing direct purchase:', error);
            toast.error('Failed to proceed to checkout. Please try again.');
            setIsCheckingOut(false);
        }
    };
    
    const handleGuestCheckout = () => {
        // Set the guest checkout flag in localStorage
        localStorage.setItem('guestCheckout', 'true');
        setShowAuthModal(false);
        setIsCheckingOut(false);
        
        // Redirect to checkout page
        router.push('/checkout?mode=direct');
    };

    const handleLoginRegister = () => {
        // Store information about the product being purchased
        // This will allow us to redirect back to checkout after authentication
        try {
            // Save the direct purchase information
            const checkoutItem = {
                productId: id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                quantity: quantity
            };
            localStorage.setItem('directPurchaseItem', JSON.stringify(checkoutItem));
            
            // Also store a flag indicating the user was in a checkout flow
            localStorage.setItem('pendingCheckout', 'true');
            
            // Redirect to authentication page with a return URL to checkout
            setShowAuthModal(false);
            setIsCheckingOut(false);
            // Add from=product param so we can detect return from auth page
            router.push(`/auth?redirect=${encodeURIComponent('/checkout?mode=direct')}&source=product&productId=${id}`);
        } catch (error) {
            console.error('Error saving checkout state:', error);
            toast.error('Something went wrong. Please try again.');
            setIsCheckingOut(false);
        }
    };

    const handleCloseAuthModal = () => {
        // User canceled the auth flow, just close the auth modal
        setShowAuthModal(false);
        setIsCheckingOut(false);
    };

    if (isLoading) {
        // Use the custom LoadingScreen component
        return <LoadingScreen message="Loading product details..." />;
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
                            className="rounded-lg bg-primary-500 px-6 py-2 text-white hover:bg-primary-700"
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

            {/* Auth Modal */}
            {showAuthModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-auto">
                    <div className="w-full max-w-md mx-auto rounded-lg bg-white p-6 shadow-xl">
                        <div className="mb-4 text-center">
                            <h2 className="text-2xl font-bold text-gray-800">Choose Checkout Option</h2>
                            <p className="mt-2 text-sm text-gray-600">
                                You can continue as a guest or create an account for a faster checkout experience.
                            </p>
                        </div>
                        
                        <div className="mt-6 grid grid-cols-1 gap-4">
                            <button
                                onClick={handleLoginRegister}
                                className="rounded-lg bg-blue-600 px-4 py-3 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                <div className="flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                    Log In or Register
                                </div>
                                <p className="mt-1 text-xs text-blue-100">
                                    Track orders, save your info for faster checkout
                                </p>
                            </button>
                            
                            <button
                                onClick={handleGuestCheckout}
                                className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                <div className="flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8z" />
                                    </svg>
                                    Continue as Guest
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    Checkout quickly without creating an account
                                </p>
                            </button>
                            
                            <div className="mt-4 text-center">
                                <button
                                    onClick={handleCloseAuthModal}
                                    className="text-sm text-gray-600 hover:text-gray-800 hover:underline"
                                >
                                    Cancel and return to product
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <main className="container mx-auto flex-grow px-4 py-8">
                <div className="mb-6">
                    <Link
                        href="/"
                        className="inline-flex items-center text-primary-500 hover:underline"
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
                                    : 'bg-primary-500 hover:bg-primary-700'
                                    }`}
                                disabled={isOutOfStock}
                            >
                                Add to Cart
                            </button>

                            <button
                                onClick={handleBuyNow}
                                className={`rounded-lg px-6 py-3 font-medium text-white transition-colors ${isOutOfStock || isCheckingOut
                                    ? 'cursor-not-allowed bg-gray-400'
                                    : 'bg-green-600 hover:bg-green-700'
                                    }`}
                                disabled={isOutOfStock || isCheckingOut}
                            >
                                {isCheckingOut ? (
                                    <>
                                        <span className="mr-2">
                                            <LoadingScreen message="" />
                                        </span>
                                        Processing...
                                    </>
                                ) : "Buy Now"}
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}