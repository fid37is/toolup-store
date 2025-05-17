/* eslint-disable import/no-anonymous-default-export */
// src/lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Initialize Firebase (put your actual config in .env.local)
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Module-level variables to ensure singleton pattern
let firebaseApp;
let firebaseAuth;
let googleAuthProvider;

/**
 * Initialize Firebase if not already initialized
 * @returns The Firebase app instance
 */
export const initFirebase = () => {
    if (!firebaseApp) {
        try {
            firebaseApp = initializeApp(firebaseConfig);
            console.log('Firebase initialized successfully');
        } catch (error) {
            console.error('Firebase initialization error:', error);
            throw error;
        }
    }
    return firebaseApp;
};

/**
 * Get Firebase Auth instance
 * @returns The Firebase Auth instance
 */
export const getFirebaseAuth = () => {
    if (!firebaseAuth) {
        const app = initFirebase();
        firebaseAuth = getAuth(app);
    }
    return firebaseAuth;
};

/**
 * Get Google Auth Provider instance
 * @returns The Google Auth Provider instance
 */
export const getGoogleAuthProvider = () => {
    if (!googleAuthProvider) {
        googleAuthProvider = new GoogleAuthProvider();
    }
    return googleAuthProvider;
};

export default {
    initFirebase,
    getFirebaseAuth,
    getGoogleAuthProvider
};