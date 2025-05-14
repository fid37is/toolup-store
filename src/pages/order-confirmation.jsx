// src/pages/order-confirmation.jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function OrderConfirmation() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [wasGuestCheckout, setWasGuestCheckout] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');
    
    useEffect(() => {
        // Check if user was in guest checkout mode
        const authStatus = localStorage.getItem('isAuthenticated');
        setIsAuthenticated(authStatus === 'true');
        
        // Check if we just completed a guest checkout
        const guestCheckout = localStorage.getItem('guestCheckout');
        if (guestCheckout === 'true') {
            setWasGuestCheckout(true);
            // Remove guest checkout flag as it's no longer needed
            localStorage.removeItem('guestCheckout');
        }
        
        // Generate a random order number (would come from backend in real app)
        setOrderNumber(`ORD-${Math.floor(100000 + Math.random() * 900000)}`);
    }, []);
    
    const handleCreateAccount = () => {
        router.push('/auth?redirect=account');
    };
    
    const handleContinueShopping = () => {
        router.push('/');
    };
    
    return (
        <div className="flex min-h-screen flex-col">
            <Head>
                <title>Order Confirmation | ToolUp Store</title>
                <meta name="description" content="Thank you for your order" />
            </Head>
            
            <Header />
            
            <main className="container mx-auto flex-grow px-4 py-12">
                <div className="mx-auto max-w-2xl">
                    <div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                            <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        
                        <h1 className="mb-4 text-3xl font-bold text-gray-800">Thank You for Your Order!</h1>
                        <p className="mb-6 text-gray-600">
                            Your order has been placed successfully.
                        </p>
                        
                        <div className="mb-6 bg-white p-4 rounded-lg">
                            <p className="font-medium text-gray-700">Order Number:</p>
                            <p className="text-xl font-bold text-blue-600">{orderNumber}</p>
                            <p className="mt-2 text-sm text-gray-500">
                                Please save this order number for your reference.
                            </p>
                        </div>
                        
                        <p className="text-gray-600">
                            A confirmation email has been sent to your email address.
                        </p>
                        
                        {wasGuestCheckout && !isAuthenticated && (
                            <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
                                <h2 className="mb-2 text-lg font-semibold text-blue-800">Save Your Order History</h2>
                                <p className="mb-4 text-blue-600">
                                    Create an account now to track this order and make future purchases faster!
                                </p>
                                <div className="flex flex-col sm:flex-row justify-center gap-4">
                                    <button
                                        onClick={handleCreateAccount}
                                        className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
                                    >
                                        Create an Account
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        <div className="mt-8">
                            <button
                                onClick={handleContinueShopping}
                                className="rounded-lg bg-green-600 px-6 py-2 text-white hover:bg-green-700"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            
            <Footer />
        </div>
    );
}