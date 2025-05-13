// pages/checkout.js
import CheckoutPage from '../components/CheckoutPage';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Checkout() {
    const router = useRouter();
    const [, setCartItems] = useState([]);
    const [userProfile, setUserProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // Check for direct purchase mode
    const { mode } = router.query;
    
    // Items to display in checkout (either from cart or direct purchase)
    const [checkoutItems, setCheckoutItems] = useState([]);

    useEffect(() => {
        // Only proceed when router is ready
        if (!router.isReady) return;
        
        setIsLoading(true);
        
        // Load user profile
        try {
            const storedProfile = localStorage.getItem('userProfile');
            if (storedProfile) {
                setUserProfile(JSON.parse(storedProfile));
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        }
        
        // Handle direct purchase mode
        if (mode === 'direct') {
            try {
                console.log("Direct purchase mode detected");
                const directItem = localStorage.getItem('directPurchaseItem');
                
                if (directItem) {
                    const parsedItem = JSON.parse(directItem);
                    setCheckoutItems([parsedItem]); // Add as array with single item
                    console.log("Loaded direct purchase item:", parsedItem);
                } else {
                    console.error("Direct purchase item not found in localStorage");
                    // Redirect to cart if direct purchase item is missing
                    router.replace('/cart');
                }
            } catch (error) {
                console.error('Error loading direct purchase item:', error);
                router.replace('/cart');
            }
        } 
        // Regular cart checkout mode
        else {
            try {
                console.log("Regular cart checkout mode");
                const storedCart = localStorage.getItem('cart');
                
                if (storedCart) {
                    const parsedCart = JSON.parse(storedCart);
                    setCartItems(parsedCart);
                    setCheckoutItems(parsedCart);
                    console.log("Loaded cart items:", parsedCart);
                } else {
                    console.log("No items in cart");
                    setCartItems([]);
                    setCheckoutItems([]);
                }
            } catch (error) {
                console.error('Error loading cart:', error);
                setCartItems([]);
                setCheckoutItems([]);
            }
        }
        
        setIsLoading(false);
    }, [router.isReady, mode, router]);

    // Handle order completion
    const handleOrderComplete = () => {
        if (mode === 'direct') {
            // Clear direct purchase item
            localStorage.removeItem('directPurchaseItem');
        } else {
            // Clear cart
            localStorage.removeItem('cart');
            // Notify other components that cart has been updated
            window.dispatchEvent(new CustomEvent('cartUpdated'));
        }
        
        // Redirect to confirmation page
        router.push('/order-confirmation');
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Show empty cart message for regular checkout mode with no items
    if (checkoutItems.length === 0 && mode !== 'direct') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen px-4">
                <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
                <p className="text-gray-600 mb-6">You have no items in your cart.</p>
                <button
                    onClick={() => router.push('/')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                    Continue Shopping
                </button>
            </div>
        );
    }

    return (
        <CheckoutPage
            cartItems={checkoutItems}
            userProfile={userProfile || {
                fullName: '',
                email: '',
                phone: '',
                address: '',
                city: '',
                state: '',
                zipCode: '',
            }}
            isDirectCheckout={mode === 'direct'}
            onOrderComplete={handleOrderComplete}
        />
    );
}