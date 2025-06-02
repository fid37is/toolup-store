// components/checkout/GuestRegistrationPrompt.jsx

const GuestRegistrationPrompt = ({ 
    isGuestCheckout, 
    isAuthenticated, 
    onRegisterRedirect 
}) => {
    if (!isGuestCheckout || isAuthenticated) {
        return null;
    }

    return (
        <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-blue-800">
                        Create an account to track your order
                    </h3>
                    <p className="mt-1 text-xs text-blue-700">
                        Register to easily track your order status and enjoy faster checkout next time.
                    </p>
                    <button
                        onClick={onRegisterRedirect}
                        className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-500 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                    >
                        Create Account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GuestRegistrationPrompt;