// 3. src/components/auth/GoogleSignIn.jsx
import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, googleProvider } from '../../lib/firebase';
import { createUserDocument } from '../../lib/firestore';
import { toast } from 'sonner';

export default function GoogleSignIn() {
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        setIsLoading(true);

        try {
            // Configure Google provider with necessary scopes
            googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');
            googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');

            // Force re-consent to ensure we get the latest user info
            // This also handles Terms acceptance through Google's own UI
            googleProvider.setCustomParameters({
                prompt: 'select_account'
            });

            const result = await signInWithPopup(auth, googleProvider);

            // Get Google Access Token to access the Google API
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;

            // The signed-in user info
            const user = result.user;

            // Create or update user document in Firestore
            const nameParts = user.displayName ? user.displayName.trim().split(' ') : ['', ''];
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            try {
                await createUserDocument(user, {
                    firstName,
                    lastName,
                    email: user.email,
                    phone: user.phoneNumber || '',
                    photoURL: user.photoURL || '',
                    joinDate: new Date().toISOString(),
                    acceptedTerms: true,
                    acceptedTermsDate: new Date().toISOString(),
                    authProvider: 'google',
                    lastLogin: new Date().toISOString()
                });
            } catch (docError) {
                console.error('Error creating/updating user document:', docError);
                // We'll still allow login even if document creation fails
            }

            // Show success notification
            toast.success('Signed in successfully!', {
                position: 'top-right',
                duration: 3000,
            });

            // Auth state listener will handle redirect
        } catch (error) {
            // Handle specific Google sign-in errors
            if (error.code === 'auth/popup-closed-by-user') {
                toast.error('Sign-in was cancelled. Please try again.', {
                    position: 'top-right',
                    duration: 4000,
                });
            } else if (error.code === 'auth/cancelled-popup-request') {
                // This is a common error that happens when multiple popups are opened
                // We can ignore this silently or show a more user-friendly message
                toast.info('Authentication process was interrupted. Please try again.', {
                    position: 'top-right',
                    duration: 3000,
                });
            } else {
                toast.error('Google sign-in failed. Please try again.', {
                    position: 'top-right',
                    duration: 4000,
                });
                console.error('Google sign-in error:', error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="px-6 pt-8">
            {/* Social Login Button */}
            <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white py-3 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 active:bg-gray-100 active:shadow-inner focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all"
            >
                {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    <>
                        <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
                            />
                            <path
                                fill="#34A853"
                                d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09c1.97 3.92 6.02 6.62 10.71 6.62z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29v-3.09h-3.98c-.8 1.61-1.26 3.43-1.26 5.38s.46 3.77 1.26 5.38l3.98-3.09z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42c-2.08-1.94-4.78-3.13-8.02-3.13-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
                            />
                        </svg>
                        Continue with Google
                    </>
                )}
            </button>

            {/* Divider (Optional - can also be moved to main Auth component) */}
            <div className="relative mt-6 mb-4">
                <div className="absolute inset-0 flex items-center px-6">
                    <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-4 text-gray-500 font-medium">Or continue with email</span>
                </div>
            </div>
        </div>
    );
}