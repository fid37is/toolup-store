import { useState, useEffect } from 'react';
import useAuthCheck from '../../../hooks/useAuthCheck'; // Adjust import path as needed

const PasswordSettings = () => {
    const { user } = useAuthCheck();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isGoogleUser, setIsGoogleUser] = useState(false);
    
    // Password visibility toggles
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    // Password validation states
    const [passwordChecks, setPasswordChecks] = useState({
        hasMinLength: false,
        hasNumber: false,
        hasSpecialChar: false,
        hasUpperCase: false
    });

    useEffect(() => {
        // Check if user authenticated with Google SSO
        if (user?.provider === 'google' || user?.authMethod === 'google') {
            setIsGoogleUser(true);
        }
    }, [user]);

    // Check password requirements while user types
    useEffect(() => {
        if (newPassword) {
            setPasswordChecks({
                hasMinLength: newPassword.length >= 8,
                hasNumber: /\d/.test(newPassword),
                hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
                hasUpperCase: /[A-Z]/.test(newPassword)
            });
        } else {
            // Reset checks when password is empty
            setPasswordChecks({
                hasMinLength: false,
                hasNumber: false,
                hasSpecialChar: false,
                hasUpperCase: false
            });
        }
    }, [newPassword]);

    const validatePassword = (password) => {
        const { hasMinLength, hasNumber, hasSpecialChar, hasUpperCase } = passwordChecks;
        return hasMinLength && hasNumber && hasSpecialChar && hasUpperCase;
    };

    const handleUpdatePassword = () => {
        // Reset messages
        setError('');
        setSuccess('');

        // Validate inputs
        if (!currentPassword || !newPassword || !confirmPassword) {
            setError('All fields are required');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (!validatePassword(newPassword)) {
            setError('Please ensure your password meets all the requirements below');
            return;
        }

        // Here you would typically send the password change request to your API
        console.log('Updating password:', { currentPassword, newPassword });
        
        // Simulate successful password change
        setSuccess('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        // Reset the password visibility
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
    };

    const redirectToGoogleAccount = () => {
        window.open('https://myaccount.google.com/security', '_blank');
    };

    // Toggle password visibility
    const togglePasswordVisibility = (field) => {
        switch(field) {
            case 'current':
                setShowCurrentPassword(!showCurrentPassword);
                break;
            case 'new':
                setShowNewPassword(!showNewPassword);
                break;
            case 'confirm':
                setShowConfirmPassword(!showConfirmPassword);
                break;
            default:
                break;
        }
    };

    // Password input field with visibility toggle
    const PasswordInput = ({ id, value, onChange, placeholder, type, showPassword, toggleVisibility }) => (
        <div className="relative">
            <input
                type={showPassword ? "text" : "password"}
                id={id}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
            <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={toggleVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
            >
                {showPassword ? (
                    // Eye-off icon (password visible)
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                ) : (
                    // Eye icon (password hidden)
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                )}
            </button>
        </div>
    );

    // Password strength indicator
    const PasswordStrengthIndicator = ({ checks }) => {
        const { hasMinLength, hasNumber, hasSpecialChar, hasUpperCase } = checks;
        const totalChecks = Object.values(checks).filter(Boolean).length;
        
        // Determine strength level
        let strengthLevel = "none";
        let strengthColor = "bg-gray-200";
        let strengthText = "Not set";
        
        if (totalChecks === 1) {
            strengthLevel = "weak";
            strengthColor = "bg-red-500";
            strengthText = "Weak";
        } else if (totalChecks === 2) {
            strengthLevel = "fair";
            strengthColor = "bg-orange-500";
            strengthText = "Fair";
        } else if (totalChecks === 3) {
            strengthLevel = "good";
            strengthColor = "bg-yellow-500";
            strengthText = "Good";
        } else if (totalChecks === 4) {
            strengthLevel = "strong";
            strengthColor = "bg-green-500";
            strengthText = "Strong";
        }
        
        return (
            <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">Password Strength</span>
                    <span className={`text-xs font-medium ${
                        strengthLevel === "weak" ? "text-red-600" :
                        strengthLevel === "fair" ? "text-orange-600" :
                        strengthLevel === "good" ? "text-yellow-600" :
                        strengthLevel === "strong" ? "text-green-600" : "text-gray-600"
                    }`}>{strengthText}</span>
                </div>
                <div className="flex space-x-1 h-1.5">
                    <div className={`flex-1 rounded-full ${totalChecks >= 1 ? strengthColor : "bg-gray-200"}`}></div>
                    <div className={`flex-1 rounded-full ${totalChecks >= 2 ? strengthColor : "bg-gray-200"}`}></div>
                    <div className={`flex-1 rounded-full ${totalChecks >= 3 ? strengthColor : "bg-gray-200"}`}></div>
                    <div className={`flex-1 rounded-full ${totalChecks >= 4 ? strengthColor : "bg-gray-200"}`}></div>
                </div>
                
                <div className="mt-3 space-y-2">
                    <RequirementCheck checked={hasMinLength}>
                        At least 8 characters
                    </RequirementCheck>
                    <RequirementCheck checked={hasNumber}>
                        Contains a number
                    </RequirementCheck>
                    <RequirementCheck checked={hasSpecialChar}>
                        Contains a special character
                    </RequirementCheck>
                    <RequirementCheck checked={hasUpperCase}>
                        Contains an uppercase letter
                    </RequirementCheck>
                </div>
            </div>
        );
    };

    // Requirement check item
    const RequirementCheck = ({ checked, children }) => (
        <div className="flex items-center">
            {checked ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
            )}
            <span className={`text-xs ${checked ? "text-green-700" : "text-gray-600"}`}>{children}</span>
        </div>
    );

    // Alternative UI for Google SSO users
    if (isGoogleUser) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold mb-4">Password Settings</h2>
                
                {/* Enhanced info message for SSO users */}
                <div className="flex items-start space-x-4 mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-md font-medium text-blue-800">Google Sign-In Account</h3>
                        <p className="text-sm text-blue-600 mt-1">
                            Your account uses Google for authentication. For security purposes, password changes must be made through your Google account settings.
                        </p>
                        <p className="text-sm text-blue-600 mt-2">
                            This helps maintain a consistent security profile and enables features like two-factor authentication across all your Google-connected services.
                        </p>
                    </div>
                </div>

                {/* Google Account Section - Enhanced */}
                <div className="flex flex-col items-center bg-gray-50 p-6 rounded-lg border border-gray-200">
                    {/* Google Logo */}
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                        <svg viewBox="0 0 24 24" width="30" height="30" xmlns="http://www.w3.org/2000/svg">
                            <g transform="matrix(1, 0, 0, 1, 0, 0)">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </g>
                        </svg>
                    </div>
                    
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Google Account Security</h3>
                    <p className="text-center text-gray-600 mb-4">
                        Your password is managed by Google. For security reasons, you'll need to update it through your Google account.
                    </p>
                    
                    {/* Google Account Benefits */}
                    <div className="w-full mb-5">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Benefits of Google Sign-In:</h4>
                        <ul className="space-y-2">
                            <li className="flex items-start">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm text-gray-600">Enhanced security with Google's advanced protection</span>
                            </li>
                            <li className="flex items-start">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm text-gray-600">No need to remember another password</span>
                            </li>
                            <li className="flex items-start">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm text-gray-600">Two-factor authentication option for extra security</span>
                            </li>
                        </ul>
                    </div>
                    
                    <button 
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm flex items-center"
                        onClick={redirectToGoogleAccount}
                    >
                        <span>Manage Google Account</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </button>
                </div>

                {/* Support Section - Enhanced */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-md font-medium text-gray-700 mb-2">Need Assistance?</h3>
                    <p className="text-sm text-gray-500">
                        If you need help managing your authentication settings or have questions about Google Sign-In, our support team is ready to help.
                    </p>
                    <div className="mt-3 flex space-x-4">
                        <button className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            Contact Support
                        </button>
                        <button className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            View FAQ
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Regular password change UI for non-SSO users
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Password Settings</h2>
            <p className="text-gray-600 mb-6">Update your password to maintain account security</p>

            {/* Error message */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            {/* Success message */}
            {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{success}</span>
                </div>
            )}

            <div className="space-y-5">
                {/* Current Password Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="currentPassword">
                        Current Password
                    </label>
                    <PasswordInput
                        id="currentPassword"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter your current password"
                        showPassword={showCurrentPassword}
                        toggleVisibility={() => togglePasswordVisibility('current')}
                    />
                </div>

                {/* New Password Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="newPassword">
                        New Password
                    </label>
                    <PasswordInput
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter your new password"
                        showPassword={showNewPassword}
                        toggleVisibility={() => togglePasswordVisibility('new')}
                    />

                    {/* Password strength and requirement checks */}
                    <PasswordStrengthIndicator checks={passwordChecks} />
                </div>

                {/* Confirm Password Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="confirmPassword">
                        Confirm New Password
                    </label>
                    <PasswordInput
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your new password"
                        showPassword={showConfirmPassword}
                        toggleVisibility={() => togglePasswordVisibility('confirm')}
                    />
                    
                    {/* Password match indicator */}
                    {newPassword && confirmPassword && (
                        <div className="mt-2 flex items-center">
                            {newPassword === confirmPassword ? (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-xs text-green-600">Passwords match</span>
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-xs text-red-600">Passwords do not match</span>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                    <button 
                        className="px-4 py-2 bg-primary-700 text-white rounded hover:bg-primary-500 transition-colors shadow-sm font-medium"
                        onClick={handleUpdatePassword}
                    >
                        Update Password
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PasswordSettings;