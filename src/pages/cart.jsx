// src/pages/cart.jsx
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import LoadingScreen from '../components/LoadingScreen';
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ArrowLeft, ShoppingCart } from 'lucide-react';

const CartPage = () => {
    const router = useRouter();
    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    useEffect(() => {
        fetchCartItems();
    }, []);

    const fetchCartItems = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Try API first
            let items = [];
            try {
                const response = await fetch('/api/cart');
                if (response.ok) {
                    items = await response.json();
                    console.log('Cart items loaded from API:', items);
                }
            } catch (err) {
                console.log('API fetch failed, falling back to localStorage');
            }

            // If API fails or returns no items, use localStorage
            if (!items || items.length === 0) {
                try {
                    const cartData = localStorage.getItem('cart');
                    if (cartData) {
                        items = JSON.parse(cartData);
                        console.log('Cart items loaded from localStorage:', items);
                    }
                } catch (err) {
                    console.error('Error parsing stored cart:', err);
                    setError(new Error('Failed to load cart data'));
                }
            }

            setCartItems(items || []);
        } catch (err) {
            console.error('Failed to fetch cart items:', err);
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    const updateQuantity = async (productId, newQuantity) => {
        try {
            // If quantity is zero or less, remove the item
            if (newQuantity <= 0) {
                await removeItem(productId);
                return;
            }

            // Update in localStorage first
            let updatedCart = [...cartItems];
            const itemIndex = updatedCart.findIndex(item => item.productId === productId);

            if (itemIndex >= 0) {
                updatedCart[itemIndex].quantity = newQuantity;
                localStorage.setItem('cart', JSON.stringify(updatedCart));

                // Update local state
                setCartItems(updatedCart);

                // Also try to update via API (in a real app)
                try {
                    await fetch('/api/cart', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            productId,
                            quantity: newQuantity
                        }),
                    });
                } catch (err) {
                    console.log('API update failed, but localStorage was updated');
                }

                // Dispatch a custom event so the header can update the cart count
                window.dispatchEvent(new CustomEvent('cartUpdated'));
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
            alert('Failed to update quantity. Please try again.');
        }
    };

    const removeItem = async (productId) => {
        try {
            // Remove from localStorage first
            let updatedCart = cartItems.filter(item => item.productId !== productId);
            localStorage.setItem('cart', JSON.stringify(updatedCart));

            // Update local state
            setCartItems(updatedCart);

            // Try to remove via API (in a real app)
            try {
                await fetch('/api/cart', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        productId
                    }),
                });
            } catch (err) {
                console.log('API deletion failed, but localStorage was updated');
            }

            // Dispatch event to update cart count in header
            window.dispatchEvent(new CustomEvent('cartUpdated'));
        } catch (error) {
            console.error('Error removing item:', error);
            alert('Failed to remove item. Please try again.');
        }
    };

    const handleCheckout = () => {
        setIsCheckingOut(true);
        router.push('/checkout');
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0).toFixed(2);
    };

    const continueShopping = () => {
        router.push('/');
    };

    const goBack = () => {
        router.back();
    };

    return (
        <>
            <Head>
                <title>Your Cart</title>
                <meta name="description" content="View your shopping cart" />
            </Head>
            
            <div className="flex flex-col min-h-screen">
                <Header />
                
                <main className="flex-grow">
                    <div className="container mx-auto px-4 py-8 max-w-5xl">
                        <div className="flex items-center justify-between mb-6 border-b pb-4">
                            <button 
                                onClick={goBack} 
                                className="flex items-center text-gray-600 hover:text-primary-500 transition"
                                aria-label="Go back"
                            >
                                <ArrowLeft className="h-5 w-5 mr-2" />
                                <span className="hidden sm:inline">Back</span>
                            </button>
                            
                            <h1 className="text-xl sm:text-2xl font-bold flex items-center">
                                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                                Your Shopping Cart
                            </h1>
                            
                            <div className="w-10 sm:w-24">
                                {/* Empty div for balanced layout */}
                            </div>
                        </div>

                        <div className="min-h-[60vh]">
                            {isLoading ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="w-full">
                                        <LoadingScreen message="Loading your cart..." />
                                    </div>
                                </div>
                            ) : error ? (
                                <div className="text-center text-red-600 p-4">
                                    Error loading cart: {error.message}
                                </div>
                            ) : cartItems.length === 0 ? (
                                <div className="text-center p-6 sm:p-8 bg-white rounded-lg shadow">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    <p className="text-lg sm:text-xl font-medium text-gray-600 mb-2">Your cart is empty</p>
                                    <p className="text-gray-500 mb-6">Looks like you haven&apos;t added any products to your cart yet.</p>
                                    <button 
                                        onClick={continueShopping}
                                        className="px-5 py-2 sm:px-6 sm:py-3 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition"
                                    >
                                        Browse Products
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Cart Items Section */}
                                    <div className="lg:col-span-2">
                                        <ul className="divide-y divide-gray-200 bg-white rounded-lg shadow overflow-hidden">
                                            {cartItems.map((item) => (
                                                <li key={item.productId} className="p-4 hover:bg-gray-50 transition">
                                                    <div className="flex flex-col sm:flex-row sm:space-x-4">
                                                        <div className="relative h-24 w-24 sm:h-24 sm:w-24 mx-auto sm:mx-0 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 mb-4 sm:mb-0">
                                                            <Image
                                                                src={item.imageUrl || '/placeholder-product.jpg'}
                                                                alt={item.name}
                                                                fill
                                                                sizes="96px"
                                                                className="object-contain"
                                                                unoptimized={true}
                                                            />
                                                        </div>
                                                        <div className="flex flex-1 flex-col">
                                                            <div className="flex flex-col sm:flex-row justify-between text-base font-medium text-gray-900 mb-2 sm:mb-0">
                                                                <h3 className="text-lg text-center sm:text-left">{item.name}</h3>
                                                                <p className="text-lg text-center sm:text-right sm:ml-4">${parseFloat(item.price).toFixed(2)}</p>
                                                            </div>
                                                            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between">
                                                                <div className="flex items-center border rounded mb-3 sm:mb-0">
                                                                    <button
                                                                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                                        className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                                                        aria-label="Decrease quantity"
                                                                    >
                                                                        -
                                                                    </button>
                                                                    <span className="px-4 py-1">{item.quantity}</span>
                                                                    <button
                                                                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                                        className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                                                        aria-label="Increase quantity"
                                                                    >
                                                                        +
                                                                    </button>
                                                                </div>
                                                                <button
                                                                    onClick={() => removeItem(item.productId)}
                                                                    className="flex items-center text-red-500 hover:text-red-700"
                                                                    aria-label="Remove item"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                    Remove
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Order Summary Section */}
                                    <div className="lg:col-span-1">
                                        <div className="bg-white p-6 rounded-lg shadow sticky top-4">
                                            <h2 className="text-lg font-bold mb-4">Order Summary</h2>
                                            
                                            <div className="space-y-2 mb-4">
                                                <div className="flex justify-between items-center">
                                                    <p className="text-gray-600 truncate pr-2">Subtotal ({cartItems.reduce((total, item) => total + item.quantity, 0)} items)</p>
                                                    <p className="text-gray-800 font-medium flex-shrink-0">${calculateTotal()}</p>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <p className="text-gray-600">Shipping</p>
                                                    <p className="text-gray-800 flex-shrink-0 text-right">Calculated at checkout</p>
                                                </div>
                                            </div>
                                            
                                            <div className="border-t pt-4 mb-6">
                                                <div className="flex justify-between items-center">
                                                    <p className="font-bold text-lg">Total</p>
                                                    <p className="font-bold text-lg">${calculateTotal()}</p>
                                                </div>
                                            </div>
                                            
                                            <button
                                                onClick={handleCheckout}
                                                disabled={isCheckingOut}
                                                className="w-full rounded bg-primary-500 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-primary-700 flex items-center justify-center transition-colors"
                                            >
                                                {isCheckingOut ? (
                                                    <>
                                                        <div className="mr-2">
                                                            <LoadingScreen message="" />
                                                        </div>
                                                        Processing...
                                                    </>
                                                ) : "Proceed to Checkout"}
                                            </button>
                                            
                                            <div className="mt-4">
                                                <button
                                                    onClick={continueShopping}
                                                    className="w-full py-2 text-primary-500 hover:text-primary-700 font-medium flex items-center justify-center transition-colors"
                                                >
                                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                                    Continue Shopping
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
                
                <Footer />
            </div>
        </>
    );
};

export default CartPage;