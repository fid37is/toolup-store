// src/pages/auth.jsx (modified)
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';

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
    
    // Login form state
    const [loginForm, setLoginForm] = useState({
        email: '',
        password: ''
    });
    
    // Register form state
    const [registerForm, setRegisterForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    
    // Error state
    const [error, setError] = useState('');
    
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        try {
            // In a real app, this would be an API call
            console.log('Logging in with:', loginForm);
            
            // Simulating successful login
            setTimeout(() => {
                // Store auth status and user data
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('user', JSON.stringify({
                    email: loginForm.email,
                    name: 'Sample User', // In a real app, this would come from the API
                }));
                
                // Redirect to the appropriate page
                if (redirect) {
                    router.push(redirect);
                } else {
                    router.push('/');
                }
                
                // Clear any guest checkout status if it exists
                localStorage.removeItem('guestCheckout');
            }, 1000);
        } catch (error) {
            console.error('Login error:', error);
            setError('Invalid email or password. Please try again.');
            setIsLoading(false);
        }
    };
    
    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        // Basic validation
        if (registerForm.password !== registerForm.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        
        setIsLoading(true);
        
        try {
            // In a real app, this would be an API call
            console.log('Registering with:', registerForm);
            
            // Simulating successful registration
            setTimeout(() => {
                // Store auth status and user data
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('user', JSON.stringify({
                    email: registerForm.email,
                    name: registerForm.name,
                }));
                
                // Redirect to the appropriate page
                if (redirect) {
                    router.push(redirect);
                } else {
                    router.push('/');
                }
                
                // Clear any guest checkout status if it exists
                localStorage.removeItem('guestCheckout');
            }, 1000);
        } catch (error) {
            console.error('Registration error:', error);
            setError('Registration failed. Please try again.');
            setIsLoading(false);
        }
    };
    
    const handleLoginInputChange = (e) => {
        const { name, value } = e.target;
        setLoginForm({
            ...loginForm,
            [name]: value
        });
    };
    
    const handleRegisterInputChange = (e) => {
        const { name, value } = e.target;
        setRegisterForm({
            ...registerForm,
            [name]: value
        });
    };
    
    return (
        <div className="flex min-h-screen flex-col">
            <Head>
                <title>{activeTab === 'login' ? 'Log In' : 'Register'} | ToolUp Store</title>
                <meta name="description" content="Log in or create an account" />
            </Head>
            
            <Header />
            
            <main className="container mx-auto flex-grow px-4 py-12">
                <div className="mx-auto max-w-md">
                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
                        {/* Tab navigation */}
                        <div className="flex border-b border-gray-200">
                            <button
                                className={`flex-1 py-4 text-center font-medium ${
                                    activeTab === 'login'
                                        ? 'border-b-2 border-blue-600 text-blue-600'
                                        : 'text-gray-600 hover:text-gray-800'
                                }`}
                                onClick={() => setActiveTab('login')}
                            >
                                Log In
                            </button>
                            <button
                                className={`flex-1 py-4 text-center font-medium ${
                                    activeTab === 'register'
                                        ? 'border-b-2 border-blue-600 text-blue-600'
                                        : 'text-gray-600 hover:text-gray-800'
                                }`}
                                onClick={() => setActiveTab('register')}
                            >
                                Register
                            </button>
                        </div>
                        
                        {/* Error message */}
                        {error && (
                            <div className="mx-6 mt-4 rounded-md bg-red-50 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Login form */}
                        {activeTab === 'login' && (
                            <form onSubmit={handleLoginSubmit} className="p-6">
                                <div className="mb-4">
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={loginForm.email}
                                        onChange={handleLoginInputChange}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                
                                <div className="mb-6">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={loginForm.password}
                                        onChange={handleLoginInputChange}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center">
                                        <input
                                            id="remember_me"
                                            name="remember_me"
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-700">
                                            Remember me
                                        </label>
                                    </div>
                                    
                                    <div className="text-sm">
                                        <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                                            Forgot your password?
                                        </a>
                                    </div>
                                </div>
                                
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full rounded-md bg-blue-600 py-2 px-4 text-white ${
                                        isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
                                    }`}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Logging in...
                                        </span>
                                    ) : (
                                        'Log In'
                                    )}
                                </button>
                            </form>
                        )}
                        
                        {/* Register form */}
                        {activeTab === 'register' && (
                            <form onSubmit={handleRegisterSubmit} className="p-6">
                                <div className="mb-4">
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={registerForm.name}
                                        onChange={handleRegisterInputChange}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                
                                <div className="mb-4">
                                    <label htmlFor="register_email" className="block text-sm font-medium text-gray-700">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="register_email"
                                        name="email"
                                        value={registerForm.email}
                                        onChange={handleRegisterInputChange}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                
                                <div className="mb-4">
                                    <label htmlFor="register_password" className="block text-sm font-medium text-gray-700">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        id="register_password"
                                        name="password"
                                        value={registerForm.password}
                                        onChange={handleRegisterInputChange}
                                        required
                                        minLength="6"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                
                                <div className="mb-6">
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={registerForm.confirmPassword}
                                        onChange={handleRegisterInputChange}
                                        required
                                        minLength="6"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full rounded-md bg-blue-600 py-2 px-4 text-white ${
                                        isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
                                    }`}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Creating Account...
                                        </span>
                                    ) : (
                                        'Create Account'
                                    )}
                                </button>
                            </form>
                        )}
                        
                        {/* Redirect notice */}
                        {redirect && (
                            <div className="border-t border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-600">
                                {redirect.includes('checkout') ? (
                                    <p>Complete {activeTab === 'login' ? 'login' : 'registration'} to continue with your checkout</p>
                                ) : (
                                    <p>You will be redirected after {activeTab === 'login' ? 'login' : 'registration'}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            
            <Footer />
        </div>
    );
}