// src/pages/_app.jsx
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Toaster } from 'sonner';
import '../styles/globals.css';

// Import and initialize Firebase at app startup
import { firebaseApp } from '../lib/firebase';

function MyApp({ Component, pageProps }) {
    // Optionally add Firebase initialization logging if helpful for debugging
    useEffect(() => {
        if (firebaseApp) {
            console.log('Firebase initialized successfully in _app.jsx');
        }
    }, []);

    return (
        <>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#2563EB" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            {/* Render page */}
            <Component {...pageProps} />

            {/* ✅ Notification container */}
            <Toaster richColors position="top-right" />
        </>
    );
}

export default MyApp;