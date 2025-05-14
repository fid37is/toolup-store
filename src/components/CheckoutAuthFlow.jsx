// src/components/CheckoutAuthFlow.jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';

export default function CheckoutAuthFlow() {
    const router = useRouter();
    const [cartItems, setCartItems] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(true);

    useEffect(() => {
        // Load cart items from localStorage
        const mode = router.query.mode;
        let items = [];
        
        if (mode === 'direct') {
            // Direct checkout from product page
            const directItem = JSON.parse(localStorage.getItem('directPurchaseItem') || 'null');
            if (directItem) {
                items = [directItem];
            }
        } else {
            // Regular checkout from cart
            const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
            items = cartItems;
        }
        
        setCartItems(items);
    }, [router.query.mode]);

    const handleGuestCheckout = () => {
        // Set the guest checkout flag in localStorage
        localStorage.setItem('guestCheckout', 'true');
        setIsModalOpen(false);
        
        // Redirect back to checkout page
        router.push('/checkout');
    };

    const handleLoginRegister = () => {
        // Redirect to authentication page with a return URL to checkout
        router.push(`/auth?redirect=${encodeURIComponent('/checkout')}`);
    };

    const handleCloseModal = () => {
        // If they close the modal without choosing, take them back to cart
        setIsModalOpen(false);
        router.push('/cart');
    };

    return (
        <div className="flex min-h-screen flex-col">
            <Head>
                <title>Checkout Options | ToolUp Store</title>
                <meta name="description" content="Choose how you'd like to checkout" />
            </Head>

            <Header />

            <main className="container mx-auto flex-grow px-4 py-16">
                {/* Cart Summary */}
                <div className="mx-auto max-w-2xl">
                    <h1 className="mb-6 text-center text-3xl font-bold">Your Cart</h1>
                    
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
                        {cartItems.length > 0 ? (
                            <>
                                <div className="mb-4 space-y-4">
                                    {cartItems.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                {item.imageUrl && (
                                                    <div className="mr-3 h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-100">
                                                        <img
                                                            src={item.imageUrl}
                                                            alt={item.name}
                                                            className="h-full w-full object-contain"
                                                        />
                                                    </div>
                                                )}
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                                                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                            <p className="font-medium text-gray-900">
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 border-t border-gray-200 pt-4">
                                    <div className="flex justify-between text-base font-medium text-gray-900">
                                        <p>Subtotal</p>
                                        <p>${cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <p className="text-center text-gray-500">No items in your cart</p>
                        )}
                    </div>
                </div>

                {/* Auth Options Modal - Always visible on this page */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
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
                                        onClick={handleCloseModal}
                                        className="text-sm text-gray-600 hover:text-gray-800 hover:underline"
                                    >
                                        Cancel and return to cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}