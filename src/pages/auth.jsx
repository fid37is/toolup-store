// src/pages/auth.jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { toast } from 'sonner';

import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    onAuthStateChanged
} from 'firebase/auth';
// Import the pre-initialized auth and providers
import { auth, googleProvider } from '../lib/firebase';
// Import icons for password visibility
import { Eye, EyeOff } from 'lucide-react';

export default function Auth() {
    const router = useRouter();
    const { redirect, tab } = router.query;

    const [activeTab, setActiveTab] = useState('login');
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    // Password visibility states
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
                // User is signed in, redirect if needed
                if (redirect) {
                    router.push(redirect);
                } else {
                    router.push('/');
                }
            }
        });

        return () => unsubscribe();
    }, [redirect, router]);

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

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await signInWithEmailAndPassword(
                auth,
                loginForm.email,
                loginForm.password
            );

            // Show success notification
            toast.success('Logged in successfully!', {
                position: 'top-center',
                duration: 3000,
            });

            // Auth state listener will handle redirect
        } catch (error) {
            // Handle specific Firebase error codes
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                toast.error('Invalid email or password. Please try again.', {
                    position: 'top-center',
                    duration: 4000,
                });
            } else {
                toast.error('Login failed. Please try again.', {
                    position: 'top-center',
                    duration: 4000,
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();

        // Enhanced validation
        if (!registerForm.name.trim()) {
            toast.error('Please enter your name', {
                position: 'top-center',
                duration: 3000,
            });
            return;
        }

        if (registerForm.password !== registerForm.confirmPassword) {
            toast.error('Passwords do not match', {
                position: 'top-center',
                duration: 3000,
            });
            return;
        }

        if (registerForm.password.length < 6) {
            toast.error('Password must be at least 6 characters long', {
                position: 'top-center',
                duration: 3000,
            });
            return;
        }

        setIsLoading(true);

        try {
            // Create user with email and password
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                registerForm.email,
                registerForm.password
            );

            // Update the display name in Firebase Auth
            await updateProfile(userCredential.user, {
                displayName: registerForm.name
            });

            // Create user document in Firestore
            const nameParts = registerForm.name.trim().split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            await createUserDocument(userCredential.user, {
                firstName,
                lastName
            });

            // Show success notification
            toast.success('Account created successfully!', {
                position: 'top-center',
                duration: 3000,
            });

            // Auth state listener will handle redirect
        } catch (error) {
            // Handle specific Firebase error codes
            if (error.code === 'auth/email-already-in-use') {
                toast.error('Email already in use. Please use a different email or login.', {
                    position: 'top-center',
                    duration: 4000,
                });
            } else if (error.code === 'auth/weak-password') {
                toast.error('Password is too weak. Please use a stronger password.', {
                    position: 'top-center',
                    duration: 4000,
                });
            } else {
                toast.error('Registration failed. Please try again.', {
                    position: 'top-center',
                    duration: 4000,
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true);

        try {
            const result = await signInWithPopup(auth, googleProvider);

            // Create user document if it doesn't exist
            await createUserDocument(result.user);

            // Show success notification
            toast.success('Signed in with Google successfully!', {
                position: 'top-center',
                duration: 3000,
            });

            // Auth state listener will handle redirect
        } catch (error) {
            toast.error('Google sign-in failed. Please try again.', {
                position: 'top-center',
                duration: 4000,
            });
        } finally {
            setIsGoogleLoading(false);
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

    // Toggle password visibility
    const toggleLoginPasswordVisibility = () => {
        setShowLoginPassword(!showLoginPassword);
    };

    const toggleRegisterPasswordVisibility = () => {
        setShowRegisterPassword(!showRegisterPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

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

                        {/* Social Login Button */}
                        <div className="px-6 pt-8">
                            <button
                                type="button"
                                onClick={handleGoogleSignIn}
                                disabled={isGoogleLoading}
                                className="flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white py-3 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all"
                            >
                                {isGoogleLoading ? (
                                    <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <>
                                        <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                                            <path
                                                fill="#4285F4"
                                                d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
                                            />
                                            <path
                                                fill="#34A853"
                                                d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09c1.97 3.92 6.02 6.62 10.71 6.62z"
                                            />
                                            <path
                                                fill="#FBBC05"
                                                d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29v-3.09h-3.98c-.8 1.61-1.26 3.43-1.26 5.38s.46 3.77 1.26 5.38l3.98-3.09z"
                                            />
                                            <path
                                                fill="#EA4335"
                                                d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42c-2.08-1.94-4.78-3.13-8.02-3.13-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
                                            />
                                        </svg>
                                        Continue with Google
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="relative mt-6 mb-4">
                            <div className="absolute inset-0 flex items-center px-6">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white px-4 text-gray-500 font-medium">Or continue with email</span>
                            </div>
                        </div>

                        {/* Login form */}
                        {activeTab === 'login' && (
                            <form onSubmit={handleLoginSubmit} className="p-6 pt-4">
                                <div className="mb-5">
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={loginForm.email}
                                        onChange={handleLoginInputChange}
                                        required
                                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50 transition-all"
                                        placeholder="your@email.com"
                                    />
                                </div>

                                <div className="mb-6">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showLoginPassword ? "text" : "password"}
                                            id="password"
                                            name="password"
                                            value={loginForm.password}
                                            onChange={handleLoginInputChange}
                                            required
                                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50 pr-10 transition-all"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={toggleLoginPasswordVisibility}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 focus:outline-none"
                                        >
                                            {showLoginPassword ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center">
                                        <input
                                            id="remember_me"
                                            name="remember_me"
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                                        />
                                        <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-700">
                                            Remember me
                                        </label>
                                    </div>

                                    <div className="text-sm">
                                        <a href="#" className="font-medium text-primary-600 hover:text-primary-700 hover:underline">
                                            Forgot password?
                                        </a>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full rounded-lg bg-primary-600 py-3 px-4 text-white font-medium shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary-700'
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
                            <form onSubmit={handleRegisterSubmit} className="p-6 pt-4">
                                <div className="mb-5">
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={registerForm.name}
                                        onChange={handleRegisterInputChange}
                                        required
                                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50 transition-all"
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div className="mb-5">
                                    <label htmlFor="register_email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="register_email"
                                        name="email"
                                        value={registerForm.email}
                                        onChange={handleRegisterInputChange}
                                        required
                                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50 transition-all"
                                        placeholder="your@email.com"
                                    />
                                </div>

                                <div className="mb-5">
                                    <label htmlFor="register_password" className="block text-sm font-medium text-gray-700 mb-1">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showRegisterPassword ? "text" : "password"}
                                            id="register_password"
                                            name="password"
                                            value={registerForm.password}
                                            onChange={handleRegisterInputChange}
                                            required
                                            minLength="6"
                                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50 pr-10 transition-all"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={toggleRegisterPasswordVisibility}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 focus:outline-none"
                                        >
                                            {showRegisterPassword ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">Password must be at least 6 characters</p>
                                </div>

                                <div className="mb-6">
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={registerForm.confirmPassword}
                                            onChange={handleRegisterInputChange}
                                            required
                                            minLength="6"
                                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50 pr-10 transition-all"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={toggleConfirmPasswordVisibility}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 focus:outline-none"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full rounded-lg bg-primary-600 py-3 px-4 text-white font-medium shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary-700'
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