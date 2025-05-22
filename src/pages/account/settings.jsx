import { useState } from 'react';
import { Mail, Lock, Bell, Globe, ChevronLeft, Shield } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import EmailSettings from './settingsPage/EmailSettings';
import PasswordSettings from './settingsPage/PasswordSettings';
import NotificationSettings from './settingsPage/NotificationSettings';
import PreferenceSettings from './settingsPage/PreferenceSettings';
import SecuritySettings from './settingsPage/SecuritySettings';
import { useRouter } from 'next/router';

const AccountSettingsPage = () => {
    const [activeTab, setActiveTab] = useState('email');
    const router = useRouter();

    return (
        <>
            <Header />
            <main className="container max-w-6xl mx-auto px-4 py-8 bg-gray-50 min-h-screen">
                <div className="flex items-center justify-between mb-6">
                            <button
                                onClick={() => router.back()}
                                className="flex items-center text-primary-700 hover:text-primary-500 transition-all duration-200 font-medium bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md border border-gray-200"
                            >
                                <span className="mr-2 text-lg">←</span> Back
                            </button>
                            
                            <div className="text-center">
                                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                                    Settings
                                </h1>
                                <div className="flex items-center justify-center">
                                    <div className="h-1 w-16 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"></div>
                                </div>
                            </div>
                            
                            <div className="w-20"></div> {/* Spacer for centering */}
                        </div>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Settings Sidebar */}
                    <div className="w-full md:w-64 bg-white rounded-lg shadow">
                        <nav className="p-4">
                            <ul className="space-y-1">
                                <li>
                                    <button
                                        onClick={() => setActiveTab('email')}
                                        className={`w-full flex items-center px-4 py-3 rounded text-left ${activeTab === 'email'
                                            ? 'bg-blue-50 text-primary-600'
                                            : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <Mail className={`w-5 h-5 mr-3 ${activeTab === 'email' ? 'text-primary-600' : 'text-gray-500'}`} />
                                        Email Settings
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => setActiveTab('password')}
                                        className={`w-full flex items-center px-4 py-3 rounded text-left ${activeTab === 'password'
                                            ? 'bg-blue-50 text-primary-600'
                                            : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <Lock className={`w-5 h-5 mr-3 ${activeTab === 'password' ? 'text-primary-600' : 'text-gray-500'}`} />
                                        Password
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => setActiveTab('notifications')}
                                        className={`w-full flex items-center px-4 py-3 rounded text-left ${activeTab === 'notifications'
                                            ? 'bg-blue-50 text-primary-600'
                                            : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <Bell className={`w-5 h-5 mr-3 ${activeTab === 'notifications' ? 'text-primary-600' : 'text-gray-500'}`} />
                                        Notifications
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => setActiveTab('preferences')}
                                        className={`w-full flex items-center px-4 py-3 rounded text-left ${activeTab === 'preferences'
                                            ? 'bg-blue-50 text-primary-600'
                                            : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <Globe className={`w-5 h-5 mr-3 ${activeTab === 'preferences' ? 'text-primary-600' : 'text-gray-500'}`} />
                                        Preferences
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => setActiveTab('security')}
                                        className={`w-full flex items-center px-4 py-3 rounded text-left ${activeTab === 'security'
                                            ? 'bg-blue-50 text-primary-600'
                                            : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <Shield className={`w-5 h-5 mr-3 ${activeTab === 'security' ? 'text-primary-600' : 'text-gray-500'}`} />
                                        Security
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>

                    {/* Settings Content */}
                    <div className="flex-1 bg-white rounded-lg shadow p-6">
                        {activeTab === 'email' && <EmailSettings />}
                        {activeTab === 'password' && <PasswordSettings />}
                        {activeTab === 'notifications' && <NotificationSettings />}
                        {activeTab === 'preferences' && <PreferenceSettings />}
                        {activeTab === 'security' && <SecuritySettings />}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default AccountSettingsPage;