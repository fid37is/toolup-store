// 1. src/components/auth/LoginForm.jsx
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { createUserDocument } from '../../lib/firestore';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginForm({ isLoading, setIsLoading }) {
    const [showPassword, setShowPassword] = useState(false);
    const [loginForm, setLoginForm] = useState({
        email: '',
        password: '',
        acceptTerms: false
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setLoginForm({
            ...loginForm,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check terms acceptance
        if (!loginForm.acceptTerms) {
            toast.error('You must accept the terms and conditions to continue', {
                position: 'top-right',
                duration: 3000,
            });
            return;
        }

        setIsLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                loginForm.email,
                loginForm.password
            );

            // Update the user document with last login
            try {
                await createUserDocument(userCredential.user, {
                    lastLogin: new Date().toISOString()
                });
            } catch (docError) {
                console.error('Failed to update user document on login:', docError);
                // We don't want to block login if this fails
            }

            // Show success notification
            toast.success('Logged in successfully!', {
                position: 'top-right',
                duration: 3000,
            });

            // Auth state listener will handle redirect
        } catch (error) {
            // Handle specific Firebase error codes
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                toast.error('Invalid email or password. Please try again.', {
                    position: 'top-right',
                    duration: 4000,
                });
            } else {
                toast.error('Login failed. Please try again.', {
                    position: 'top-right',
                    duration: 4000,
                });
                console.error('Login error:', error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 pt-4">
            <div className="mb-5">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={loginForm.email}
                    onChange={handleInputChange}
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
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={loginForm.password}
                        onChange={handleInputChange}
                        required
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50 pr-10 transition-all"
                        placeholder="••••••••"
                    />
                    <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 focus:outline-none"
                    >
                        {showPassword ? (
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
                        id="acceptTerms"
                        name="acceptTerms"
                        type="checkbox"
                        checked={loginForm.acceptTerms}
                        onChange={handleInputChange}
                        className="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                    />
                    <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-700">
                        I accept the <a href="/terms" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">Terms</a>
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
                className={`w-full rounded-lg bg-primary-600 py-3 px-4 text-white font-medium shadow-md hover:shadow-lg active:shadow-inner active:bg-primary-800 transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary-700'}`}
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
    );
}