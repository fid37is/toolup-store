import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

// Import our new components
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import GoogleSignIn from '../components/auth/GoogleSignIn';

export default function Auth() {
    const router = useRouter();
    const { redirect, tab } = router.query;

    const [activeTab, setActiveTab] = useState('login');
    const [isLoading, setIsLoading] = useState(false);

    // Set active tab based on query parameter
    useEffect(() => {
        if (tab === 'register') {
            setActiveTab('register');
        }
    }, [tab]);

    // Check authentication state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // User is signed in, always redirect to homepage
                router.push('/');
            }
        });

        return () => unsubscribe();
    }, [router]);

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <Head>
                <title>{activeTab === 'login' ? 'Log In' : 'Register'} | ToolUp Store</title>
                <meta name="description" content="Log in or create an account" />
            </Head>

            <Header />

            <main className="container mx-auto flex-grow px-4 py-12">
                <div className="mx-auto max-w-md">
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                        {/* Tab navigation */}
                        <div className="flex border-b border-gray-200">
                            <button
                                className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'login'
                                    ? 'border-b-2 border-primary-500 text-primary-600 bg-gray-50'
                                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                                    }`}
                                onClick={() => setActiveTab('login')}
                            >
                                Log In
                            </button>
                            <button
                                className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'register'
                                    ? 'border-b-2 border-primary-500 text-primary-600 bg-gray-50'
                                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                                    }`}
                                onClick={() => setActiveTab('register')}
                            >
                                Register
                            </button>
                        </div>

                        {/* Google Sign-In Section */}
                        <GoogleSignIn />

                        {/* Login or Register Form */}
                        {activeTab === 'login' ? (
                            <LoginForm isLoading={isLoading} setIsLoading={setIsLoading} />
                        ) : (
                            <RegisterForm isLoading={isLoading} setIsLoading={setIsLoading} />
                        )}
                    </div>

                    {/* Enhanced UI Element: Call to Action Card */}
                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl text-center shadow-sm border border-blue-100">
                        <h3 className="text-primary-700 font-medium mb-2">Need Professional Tools?</h3>
                        <p className="text-gray-600 text-sm">Create an account today to access exclusive products and special offers!</p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}