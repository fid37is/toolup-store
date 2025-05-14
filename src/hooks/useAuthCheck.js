// src/hooks/useAuthCheck.js - Simple fix for auth check
import { useState } from 'react';
import { useRouter } from 'next/router';

const useAuthCheck = () => {
    const router = useRouter();
    const [isAuthCheckModalOpen, setIsAuthCheckModalOpen] = useState(false);
    const [redirectPath, setRedirectPath] = useState(null);
    
    // Check if user is authenticated
    const isAuthenticated = () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
        return !!token;
    };

    // Initialize the auth check process
    const initiateAuthCheck = (path) => {
        // If user is already authenticated, redirect immediately
        if (isAuthenticated()) {
            router.push(path);
            return;
        }
        
        // Store the redirect path and open the modal
        setRedirectPath(path);
        setIsAuthCheckModalOpen(true);
    };

    // Handle "Continue as Guest" option
    const handleContinueAsGuest = () => {
        // Set guest checkout flag
        localStorage.setItem('guestCheckout', 'true');
        
        // Close modal and redirect
        closeAuthCheckModal();
        
        // Redirect to the stored path
        if (redirectPath) {
            router.push(redirectPath);
        }
    };

    // Close the auth check modal
    const closeAuthCheckModal = () => {
        setIsAuthCheckModalOpen(false);
    };

    return {
        isAuthenticated: isAuthenticated(),
        isAuthCheckModalOpen,
        redirectPath,
        initiateAuthCheck,
        handleContinueAsGuest,
        closeAuthCheckModal
    };
};

export default useAuthCheck;