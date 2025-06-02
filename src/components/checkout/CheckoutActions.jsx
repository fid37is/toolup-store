// components/checkout/CheckoutActions.jsx
const CheckoutActions = ({ 
    formIsValid, 
    isSubmitting, 
    onCancel, 
    onSubmit 
}) => {
    return (
        <div className="flex justify-center items-center gap-4 mt-6 w-full max-w-xl mx-auto">
            <button
                type="button"
                onClick={onCancel}
                className="w-[30%] px-4 py-3 border border-primary-700 text-primary-700 rounded hover:bg-gray-100 transition-colors duration-200 font-medium"
            >
                Cancel
            </button>

            <button
                type="submit"
                onClick={onSubmit}
                disabled={!formIsValid || isSubmitting}
                className={`w-[70%] px-4 py-3 rounded text-white font-medium text-md ${
                    formIsValid && !isSubmitting
                        ? 'bg-primary-700 hover:bg-primary-500'
                        : 'bg-gray-300 cursor-not-allowed'
                } transition-colors duration-200 flex items-center justify-center`}
            >
                {isSubmitting ? (
                    <>
                        <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                        Processing...
                    </>
                ) : (
                    'Complete Order'
                )}
            </button>
        </div>
    );
};

export default CheckoutActions;