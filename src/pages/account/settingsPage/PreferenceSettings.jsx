import { useState } from 'react';

const PreferenceSettings = () => {
    const [language, setLanguage] = useState('en');
    const [timezone, setTimezone] = useState('utc');
    const [theme, setTheme] = useState('system');
    const [preferences, setPreferences] = useState({
        contentFilter: true,
        activityHistory: true,
    });

    const handlePreferenceChange = (preference) => {
        setPreferences({
            ...preferences,
            [preference]: !preferences[preference],
        });
    };

    const handleSavePreferences = () => {
        console.log('Saving preferences:', { language, timezone, theme, preferences });
        alert('Preferences saved successfully!');
    };

    return (
        <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Account Preferences</h2>
            <p className="text-gray-500 mb-6">Customize your account experience</p>

            <div className="space-y-6">
                {/* Display Settings */}
                <div>
                    <h3 className="text-md font-medium text-gray-800 mb-3">Display Settings</h3>
                    <div className="space-y-4">
                        {/* Language */}
                        <div>
                            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                                Language
                            </label>
                            <select
                                id="language"
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                            >
                                <option value="en">English</option>
                                <option value="es">Español</option>
                                <option value="fr">Français</option>
                                <option value="de">Deutsch</option>
                                <option value="pt">Português</option>
                            </select>
                        </div>

                        {/* Timezone */}
                        <div>
                            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
                                Time Zone
                            </label>
                            <select
                                id="timezone"
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                                value={timezone}
                                onChange={(e) => setTimezone(e.target.value)}
                            >
                                <option value="utc">UTC (Coordinated Universal Time)</option>
                                <option value="est">Eastern Standard Time (UTC-5)</option>
                                <option value="cst">Central Standard Time (UTC-6)</option>
                                <option value="mst">Mountain Standard Time (UTC-7)</option>
                                <option value="pst">Pacific Standard Time (UTC-8)</option>
                            </select>
                        </div>

                        {/* Theme */}
                        <div>
                            <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">
                                Theme
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {['light', 'dark', 'system'].map((mode) => (
                                    <div key={mode} className="flex flex-col items-center">
                                        <button
                                            className={`w-full h-20 border-2 ${theme === mode ? 'border-primary-500' : 'border-gray-300'
                                                } rounded-md p-1 hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500`}
                                            onClick={() => setTheme(mode)}
                                        >
                                            <div
                                                className={`h-full w-full rounded ${mode === 'light'
                                                        ? 'bg-white'
                                                        : mode === 'dark'
                                                            ? 'bg-gray-800'
                                                            : 'bg-gradient-to-br from-white to-gray-400'
                                                    }`}
                                            ></div>
                                        </button>
                                        <span className="mt-1 text-sm text-gray-700 capitalize">{mode}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Preferences */}
                <div>
                    <h3 className="text-md font-medium text-gray-800 mb-3">Privacy & Content</h3>
                    <div className="space-y-4">
                        <label className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                checked={preferences.contentFilter}
                                onChange={() => handlePreferenceChange('contentFilter')}
                                className="h-4 w-4 text-primary-700 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-700">Enable content filtering</span>
                        </label>
                        <label className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                checked={preferences.activityHistory}
                                onChange={() => handlePreferenceChange('activityHistory')}
                                className="h-4 w-4 text-primary-700 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-700">Save activity history</span>
                        </label>
                    </div>
                </div>

                {/* Save Button */}
                <div className="pt-4">
                    <button
                        onClick={handleSavePreferences}
                        className="px-6 py-2 bg-primary-700 text-white rounded hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        Save Preferences
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PreferenceSettings;
