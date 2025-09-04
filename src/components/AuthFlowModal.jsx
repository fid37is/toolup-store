// src/components/AuthFlowModal.jsx
import { useEffect } from 'react';

export default function AuthFlowModal({ isOpen, onClose, onGuestCheckout, onLoginRegister }) {
    // Close modal on escape key press
    useEffect(() => {
        const handleEscapeKey = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscapeKey);
        return () => document.removeEventListener('keydown', handleEscapeKey);
    }, [isOpen, onClose]);

    // If modal is not open, don't render anything
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal */}
            <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6 sm:align-middle">
                    <div className="absolute right-4 top-4">
                        <button
                            type="button"
                            className="text-gray-400 hover:text-gray-500"
                            onClick={onClose}
                        >
                            <span className="sr-only">Close</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="text-center sm:mt-5">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                            Complete Your Purchase
                        </h3>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500">
                                How would you like to proceed with your purchase?
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 sm:mt-6 space-y-3">
                        <button
                            type="button"
                            className="inline-flex w-full justify-center rounded-md border border-transparent bg-primary-500 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:text-sm"
                            onClick={onGuestCheckout}
                        >
                            Continue as Guest
                        </button>
                        <button
                            type="button"
                            className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:text-sm"
                            onClick={onLoginRegister}
                        >
                            Login / Register
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}