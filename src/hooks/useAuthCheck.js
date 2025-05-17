// src/hooks/useAuthCheck.js
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { getFirebaseAuth, initFirebase } from '../lib/firebase';

/**
 * Checks if the user is authenticated (local token or Firebase)
 */
export default function useAuthCheck() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkLocalAuth = () => {
            const authToken = localStorage.getItem('authToken');
            const userToken = localStorage.getItem('userToken');
            const jwtToken = localStorage.getItem('jwtToken');
            const storedUser = localStorage.getItem('user');

            if (authToken || userToken || jwtToken) {
                const parsedUser = storedUser ? JSON.parse(storedUser) : null;
                setUser(parsedUser);
                setIsAuthenticated(true);
                setIsLoading(false);
                return true;
            }
            return false;
        };

        if (checkLocalAuth()) return;

        try {
            initFirebase();
            const auth = getFirebaseAuth();

            const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
                if (currentUser) {
                    const userObj = {
                        id: currentUser.uid,
                        name: currentUser.displayName,
                        email: currentUser.email
                    };

                    setIsAuthenticated(true);
                    setUser(userObj);

                    localStorage.setItem('user', JSON.stringify(userObj));
                    localStorage.setItem('authToken', currentUser.accessToken || 'true');
                    localStorage.setItem('isAuthenticated', 'true');
                } else {
                    if (!checkLocalAuth()) {
                        setIsAuthenticated(false);
                        setUser(null);
                        localStorage.removeItem('user');
                        localStorage.removeItem('authToken');
                        localStorage.removeItem('isAuthenticated');
                    }
                }
                setIsLoading(false);
            }, (error) => {
                console.error('Firebase auth error:', error);
                checkLocalAuth();
                setIsLoading(false);
            });

            return () => unsubscribe();
        } catch (err) {
            console.error('Auth check failed:', err);
            checkLocalAuth();
            setIsLoading(false);
        }
    }, []);

    return { isAuthenticated, user, loading };
}