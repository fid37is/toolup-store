// src/hooks/useAuthFlow.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

/**
 * Custom hook to handle authentication flow across the application
 * @param {Object} options - Configuration options
 * @param {string} options.redirectPath - Path to redirect after authentication
 * @param {string} options.mode - Checkout mode ('direct' or 'cart')
 * @param {Object} options.item - Direct purchase item (when mode is 'direct')
 * @returns {Object} Auth flow state and handlers
 */
export default function useAuthFlow({ redirectPath = '/checkout', mode = 'cart', item = null }) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Check authentication status on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // In a real app, this would be a proper auth check
                // For this implementation, check if there's a user token in localStorage
                const userToken = localStorage.getItem('userToken');
                setIsAuthenticated(!!userToken);
            } catch (err) {
                console.error('Auth check failed:', err);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    // Initialize auth flow check
    const initiateAuthFlow = (customRedirectPath = null) => {
        // If already authenticated, redirect directly
        if (isAuthenticated) {
            if (mode === 'direct' && item) {
                // Save the direct purchase item
                localStorage.setItem('directPurchaseItem', JSON.stringify(item));
            }

            router.push(customRedirectPath || redirectPath);
            return;
        }

        // If not authenticated, show the modal
        setIsModalOpen(true);
    };

    // Handle guest checkout
    const handleGuestCheckout = () => {
        // Set guest checkout flag in localStorage
        localStorage.setItem('guestCheckout', 'true');

        // If direct purchase mode, save the item
        if (mode === 'direct' && item) {
            localStorage.setItem('directPurchaseItem', JSON.stringify(item));
        }

        setIsModalOpen(false);
        router.push(redirectPath);
    };

    // Handle login/register
    const handleLoginRegister = () => {
        // If direct purchase mode, save the item before redirecting
        if (mode === 'direct' && item) {
            localStorage.setItem('directPurchaseItem', JSON.stringify(item));
        }

        setIsModalOpen(false);
        router.push(`/auth?redirect=${encodeURIComponent(redirectPath)}`);
    };

    // Close the modal
    const closeModal = () => {
        setIsModalOpen(false);
    };

    return {
        isAuthenticated,
        isLoading,
        isModalOpen,
        initiateAuthFlow,
        handleGuestCheckout,
        handleLoginRegister,
        closeModal
    };
}