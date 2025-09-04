import { useState } from 'react';
import { Bell } from 'lucide-react';

const NotificationSettings = () => {
    const [notifications, setNotifications] = useState({
        // Push notifications
        newMessages: true,
        accountActivity: true,
        updates: false,
        // SMS notifications
        securityAlerts: true,
        twoFactor: true
    });

    const handleToggle = (setting) => {
        setNotifications({
            ...notifications,
            [setting]: !notifications[setting]
        });
    };

    const handleSavePreferences = () => {
        // Here you would typically send these changes to your API
        console.log('Saving notification preferences:', notifications);
        alert('Notification preferences saved successfully!');
    };

    return (
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
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={notifications.newMessages}
                                        onChange={() => handleToggle('newMessages')}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-700"></div>
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
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer"
                                        checked={notifications.accountActivity}
                                        onChange={() => handleToggle('accountActivity')}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-700"></div>
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
                                    <input 
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={notifications.updates}
                                        onChange={() => handleToggle('updates')}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-700"></div>
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
                                    <input 
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={notifications.securityAlerts}
                                        onChange={() => handleToggle('securityAlerts')}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-700"></div>
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
                                    <input 
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={notifications.twoFactor}
                                        onChange={() => handleToggle('twoFactor')}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-700"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <button 
                        className="px-4 py-2 bg-primary-700 text-white rounded hover:bg-primary-500"
                        onClick={handleSavePreferences}
                    >
                        Save Preferences
                    </button>
                </div>
            </div>
            
            {/* SMS Authentication Example */}
            <div className="mt-6 border-t pt-6">
                <h3 className="text-md font-medium text-gray-800 mb-3">Authentication Methods</h3>
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-primary-700">
                            <Bell className="w-5 h-5" />
                        </div>
                        <div className="ml-3">
                            <p className="font-medium text-gray-800">SMS Authentication</p>
                            <p className="text-sm text-gray-500">Receive codes via text message (+1 (555) ***-**67)</p>
                        </div>
                    </div>
                    <button className="text-primary-700 hover:text-primary-500 text-sm font-bold">
                        Change
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationSettings;