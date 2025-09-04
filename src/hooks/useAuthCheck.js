// src/hooks/useAuthCheck.js
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

/**
 * Hook to check Firebase authentication state and sync it with localStorage.
 */
export default function useAuthCheck() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                const userObj = {
                    id: firebaseUser.uid,
                    name: firebaseUser.displayName || '',
                    email: firebaseUser.email || '',
                };

                setIsAuthenticated(true);
                setUser(userObj);
                localStorage.setItem('user', JSON.stringify(userObj));
                localStorage.setItem('authToken', firebaseUser.accessToken || 'true');
                localStorage.setItem('isAuthenticated', 'true');
            } else {
                setIsAuthenticated(false);
                setUser(null);
                localStorage.removeItem('user');
                localStorage.removeItem('authToken');
                localStorage.removeItem('isAuthenticated');
            }

            setLoading(false);
        }, (error) => {
            console.error('Error in onAuthStateChanged:', error);
            setIsAuthenticated(false);
            setUser(null);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { isAuthenticated, user, loading };
}
