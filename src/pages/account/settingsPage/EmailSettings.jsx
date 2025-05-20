import { useState } from 'react';

const EmailSettings = () => {
    const [primaryEmail, setPrimaryEmail] = useState('john.doe@example.com');
    const [backupEmail, setBackupEmail] = useState('');
    const [preferences, setPreferences] = useState({
        marketing: true,
        updates: true,
        newsletter: true
    });

    const handlePreferenceChange = (preference) => {
        setPreferences({
            ...preferences,
            [preference]: !preferences[preference]
        });
    };

    const handleSaveChanges = () => {
        // Here you would typically send these changes to your API
        console.log('Saving email settings:', { primaryEmail, backupEmail, preferences });
        alert('Email settings saved successfully!');
    };

    return (
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
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={primaryEmail}
                        onChange={(e) => setPrimaryEmail(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="backupEmail">
                        Backup Email (optional)
                    </label>
                    <input
                        type="email"
                        id="backupEmail"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Enter a backup email address"
                        value={backupEmail}
                        onChange={(e) => setBackupEmail(e.target.value)}
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
                                    checked={preferences.marketing}
                                    onChange={() => handlePreferenceChange('marketing')}
                                    className="w-4 h-4 border-gray-300 rounded text-primary-700 focus:ring-primary-500"
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
                                    checked={preferences.updates}
                                    onChange={() => handlePreferenceChange('updates')}
                                    className="w-4 h-4 border-gray-300 rounded text-primary-700 focus:ring-primary-500"
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
                                    checked={preferences.newsletter}
                                    onChange={() => handlePreferenceChange('newsletter')}
                                    className="w-4 h-4 border-gray-300 rounded text-primary-700 focus:ring-primary-500"
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
                    <button 
                        className="px-4 py-2 bg-primary-700 text-white rounded hover:bg-primary-500"
                        onClick={handleSaveChanges}
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmailSettings;