import { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { createUserDocument } from '../../lib/firestore';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginForm({ isLoading, setIsLoading }) {
    const [showPassword, setShowPassword] = useState(false);
    const [loginForm, setLoginForm] = useState({
        email: '',
        password: ''
    });
    const [resetEmailSent, setResetEmailSent] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLoginForm({
            ...loginForm,
            [name]: value
        });
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const [isResettingPassword, setIsResettingPassword] = useState(false);
    
    const handleForgotPassword = async (e) => {
        e.preventDefault();
        
        if (!loginForm.email) {
            toast.error('Please enter your email address first', {
                position: 'top-right',
                duration: 3000,
            });
            return;
        }
        
        setIsResettingPassword(true);
        
        try {
            // Check if user exists before sending reset email
            const methods = await import('firebase/auth').then(module => 
                module.fetchSignInMethodsForEmail(auth, loginForm.email)
            );
            
            // If methods array is empty, the user doesn't exist
            if (methods.length === 0) {
                toast.error('No account found with this email address.', {
                    position: 'top-right',
                    duration: 4000,
                });
                setIsResettingPassword(false);
                return;
            }
            
            // User exists, send the reset email
            await sendPasswordResetEmail(auth, loginForm.email);
            setResetEmailSent(true);
            toast.success('Password reset email sent! Check your inbox.', {
                position: 'top-right',
                duration: 5000,
            });
        } catch (error) {
            console.error('Password reset error:', error);
            toast.error('Failed to send reset email. Please try again.', {
                position: 'top-right',
                duration: 4000,
            });
        } finally {
            setIsResettingPassword(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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
                    className="block w-full rounded p-1 border-gray-300 shadow-sm focus:border-accent-500 focus:ring focus:ring-accent-500 focus:ring-opacity-50 transition-all"
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
                        className="block w-full rounded p-1 border-gray-300 shadow-sm focus:border-accent-500 focus:ring focus:ring-accent-500 focus:ring-opacity-50 pr-10 transition-all"
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

            <div className="flex justify-end mb-6">
                <button 
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={isResettingPassword || resetEmailSent}
                    className="text-sm font-medium text-primary-500 hover:text-primary-700 hover:underline focus:outline-none flex items-center"
                >
                    {isResettingPassword ? (
                        <>
                            <span className="mr-2">
                                <svg className="animate-spin h-4 w-4 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </span>
                            Sending...
                        </>
                    ) : resetEmailSent ? (
                        'Reset email sent'
                    ) : (
                        'Forgot password?'
                    )}
                </button>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className={`w-full rounded py-2 px-4 text-white font-medium shadow-md hover:shadow-lg active:shadow-inner bg-primary-700 transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary-500'}`}
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