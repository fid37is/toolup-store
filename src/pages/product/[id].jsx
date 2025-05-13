// src/pages/product/[id].jsx - Fixed product page with working cart functionality
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CheckoutModal from '../../components/CheckoutModal';
import '../../styles/globals.css'

export default function ProductDetail() {
    const router = useRouter();
    const { id } = router.query;

    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [addedToCartMessage, setAddedToCartMessage] = useState('');

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
            } catch (err) {
                console.error(`Failed to fetch product ${id}:`, err);
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value > 0) {
            setQuantity(value);
        }
    };

    const incrementQuantity = () => {
        if (product && quantity < product.stock) {
            setQuantity(quantity + 1);
        }
    };

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
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

            // Show success message
            setAddedToCartMessage('Item added to cart successfully!');

            // Clear the message after 3 seconds
            setTimeout(() => {
                setAddedToCartMessage('');
            }, 3000);

            // Notify other components that cart has been updated
            console.log("Dispatching cartUpdated event");
            window.dispatchEvent(new CustomEvent('cartUpdated'));
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Failed to add item to cart. Please try again.');
        }
    };

    const handleBuyNow = async () => {
        if (product) {
            // Create a single item object with product details and quantity
            const singleItem = {
                ...product,
                productId: id,
                quantity: quantity
            };

            // Open the checkout modal with this single item
            setShowCheckoutModal(true);
        }
    };

    const closeCheckoutModal = () => {
        setShowCheckoutModal(false);
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

    // Calculate stock status
    const isOutOfStock = product.stock === 0;
    const isLowStock = product.stock > 0 && product.stock <= 5;

    return (
        <div className="flex min-h-screen flex-col">
            <Head>
                <title>{product.name} | ToolUp Store</title>
                <meta name="description" content={product.description || `Buy ${product.name} at ToolUp Store`} />
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

                        {/* Quantity Selector */}
                        <div className="mb-6">
                            <label htmlFor="quantity" className="mb-2 block text-sm font-medium text-gray-700">
                                Quantity
                            </label>
                            <div className="flex items-center">
                                <button
                                    type="button"
                                    onClick={decrementQuantity}
                                    disabled={quantity <= 1 || isOutOfStock}
                                    className="h-10 w-10 rounded-l-lg border border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    id="quantity"
                                    name="quantity"
                                    min="1"
                                    max={product.stock || 1}
                                    value={quantity}
                                    onChange={handleQuantityChange}
                                    disabled={isOutOfStock}
                                    className="h-10 w-16 border-y border-gray-300 bg-white py-2 text-center text-gray-900 disabled:cursor-not-allowed disabled:bg-gray-100"
                                />
                                <button
                                    type="button"
                                    onClick={incrementQuantity}
                                    disabled={isOutOfStock || (product.stock && quantity >= product.stock)}
                                    className="h-10 w-10 rounded-r-lg border border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    +
                                </button>
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

            {/* Checkout Modal for Buy Now */}
            <CheckoutModal
                isOpen={showCheckoutModal}
                onClose={closeCheckoutModal}
                singleItem={product ? { ...product, productId: id, quantity } : null}
            />

            <Footer />
        </div>
    );
}