// src/components/AuthCheckModal.jsx
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function AuthCheckModal({ isOpen, onClose, onContinueAsGuest, redirectPath = '/checkout' }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = () => {
        setIsLoading(true);
        router.push(`/auth?redirect=${redirectPath}`);
    };

    const handleRegister = () => {
        setIsLoading(true);
        router.push(`/auth?redirect=${redirectPath}&tab=register`);
    };

    const handleContinueAsGuest = () => {
        setIsLoading(true);
        // Set guest checkout flag in localStorage
        localStorage.setItem('guestCheckout', 'true');
        onContinueAsGuest();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold text-gray-800">Almost there!</h2>
                    <p className="mt-2 text-gray-600">Please select how you'd like to continue</p>
                </div>

                <div className="mb-8 space-y-4">
                    <button
                        onClick={handleLogin}
                        disabled={isLoading}
                        className="w-full rounded-md bg-blue-600 py-2 px-4 text-white transition hover:bg-blue-700 disabled:opacity-70"
                    >
                        Log in to your account
                    </button>

                    <button
                        onClick={handleRegister}
                        disabled={isLoading}
                        className="w-full rounded-md bg-green-600 py-2 px-4 text-white transition hover:bg-green-700 disabled:opacity-70"
                    >
                        Create an account
                    </button>

                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="mx-4 flex-shrink text-sm text-gray-500">or</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>

                    <button
                        onClick={handleContinueAsGuest}
                        disabled={isLoading}
                        className="w-full rounded-md border border-gray-300 bg-white py-2 px-4 text-gray-700 transition hover:bg-gray-50 disabled:opacity-70"
                    >
                        Continue as guest
                    </button>
                </div>

                <div className="rounded-md bg-blue-50 p-4">
                    <h3 className="text-sm font-medium text-blue-800">Benefits of creating an account:</h3>
                    <ul className="mt-2 list-inside list-disc text-xs text-blue-700">
                        <li>Save your shipping details for faster checkout</li>
                        <li>Track your orders and view order history</li>
                        <li>Get updates on exclusive offers and promotions</li>
                        <li>Easily manage returns and exchanges</li>
                    </ul>
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                    aria-label="Close"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}