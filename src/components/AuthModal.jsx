// src/components/AuthModal.jsx
import { useRouter } from 'next/router';

/**
 * A reusable authentication modal component that prompts users to login/register or continue as guest
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Handler for closing the modal
 * @param {Function} props.onGuestCheckout - Handler for guest checkout
 * @param {Function} props.onLoginRegister - Handler for login/register
 * @param {string} props.redirectPath - Path to redirect after auth
 * @param {string} props.title - Modal title
 * @param {string} props.subtitle - Modal subtitle
 */
export default function AuthModal({
    isOpen,
    onClose,
    onGuestCheckout,
    onLoginRegister,
    redirectPath = '/checkout',
    title = 'Choose Checkout Option',
    subtitle = 'You can continue as a guest or create an account for a faster checkout experience.'
}) {
    const router = useRouter();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                <div className="mb-4 text-center">
                    <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
                    <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4">
                    <button
                        onClick={onLoginRegister}
                        className="rounded-lg bg-blue-600 px-4 py-3 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <div className="flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            Log In or Register
                        </div>
                        <p className="mt-1 text-xs text-blue-100">
                            Track orders, save your info for faster checkout
                        </p>
                    </button>

                    <button
                        onClick={onGuestCheckout}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <div className="flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8z" />
                            </svg>
                            Continue as Guest
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                            Checkout quickly without creating an account
                        </p>
                    </button>

                    <div className="mt-4 text-center">
                        <button
                            onClick={onClose}
                            className="text-sm text-gray-600 hover:text-gray-800 hover:underline"
                        >
                            Cancel and return to cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}