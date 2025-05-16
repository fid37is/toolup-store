import { useState } from 'react';
import { User, Mail, Lock, Bell, Globe, Shield } from 'lucide-react';

const AccountSettingsPage = () => {
    const [activeTab, setActiveTab] = useState('profile');

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <button
                onClick={() => window.history.back()}
                className="sticky top-4 z-10 mb-4 inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
            >
                <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back
            </button>
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Settings</h1>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Settings Sidebar */}
                <div className="w-full md:w-64 bg-white rounded-lg shadow">
                    <nav className="p-4">
                        <ul className="space-y-1">
                            <li>
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`w-full flex items-center px-4 py-3 rounded text-left ${activeTab === 'profile'
                                        ? 'bg-blue-50 text-primary-500'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <User className={`w-5 h-5 mr-3 ${activeTab === 'profile' ? 'text-primary-500' : 'text-gray-500'}`} />
                                    Profile Information
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setActiveTab('email')}
                                    className={`w-full flex items-center px-4 py-3 rounded text-left ${activeTab === 'email'
                                        ? 'bg-blue-50 text-primary-500'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <Mail className={`w-5 h-5 mr-3 ${activeTab === 'email' ? 'text-primary-500' : 'text-gray-500'}`} />
                                    Email Settings
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setActiveTab('password')}
                                    className={`w-full flex items-center px-4 py-3 rounded text-left ${activeTab === 'password'
                                        ? 'bg-blue-50 text-primary-500'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <Lock className={`w-5 h-5 mr-3 ${activeTab === 'password' ? 'text-primary-500' : 'text-gray-500'}`} />
                                    Password
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setActiveTab('notifications')}
                                    className={`w-full flex items-center px-4 py-3 rounded text-left ${activeTab === 'notifications'
                                        ? 'bg-blue-50 text-primary-500'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <Bell className={`w-5 h-5 mr-3 ${activeTab === 'notifications' ? 'text-primary-500' : 'text-gray-500'}`} />
                                    Notifications
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setActiveTab('preferences')}
                                    className={`w-full flex items-center px-4 py-3 rounded text-left ${activeTab === 'preferences'
                                        ? 'bg-blue-50 text-primary-500'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <Globe className={`w-5 h-5 mr-3 ${activeTab === 'preferences' ? 'text-primary-500' : 'text-gray-500'}`} />
                                    Preferences
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setActiveTab('security')}
                                    className={`w-full flex items-center px-4 py-3 rounded text-left ${activeTab === 'security'
                                        ? 'bg-blue-50 text-primary-500'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <Shield className={`w-5 h-5 mr-3 ${activeTab === 'security' ? 'text-primary-500' : 'text-gray-500'}`} />
                                    Security
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>

                {/* Settings Content */}
                <div className="flex-1 bg-white rounded-lg shadow p-6">
                    {activeTab === 'profile' && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
                            <p className="text-gray-500 mb-6">Update your account information and how we can reach you</p>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="firstName">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            id="firstName"
                                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            defaultValue="John"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="lastName">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            id="lastName"
                                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            defaultValue="Doe"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        defaultValue="john.doe@example.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        defaultValue="(555) 123-4567"
                                    />
                                </div>

                                <div className="pt-4">
                                    <button className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-blue-700">
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Placeholder content for other tabs */}
                    {activeTab !== 'profile' && (
                        <div className="text-center py-12">
                            <h2 className="text-xl font-semibold mb-2">
                                {activeTab === 'email' && 'Email Settings'}
                                {activeTab === 'password' && 'Password Settings'}
                                {activeTab === 'notifications' && 'Notification Preferences'}
                                {activeTab === 'preferences' && 'Account Preferences'}
                                {activeTab === 'security' && 'Security Settings'}
                            </h2>
                            <p className="text-gray-500">
                                This section is under construction. Please check back later.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AccountSettingsPage;