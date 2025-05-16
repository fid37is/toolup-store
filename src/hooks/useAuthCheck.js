// src/hooks/useAuthCheck.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const useAuthCheck = () => {
    const router = useRouter();

    // Auth & user info
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Modal & redirect state
    const [isAuthCheckModalOpen, setIsAuthCheckModalOpen] = useState(false);
    const [redirectPath, setRedirectPath] = useState(null);

    // Check auth status from localStorage
    const checkAuthStatus = () => {
        try {
            const authStatus = localStorage.getItem('isAuthenticated');
            const authToken = localStorage.getItem('authToken');
            if (authStatus === 'true' && authToken) {
                const userData = JSON.parse(localStorage.getItem('user') || '{}');
                setIsAuthenticated(true);
                setUser(userData);
            } else {
                setIsAuthenticated(false);
                setUser(null);
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuthStatus();
    }, []);

    // Check if currently authenticated (boolean)
    const currentlyAuthenticated = () => {
        if (typeof window === 'undefined') return false;
        const token = localStorage.getItem('authToken');
        return !!token;
    };

    // Start auth check flow or redirect immediately if authed
    const initiateAuthCheck = (path) => {
        if (currentlyAuthenticated()) {
            router.push(path);
            return;
        }
        setRedirectPath(path);
        setIsAuthCheckModalOpen(true);
    };

    // Handle guest checkout
    const handleContinueAsGuest = () => {
        localStorage.setItem('guestCheckout', 'true');
        closeAuthCheckModal();
        if (redirectPath) {
            router.push(redirectPath);
        }
    };

    // Close modal
    const closeAuthCheckModal = () => {
        setIsAuthCheckModalOpen(false);
    };

    return {
        isAuthenticated,
        user,
        loading,
        isAuthCheckModalOpen,
        redirectPath,
        checkAuthStatus,
        initiateAuthCheck,
        handleContinueAsGuest,
        closeAuthCheckModal,
    };
};

export default useAuthCheck;
