import { useState } from 'react';

const SecuritySettings = () => {
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

    const handleToggle2FA = () => {
        setTwoFactorEnabled(prev => !prev);
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Security Settings</h2>
            <p className="text-gray-500 mb-6">Manage your account’s security settings</p>

            <div className="space-y-6">
                <div>
                    <h3 className="text-md font-medium mb-2">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-600 mb-3">
                        {twoFactorEnabled
                            ? 'Two-factor authentication is enabled for your account.'
                            : 'Two-factor authentication is not enabled.'}
                    </p>
                    <button
                        onClick={handleToggle2FA}
                        className={`px-4 py-2 rounded text-white ${twoFactorEnabled ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                            }`}
                    >
                        {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                    </button>
                </div>

                <div>
                    <h3 className="text-md font-medium mb-2">Recent Login Activity</h3>
                    <p className="text-sm text-gray-600 mb-3">You last signed in from: New York, NY on May 18, 2025</p>
                    {/* You can expand this with real-time data if connected to a backend */}
                </div>
            </div>
        </div>
    );
};

export default SecuritySettings;
