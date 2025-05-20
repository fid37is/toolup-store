import { useState } from 'react';
import { User, Mail, Lock, Bell, Globe, ChevronLeft, Shield } from 'lucide-react';

const AccountSettingsPage = () => {
    const [activeTab, setActiveTab] = useState('profile');

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => window.history.back()}
                    className="inline-flex items-center text-primary-500 hover:text-primary-700 font-medium"
                >
                    <ChevronLeft className="h-5 w-5 mr-1" />
                    Back
                </button>

                <h1 className="text-3xl font-bold text-gray-800 text-right ml-auto">
                    Settings
                </h1>
            </div>


            <div className="flex flex-col md:flex-row gap-6">
                {/* Settings Sidebar */}
                <div className="w-full md:w-64 bg-white rounded-lg shadow">
                    <nav className="p-4">
                        <ul className="space-y-1">
                            <li>
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`w-full flex items-center px-4 py-3 rounded text-left ${activeTab === 'profile'
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <User className={`w-5 h-5 mr-3 ${activeTab === 'profile' ? 'text-blue-600' : 'text-gray-500'}`} />
                                    Profile Information
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setActiveTab('email')}
                                    className={`w-full flex items-center px-4 py-3 rounded text-left ${activeTab === 'email'
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <Mail className={`w-5 h-5 mr-3 ${activeTab === 'email' ? 'text-blue-600' : 'text-gray-500'}`} />
                                    Email Settings
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setActiveTab('password')}
                                    className={`w-full flex items-center px-4 py-3 rounded text-left ${activeTab === 'password'
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <Lock className={`w-5 h-5 mr-3 ${activeTab === 'password' ? 'text-blue-600' : 'text-gray-500'}`} />
                                    Password
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setActiveTab('notifications')}
                                    className={`w-full flex items-center px-4 py-3 rounded text-left ${activeTab === 'notifications'
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <Bell className={`w-5 h-5 mr-3 ${activeTab === 'notifications' ? 'text-blue-600' : 'text-gray-500'}`} />
                                    Notifications
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setActiveTab('preferences')}
                                    className={`w-full flex items-center px-4 py-3 rounded text-left ${activeTab === 'preferences'
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <Globe className={`w-5 h-5 mr-3 ${activeTab === 'preferences' ? 'text-blue-600' : 'text-gray-500'}`} />
                                    Preferences
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setActiveTab('security')}
                                    className={`w-full flex items-center px-4 py-3 rounded text-left ${activeTab === 'security'
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <Shield className={`w-5 h-5 mr-3 ${activeTab === 'security' ? 'text-blue-600' : 'text-gray-500'}`} />
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        defaultValue="(555) 123-4567"
                                    />
                                </div>

                                <div className="pt-4">
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'email' && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Email Settings</h2>
                            <p className="text-gray-500 mb-6">Manage your email addresses and communication preferences</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="primaryEmail">
                                        Primary Email
                                    </label>
                                    <input
                                        type="email"
                                        id="primaryEmail"
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        defaultValue="john.doe@example.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="backupEmail">
                                        Backup Email (optional)
                                    </label>
                                    <input
                                        type="email"
                                        id="backupEmail"
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter a backup email address"
                                    />
                                </div>

                                <div className="pt-2">
                                    <h3 className="text-md font-medium text-gray-800 mb-3">Email Preferences</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-start">
                                            <div className="flex items-center h-5">
                                                <input
                                                    id="marketing"
                                                    type="checkbox"
                                                    defaultChecked
                                                    className="w-4 h-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div className="ml-3 text-sm">
                                                <label htmlFor="marketing" className="font-medium text-gray-700">Marketing emails</label>
                                                <p className="text-gray-500">Receive emails about new features, promotions, and news</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="flex items-center h-5">
                                                <input
                                                    id="updates"
                                                    type="checkbox"
                                                    defaultChecked
                                                    className="w-4 h-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div className="ml-3 text-sm">
                                                <label htmlFor="updates" className="font-medium text-gray-700">Product updates</label>
                                                <p className="text-gray-500">Receive emails about product updates and changes</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="flex items-center h-5">
                                                <input
                                                    id="newsletter"
                                                    type="checkbox"
                                                    defaultChecked
                                                    className="w-4 h-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div className="ml-3 text-sm">
                                                <label htmlFor="newsletter" className="font-medium text-gray-700">Newsletter</label>
                                                <p className="text-gray-500">Receive our weekly newsletter with industry insights</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'password' && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Password Settings</h2>
                            <p className="text-gray-500 mb-6">Update your password to maintain account security</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="currentPassword">
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        id="currentPassword"
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter your current password"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="newPassword">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        id="newPassword"
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter your new password"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Password must be at least 8 characters and include a number and special character
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="confirmPassword">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Confirm your new password"
                                    />
                                </div>

                                <div className="pt-4">
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                        Update Password
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
                            <p className="text-gray-500 mb-6">Control how and when you receive notifications</p>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-md font-medium text-gray-800 mb-3">Push Notifications</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-gray-700">New messages</p>
                                                <p className="text-sm text-gray-500">Get notified when you receive new messages</p>
                                            </div>
                                            <div className="flex items-center">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" defaultChecked className="sr-only peer" />
                                                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                                                        <div className="flex items-center">
                                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                                                <Bell className="w-5 h-5" />
                                                            </div>
                                                            <div className="ml-3">
                                                                <p className="font-medium text-gray-800">SMS Authentication</p>
                                                                <p className="text-sm text-gray-500">Receive codes via text message (+1 (555) ***-**67)</p>
                                                            </div>
                                                        </div>
                                                        <button className="text-blue-600 hover:text-blue-800 text-sm">
                                                            Change
                                                        </button>
                                                    </div>
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-gray-700">Account activity</p>
                                                <p className="text-sm text-gray-500">Get notified about account login activity</p>
                                            </div>
                                            <div className="flex items-center">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" defaultChecked className="sr-only peer" />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-gray-700">Updates and announcements</p>
                                                <p className="text-sm text-gray-500">Receive notifications about product updates</p>
                                            </div>
                                            <div className="flex items-center">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" className="sr-only peer" />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-md font-medium text-gray-800 mb-3">SMS Notifications</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-gray-700">Security alerts</p>
                                                <p className="text-sm text-gray-500">Receive SMS for important security alerts</p>
                                            </div>
                                            <div className="flex items-center">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" defaultChecked className="sr-only peer" />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-gray-700">Two-factor authentication</p>
                                                <p className="text-sm text-gray-500">Receive SMS codes for two-factor authentication</p>
                                            </div>
                                            <div className="flex items-center">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" defaultChecked className="sr-only peer" />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                        Save Preferences
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'preferences' && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Account Preferences</h2>
                            <p className="text-gray-500 mb-6">Customize your account experience</p>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-md font-medium text-gray-800 mb-3">Display Settings</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="language">
                                                Language
                                            </label>
                                            <select
                                                id="language"
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="en">English</option>
                                                <option value="es">Español</option>
                                                <option value="fr">Français</option>
                                                <option value="de">Deutsch</option>
                                                <option value="pt">Português</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="timezone">
                                                Time Zone
                                            </label>
                                            <select
                                                id="timezone"
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="utc">UTC (Coordinated Universal Time)</option>
                                                <option value="est">Eastern Standard Time (UTC-5)</option>
                                                <option value="cst">Central Standard Time (UTC-6)</option>
                                                <option value="mst">Mountain Standard Time (UTC-7)</option>
                                                <option value="pst">Pacific Standard Time (UTC-8)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="theme">
                                                Theme
                                            </label>
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="flex flex-col items-center">
                                                    <button className="w-full h-20 border-2 border-gray-300 rounded-md p-1 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                        <div className="h-full w-full bg-white rounded"></div>
                                                    </button>
                                                    <span className="mt-1 text-sm text-gray-700">Light</span>
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <button className="w-full h-20 border-2 border-gray-300 rounded-md p-1 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                        <div className="h-full w-full bg-gray-800 rounded"></div>
                                                    </button>
                                                    <span className="mt-1 text-sm text-gray-700">Dark</span>
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <button className="w-full h-20 border-2 border-blue-500 rounded-md p-1 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                        <div className="h-full w-full bg-gray-200 rounded">
                                                            <div className="h-full w-1/2 bg-gray-800 rounded-l"></div>
                                                        </div>
                                                    </button>
                                                    <span className="mt-1 text-sm text-gray-700">System</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-md font-medium text-gray-800 mb-3">Content Preferences</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-start">
                                            <div className="flex items-center h-5">
                                                <input
                                                    id="contentFilter"
                                                    type="checkbox"
                                                    defaultChecked
                                                    className="w-4 h-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div className="ml-3 text-sm">
                                                <label htmlFor="contentFilter" className="font-medium text-gray-700">Enable content filtering</label>
                                                <p className="text-gray-500">Filter potentially sensitive content</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="flex items-center h-5">
                                                <input
                                                    id="activityHistory"
                                                    type="checkbox"
                                                    defaultChecked
                                                    className="w-4 h-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div className="ml-3 text-sm">
                                                <label htmlFor="activityHistory" className="font-medium text-gray-700">Save activity history</label>
                                                <p className="text-gray-500">Track your recent activities for better recommendations</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                        Save Preferences
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Security Settings</h2>
                            <p className="text-gray-500 mb-6">Manage your account security and authentication methods</p>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-md font-medium text-gray-800 mb-3">Two-Factor Authentication (2FA)</h3>
                                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-md">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-blue-800 font-medium">Two-factor authentication is enabled</p>
                                                <p className="text-sm text-blue-600">Your account is protected with an additional layer of security</p>
                                            </div>
                                            <button className="px-3 py-1 bg-white border border-blue-600 text-blue-600 rounded hover:bg-blue-50">
                                                Disable
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-4 space-y-4">
                                        <div>
                                            <h4 className="font-medium text-gray-700 mb-2">2FA Methods</h4>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between p-3 border border-gray-200 border-dashed rounded-md bg-gray-50">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                                                            <Shield className="w-5 h-5" />
                                                        </div>
                                                        <div className="ml-3">
                                                            <p className="font-medium text-gray-800">Authenticator App</p>
                                                            <p className="text-sm text-gray-500">Set up an authenticator app</p>
                                                        </div>
                                                    </div>
                                                    <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                                                        Set up
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-md font-medium text-gray-800 mb-3">Login Sessions</h3>
                                    <p className="text-sm text-gray-500 mb-3">These are the devices that are currently logged into your account</p>
                                    <div className="space-y-3">
                                        <div className="p-3 border border-green-200 bg-green-50 rounded-md">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="flex items-center">
                                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                                            <Globe className="w-4 h-4" />
                                                        </div>
                                                        <div className="ml-3">
                                                            <p className="font-medium text-gray-800">Chrome on Windows</p>
                                                            <p className="text-xs text-gray-500">Current session • New York, USA</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Active now</span>
                                            </div>
                                        </div>
                                        <div className="p-3 border border-gray-200 rounded-md">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="flex items-center">
                                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                                                            <Globe className="w-4 h-4" />
                                                        </div>
                                                        <div className="ml-3">
                                                            <p className="font-medium text-gray-800">Safari on macOS</p>
                                                            <p className="text-xs text-gray-500">Last active 2 days ago • Los Angeles, USA</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button className="text-red-600 hover:text-red-800 text-sm">
                                                    Logout
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-3 border border-gray-200 rounded-md">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="flex items-center">
                                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                                                            <Globe className="w-4 h-4" />
                                                        </div>
                                                        <div className="ml-3">
                                                            <p className="font-medium text-gray-800">Mobile App on iPhone</p>
                                                            <p className="text-xs text-gray-500">Last active 5 days ago • San Francisco, USA</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button className="text-red-600 hover:text-red-800 text-sm">
                                                    Logout
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                                            Logout of all other sessions
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-md font-medium text-gray-800 mb-3">Account Activity</h3>
                                    <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Activity
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Location
                                                    </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Date & Time
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                <tr>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        Login successful
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        New York, USA
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        Today, 9:41 AM
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        Password changed
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        New York, USA
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        Yesterday, 3:22 PM
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        Login successful
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        Los Angeles, USA
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        May 18, 2025, 11:30 AM
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="mt-3 text-right">
                                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                            View full activity log
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                        Save Security Settings
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AccountSettingsPage;