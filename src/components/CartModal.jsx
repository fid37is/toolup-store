// src/components/CartModal.jsx
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { initFirebase } from '../lib/firebase'; // Adjust path if necessary
import LoadingScreen from './LoadingScreen'; // Import your custom loading component

const CartModal = ({ isOpen, onClose }) => {
    const router = useRouter();
    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    
    useEffect(() => {
        // Initialize Firebase and check authentication status
        const app = initFirebase();
        const auth = getAuth(app);
        
        // Set up auth state listener
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setIsAuthenticated(!!user);
        });
        
        // Fetch cart items when modal is opened
        if (isOpen) {
            fetchCartItems();
        }
        
        // Clean up listener on unmount
        return () => unsubscribe();
    }, [isOpen]);

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
        
        // Check if user is authenticated
        if (isAuthenticated) {
            // Redirect directly to checkout if authenticated
            onClose(); // Close the cart modal first
            router.push('/checkout');
        } else {
            // Show the auth modal instead of redirecting
            setShowAuthModal(true);
        }
    };
    
    const handleGuestCheckout = () => {
        // Set the guest checkout flag in localStorage
        localStorage.setItem('guestCheckout', 'true');
        setShowAuthModal(false);
        setIsCheckingOut(false);
        
        // Redirect to checkout page
        onClose(); // Close the cart modal
        router.push('/checkout');
    };

    const handleLoginRegister = () => {
        // Redirect to authentication page with a return URL to checkout
        onClose(); // Close the cart modal
        router.push(`/auth?redirect=${encodeURIComponent('/checkout')}`);
    };

    const handleCloseAuthModal = () => {
        // User canceled the auth flow, just close the auth modal and return to cart
        setShowAuthModal(false);
        setIsCheckingOut(false);
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0).toFixed(2);
    };

    // If the modal is not open, don't render anything
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black bg-opacity-50 overflow-auto">
            {showAuthModal ? (
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
                                Cancel and return to cart
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-full w-full max-w-md bg-white shadow-lg flex flex-col animate-slide-in-right">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <h2 className="text-xl font-bold">Your Cart</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                            aria-label="Close cart"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex-grow overflow-y-auto p-4">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-full">
                                {/* Replace default spinner with your custom LoadingScreen component */}
                                <div className="w-full">
                                    <LoadingScreen message="Loading your cart..." />
                                </div>
                            </div>
                        ) : error ? (
                            <div className="text-center text-red-600 p-4">
                                Error loading cart: {error.message}
                            </div>
                        ) : cartItems.length === 0 ? (
                            <div className="text-center p-8">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                <p className="text-xl font-medium text-gray-600 mb-2">Your cart is empty</p>
                                <p className="text-gray-500">Looks like you haven't added any products to your cart yet.</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-200">
                                {cartItems.map((item) => (
                                    <li key={item.productId} className="py-4">
                                        <div className="flex space-x-4">
                                            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                                <Image
                                                    src={item.imageUrl || '/placeholder-product.jpg'}
                                                    alt={item.name}
                                                    fill
                                                    sizes="80px"
                                                    className="object-contain"
                                                    unoptimized={true}
                                                />
                                            </div>
                                            <div className="flex flex-1 flex-col">
                                                <div className="flex justify-between text-base font-medium text-gray-900">
                                                    <h3>{item.name}</h3>
                                                    <p className="ml-4">${parseFloat(item.price).toFixed(2)}</p>
                                                </div>
                                                <div className="mt-2 flex items-center justify-between">
                                                    <div className="flex items-center border rounded">
                                                        <button
                                                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                                                            aria-label="Decrease quantity"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="px-3">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                                                            aria-label="Increase quantity"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {cartItems.length > 0 && (
                        <div className="border-t border-gray-200 p-4">
                            <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                                <p>Subtotal</p>
                                <p>${calculateTotal()}</p>
                            </div>
                            <button
                                onClick={handleCheckout}
                                disabled={isCheckingOut}
                                className="w-full rounded bg-primary-500 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-primary-700 flex items-center justify-center"
                            >
                                {isCheckingOut ? (
                                    <>
                                        <div className="mr-2">
                                            <LoadingScreen message="" />
                                        </div>
                                        Processing...
                                    </>
                                ) : "Checkout"}
                            </button>
                            <div className="mt-3 flex justify-center text-center text-sm text-gray-500">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="font-medium text-primary-500 hover:text-primary-700"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CartModal;