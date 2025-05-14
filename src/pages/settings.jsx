// src/pages/settings.jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { User, Mail, Lock, MapPin, Bell, Shield } from 'lucide-react';

export default function Settings() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        phone: '',
        address: {
            street: '',
            city: '',
            state: '',
            country: '',
            zipCode: ''
        }
    });
    const [activeTab, setActiveTab] = useState('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        // Check if user is authenticated
        const checkAuth = () => {
            if (typeof window === 'undefined') return;

            const authStatus = localStorage.getItem('isAuthenticated') === 'true';
            setIsAuthenticated(authStatus);

            if (!authStatus) {
                // Redirect to login page if not authenticated
                router.push('/auth?redirect=/settings');
                return;
            }

            // Load user data
            try {
                const storedUser = JSON.parse(localStorage.getItem('user'));
                if (storedUser) {
                    setUserData({
                        ...userData,
                        name: storedUser.name || '',
                        email: storedUser.email || '',
                        phone: storedUser.phone || '',
                        address: storedUser.address || {
                            street: '',
                            city: '',
                            state: '',
                            country: '',
                            zipCode: ''
                        }
                    });
                }
            } catch (err) {
                console.error('Error loading user data:', err);
            }
        };

        checkAuth();
    }, [router]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setUserData({
                ...userData,
                [parent]: {
                    ...userData[parent],
                    [child]: value
                }
            });
        } else {
            setUserData({
                ...userData,
                [name]: value
            });
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setSuccessMessage('');
        setErrorMessage('');

        try {
            // In a real app, this would be an API call
            console.log('Updating profile with:', userData);

            // Simulate API call
            setTimeout(() => {
                // Update the stored user data
                localStorage.setItem('user', JSON.stringify(userData));
                setSuccessMessage('Profile updated successfully!');
                setIsLoading(false);
            }, 1000);
        } catch (error) {
            console.error('Profile update error:', error);
            setErrorMessage('Failed to update profile. Please try again.');
            setIsLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setSuccessMessage('');
        setErrorMessage('');

        const currentPassword = e.target.currentPassword.value;
        const newPassword = e.target.newPassword.value;
        const confirmPassword = e.target.confirmPassword.value;

        // Basic validation
        if (newPassword !== confirmPassword) {
            setErrorMessage('New passwords do not match');
            setIsLoading(false);
            return;
        }

        try {
            // In a real app, this would be an API call
            console.log('Updating password:', { currentPassword, newPassword });

            // Simulate API call
            setTimeout(() => {
                setSuccessMessage('Password updated successfully!');
                e.target.reset();
                setIsLoading(false);
            }, 1000);
        } catch (error) {
            console.error('Password update error:', error);
            setErrorMessage('Failed to update password. Please try again.');
            setIsLoading(false);
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={userData.name}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded border-gray-300 shadow-sm  focus:border-accent-600 focus:ring-accent-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={userData.email}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-accent-600 focus:ring-accent-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={userData.phone}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-accent-600 focus:ring-accent-500"
                            />
                        </div>

                        <div className="pt-3 border-t border-gray-200">
                            <h3 className="text-lg font-medium text-gray-800">Address Information</h3>

                            <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                                <div className="sm:col-span-2">
                                    <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                                        Street Address
                                    </label>
                                    <input
                                        type="text"
                                        id="street"
                                        name="address.street"
                                        value={userData.address.street}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded border-gray-300 shadow-sm  focus:border-accent-600 focus:ring-accent-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        id="city"
                                        name="address.city"
                                        value={userData.address.city}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded border-gray-300 shadow-sm  focus:border-accent-600 focus:ring-accent-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                                        State / Province
                                    </label>
                                    <input
                                        type="text"
                                        id="state"
                                        name="address.state"
                                        value={userData.address.state}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded border-gray-300 shadow-sm  focus:border-accent-600 focus:ring-accent-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                                        Country
                                    </label>
                                    <input
                                        type="text"
                                        id="country"
                                        name="address.country"
                                        value={userData.address.country}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded border-gray-300 shadow-sm  focus:border-accent-600 focus:ring-accent-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                                        ZIP / Postal Code
                                    </label>
                                    <input
                                        type="text"
                                        id="zipCode"
                                        name="address.zipCode"
                                        value={userData.address.zipCode}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded border-gray-300 shadow-sm  focus:border-accent-600 focus:ring-accent-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-5">
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`inline-flex justify-center rounded-md border border-transparent bg-primary-700 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-500 focus:outline-none focus:ring-1
                                        focus:ring-primary-700" focus:ring-offset-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
                                        }`}
                                >
                                    {isLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </form>
                );
            case 'security':
                return (
                    <form onSubmit={handlePasswordSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                                Current Password
                            </label>
                            <input
                                type="password"
                                id="currentPassword"
                                name="currentPassword"
                                required
                                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-accent-600 focus:ring-accent-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                                New Password
                            </label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                required
                                minLength="6"
                                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-accent-600 focus:ring-accent-500"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Password must be at least 6 characters long
                            </p>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                required
                                minLength="6"
                                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-accent-600 focus:ring-accent-500"
                            />
                        </div>

                        <div className="pt-5">
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`inline-flex justify-center rounded-md border border-transparent bg-primary-700 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-500 focus:outline-none focus:ring-1 focus:ring-accent-500 focus:ring-offset-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
                                        }`}
                                >
                                    {isLoading ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </div>
                    </form>
                );
            case 'notifications':
                return (
                    <div className="space-y-6">
                        <div className="border-b border-gray-200 pb-4">
                            <h3 className="text-lg font-medium text-gray-800">Email Notifications</h3>

                            <div className="mt-4 space-y-4">
                                <div className="flex items-start">
                                    <div className="flex h-5 items-center">
                                        <input
                                            id="order_updates"
                                            name="order_updates"
                                            type="checkbox"
                                            defaultChecked
                                            className="h-4 w-4 rounded border-gray-300  focus:border-accent-600 focus:ring-accent-500"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="order_updates" className="font-medium text-gray-700">
                                            Order updates
                                        </label>
                                        <p className="text-gray-500">Get notified about your order status and shipping updates</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="flex h-5 items-center">
                                        <input
                                            id="promotions"
                                            name="promotions"
                                            type="checkbox"
                                            defaultChecked
                                            className="h-4 w-4 rounded border-gray-300  focus:border-accent-600 focus:ring-accent-500"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="promotions" className="font-medium text-gray-700">
                                            Promotions and deals
                                        </label>
                                        <p className="text-gray-500">Receive exclusive offers and promotions</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="flex h-5 items-center">
                                        <input
                                            id="product_updates"
                                            name="product_updates"
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300  focus:border-accent-600 focus:ring-accent-500"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="product_updates" className="font-medium text-gray-700">
                                            Product updates
                                        </label>
                                        <p className="text-gray-500">Learn about new products and features</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-3">
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    className="inline-flex justify-center rounded-md border border-transparent bg-primary-700 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-500 focus:outline-none focus:ring-1 focus:ring-accent-500 focus:ring-offset-2"
                                >
                                    Save Preferences
                                </button>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    if (!isAuthenticated) {
        return null; // Will redirect to auth page
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Head>
                <title>Account Settings | ToolUp Store</title>
                <meta name="description" content="Manage your account settings and preferences" />
            </Head>

            <Header />

            <main className="container mx-auto flex-grow px-4 py-8">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <button
                        onClick={() => window.history.back()}
                        className="sticky top-4 z-10 mb-4 inline-flex items-center text-primary-500 hover:text-primary-700 font-medium"
                    >
                        <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>
                    <h1 className="text-3xl font-bold mb-8 text-gray-800">Account Settings</h1>

                    {successMessage && (
                        <div className="mb-6 rounded-md bg-green-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-green-800">{successMessage}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {errorMessage && (
                        <div className="mb-6 rounded-md bg-red-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-red-800">{errorMessage}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-4">
                        <div className="md:col-span-1">
                            <nav className="space-y-1" aria-label="Settings">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`flex w-full items-center px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'profile' ? 'bg-blue-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <User className="mr-3 h-5 w-5" />
                                    <span>Profile Information</span>
                                </button>

                                <button
                                    onClick={() => setActiveTab('security')}
                                    className={`flex w-full items-center px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'security' ? 'bg-blue-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <Lock className="mr-3 h-5 w-5" />
                                    <span>Password & Security</span>
                                </button>

                                <button
                                    onClick={() => setActiveTab('notifications')}
                                    className={`flex w-full items-center px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'notifications' ? 'bg-blue-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <Bell className="mr-3 h-5 w-5" />
                                    <span>Notifications</span>
                                </button>
                            </nav>
                        </div>

                        <div className="md:col-span-3">
                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    {renderTabContent()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}