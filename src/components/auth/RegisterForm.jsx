// 2. src/components/auth/RegisterForm.jsx
import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { createUserDocument } from '../../lib/firestore';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

export default function RegisterForm({ isLoading, setIsLoading }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [registerForm, setRegisterForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setRegisterForm({
            ...registerForm,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Enhanced validation
        if (!registerForm.name.trim()) {
            toast.error('Please enter your name', {
                position: 'top-right',
                duration: 3000,
            });
            return;
        }

        // Check terms acceptance
        if (!registerForm.acceptTerms) {
            toast.error('You must accept the terms and conditions to continue', {
                position: 'top-right',
                duration: 3000,
            });
            return;
        }

        if (registerForm.password !== registerForm.confirmPassword) {
            toast.error('Passwords do not match', {
                position: 'top-right',
                duration: 3000,
            });
            return;
        }

        if (registerForm.password.length < 6) {
            toast.error('Password must be at least 6 characters long', {
                position: 'top-right',
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

            // Create user document in Firestore with complete data
            const nameParts = registerForm.name.trim().split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            // Ensure data is properly written to Firestore before continuing
            await createUserDocument(userCredential.user, {
                firstName,
                lastName,
                email: registerForm.email,
                phone: '',
                dob: '',
                joinDate: new Date().toISOString(),
                acceptedTerms: true,
                acceptedTermsDate: new Date().toISOString(),
                authProvider: 'email'
            });

            // Show success notification
            toast.success('Account created successfully!', {
                position: 'top-right',
                duration: 3000,
            });

            // Auth state listener will handle redirect
        } catch (error) {
            // Handle specific Firebase error codes
            if (error.code === 'auth/email-already-in-use') {
                toast.error('Email already in use. Please use a different email or login.', {
                    position: 'top-right',
                    duration: 4000,
                });
            } else if (error.code === 'auth/weak-password') {
                toast.error('Password is too weak. Please use a stronger password.', {
                    position: 'top-right',
                    duration: 4000,
                });
            } else {
                toast.error('Registration failed. Please try again.', {
                    position: 'top-right',
                    duration: 4000,
                });
                console.error('Registration error:', error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 pt-4">
            <div className="mb-5">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={registerForm.name}
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                        type={showPassword ? "text" : "password"}
                        id="register_password"
                        name="password"
                        value={registerForm.password}
                        onChange={handleInputChange}
                        required
                        minLength="6"
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
                        onChange={handleInputChange}
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

            <div className="mb-6">
                <div className="flex items-center">
                    <input
                        id="register_terms"
                        name="acceptTerms"
                        type="checkbox"
                        checked={registerForm.acceptTerms}
                        onChange={handleInputChange}
                        className="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                    />
                    <label htmlFor="register_terms" className="ml-2 block text-sm text-gray-700">
                        I accept the <a href="/terms" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">Terms and Conditions</a> and <a href="/privacy" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                    </label>
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
                        Creating Account...
                    </span>
                ) : (
                    'Create Account'
                )}
            </button>
        </form>
    );
}