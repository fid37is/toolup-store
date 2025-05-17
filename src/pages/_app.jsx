// src/pages/_app.jsx
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Toaster } from 'sonner'; // ✅ Import sonner Toaster
import '../styles/globals.css';


function MyApp({ Component, pageProps }) {
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
