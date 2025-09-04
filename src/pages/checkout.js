/* eslint-disable react-hooks/exhaustive-deps */
// src/pages/checkout.jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';
import OrderSummary from '../components/checkout/OrderSummary';
import ContactInformation from '../components/checkout/ContactInformation';
import LoadingScreen from '../components/LoadingScreen';
import { notifyEvent } from '../components/Notification';
import AddressManager from '../components/AddressManager';
import OrderConfirmationModal from '../components/checkout/OrderConfirmationModal';
import { useCheckoutAddress } from '../hooks/useCheckoutAddress';
import PaymentMethodSelector from '../components/checkout/PaymentMethodSelector';

export default function Checkout() {
    const router = useRouter();
    const { mode } = router.query;

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isGuestCheckout, setIsGuestCheckout] = useState(false);
    const [checkoutItems, setCheckoutItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('pay_on_delivery');
    const [paymentVerified, setPaymentVerified] = useState(true);
    const [userId, setUserId] = useState('');
    const [formIsValid, setFormIsValid] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const { checkoutData, setCheckoutData } = useCheckoutAddress();

    // Order completed state
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [orderDetails, setOrderDetails] = useState(null);

    // Bank transfer popup state
    const [showBankTransferPopup, setShowBankTransferPopup] = useState(false);
    const [pendingOrderId, setPendingOrderId] = useState(null);

    // Form data and shipping calculations
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        phoneNumber: ''
    });
    const [shippingFee, setShippingFee] = useState(3500);
    const [baseShippingFee, setBaseShippingFee] = useState(3500);

    // Calculate order summary values
    const subtotal = checkoutItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + shippingFee;

    // Load checkout items once when component mounts or mode changes
    useEffect(() => {
        if (router.isReady) {
            loadCheckoutItems();
            loadAuthAndUserData();
        }
    }, [router.isReady, mode]);

    // Validate form whenever form data or payment status changes
    useEffect(() => {
        validateForm();
    }, [formData, checkoutData, paymentVerified, termsAccepted]);

    const validateForm = () => {
        const requiredContactFields = [
            'email',
            'firstName',
            'lastName',
            'phoneNumber'
        ];

        const requiredAddressFields = [
            'address',
            'state',
            'lga'
        ];

        const invalidContactFields = requiredContactFields.filter(field =>
            !formData[field] || formData[field].trim() === ''
        );

        const invalidAddressFields = requiredAddressFields.filter(field =>
            !checkoutData[field] || checkoutData[field].trim() === ''
        );

        const allFieldsFilled = invalidContactFields.length === 0 && invalidAddressFields.length === 0;
        setFormIsValid(allFieldsFilled && paymentVerified && termsAccepted);
    };

    const loadCheckoutItems = async () => {
        try {
            let items = [];

            if (mode === 'direct') {
                // Direct checkout from product page
                const directItem = JSON.parse(localStorage.getItem('directPurchaseItem') || 'null');
                if (directItem) {
                    try {
                        const response = await fetch(`/api/products/${directItem.productId}`);
                        if (response.ok) {
                            const currentProduct = await response.json();
                            items = [{
                                ...directItem,
                                price: currentProduct.price,
                                name: currentProduct.name,
                                imageUrl: currentProduct.imageUrl,
                                quantity: directItem.quantity
                            }];
                        } else {
                            items = [directItem];
                        }
                    } catch (error) {
                        console.error('Error fetching current product data:', error);
                        items = [directItem];
                    }
                }
            } else {
                // Regular checkout from cart
                const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');

                const updatedItems = await Promise.all(
                    cartItems.map(async (item) => {
                        try {
                            const response = await fetch(`/api/products/${item.productId}`);
                            if (response.ok) {
                                const currentProduct = await response.json();
                                return {
                                    ...item,
                                    price: currentProduct.price,
                                    name: currentProduct.name,
                                    imageUrl: currentProduct.imageUrl,
                                    quantity: item.quantity
                                };
                            }
                        } catch (error) {
                            console.error(`Error fetching product ${item.productId}:`, error);
                        }
                        return item;
                    })
                );

                items = updatedItems;
            }

            // Ensure each item has productId
            items = items.map(item => {
                if (!item.productId && item.id) {
                    return { ...item, productId: item.id };
                }
                if (!item.productId && !item.id) {
                    return { ...item, productId: item.name.replace(/\s+/g, '-').toLowerCase() };
                }
                return item;
            });

            setCheckoutItems(items);
        } catch (error) {
            console.error('Error loading checkout items:', error);
            notifyEvent('Error loading checkout items. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const calculateShippingFeeAdjustment = (paymentMethod, baseShippingFee) => {
        switch (paymentMethod) {
            case 'pay_on_delivery':
                return baseShippingFee; // Removed COD fee as per PaymentMethodSelector
            case 'pay_at_pickup':
                return 0; // Free shipping for pickup
            default:
                return baseShippingFee; // Default shipping fee
        }
    };

    const handlePaymentMethodChange = (newMethod) => {
        setPaymentMethod(newMethod);

        // Calculate new shipping fee
        const newShippingFee = calculateShippingFeeAdjustment(newMethod, baseShippingFee);
        setShippingFee(newShippingFee);

        // Update payment verification status
        if (newMethod.startsWith('saved_card_') ||
            newMethod === 'bank_transfer' ||
            newMethod === 'pay_on_delivery' ||
            newMethod === 'pay_at_pickup') {
            setPaymentVerified(true);
        } else if (newMethod === 'card') {
            setPaymentVerified(false); // Will need card details
        }
    };

    // Handle shipping fee updates from the component
    const handleShippingFeeChange = (feeAdjustment) => {
        if (feeAdjustment < 0) {
            // This is pay_at_pickup - set shipping to 0
            setShippingFee(0);
        } else {
            // Add the fee adjustment to base shipping
            setShippingFee(baseShippingFee + feeAdjustment);
        }
    };

    const loadAuthAndUserData = async () => {
        const authStatus = localStorage.getItem('isAuthenticated');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const guestCheckout = localStorage.getItem('guestCheckout');

        setIsAuthenticated(authStatus === 'true');
        setIsGuestCheckout(guestCheckout === 'true');

        if (user && user.id) {
            setUserId(user.id);

            if (authStatus === 'true') {
                try {
                    const response = await fetch(`/api/users/profile/${user.id}`);
                    if (response.ok) {
                        const userProfile = await response.json();

                        setFormData(prevState => ({
                            ...prevState,
                            email: userProfile.email || user.email || '',
                            firstName: userProfile.firstName || user.name?.split(' ')[0] || '',
                            lastName: userProfile.lastName || user.name?.split(' ').slice(1).join(' ') || '',
                            phoneNumber: userProfile.phoneNumber || user.phone || ''
                        }));

                        // Set address data from user profile
                        if (userProfile.defaultAddress) {
                            setCheckoutData(prevState => ({
                                ...prevState,
                                address: userProfile.defaultAddress.address || '',
                                city: userProfile.defaultAddress.city || '',
                                state: userProfile.defaultAddress.state || '',
                                lga: userProfile.defaultAddress.lga || '',
                                town: userProfile.defaultAddress.town || '',
                                zip: userProfile.defaultAddress.zip || '',
                                additionalInfo: userProfile.defaultAddress.additionalInfo || ''
                            }));
                        }

                        // Set default payment method from user profile
                        await loadUserDefaultPaymentMethod(user.id);
                    } else {
                        setFormData(prevState => ({
                            ...prevState,
                            email: user.email || '',
                            firstName: user.name?.split(' ')[0] || '',
                            lastName: user.name?.split(' ').slice(1).join(' ') || '',
                            phoneNumber: user.phone || ''
                        }));
                        // Set default payment method
                        await loadUserDefaultPaymentMethod(user.id);
                    }
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                    setFormData(prevState => ({
                        ...prevState,
                        email: user.email || '',
                        firstName: user.name?.split(' ')[0] || '',
                        lastName: user.name?.split(' ').slice(1).join(' ') || '',
                        phoneNumber: user.phone || ''
                    }));
                }
            }
        } else {
            setUserId(`guest-${Date.now()}`);
        }
    };

    // Load user's default payment method and saved cards
    const loadUserDefaultPaymentMethod = async (userIdParam) => {
        try {
            const response = await fetch(`/api/users/payment-methods/${userIdParam}`);
            if (response.ok) {
                const data = await response.json();
                const { paymentMethods = [], savedCards = [] } = data;

                // Find default payment method
                const defaultCard = savedCards.find(card => card.isDefault);
                const defaultMethod = paymentMethods.find(method => method.isDefault);

                if (defaultCard) {
                    setPaymentMethod(`saved_card_${defaultCard.id}`);
                    setShippingFee(baseShippingFee);
                    setPaymentVerified(true);
                } else if (defaultMethod) {
                    switch (defaultMethod.type) {
                        case 'card':
                            setPaymentMethod('card');
                            setShippingFee(baseShippingFee);
                            setPaymentVerified(false); // Needs card details
                            break;
                        case 'bank_transfer':
                            setPaymentMethod('bank_transfer');
                            setShippingFee(baseShippingFee);
                            setPaymentVerified(true);
                            break;
                        case 'pay_on_delivery':
                            setPaymentMethod('pay_on_delivery');
                            setShippingFee(baseShippingFee);
                            setPaymentVerified(true);
                            break;
                        case 'pay_at_pickup':
                            setPaymentMethod('pay_at_pickup');
                            setShippingFee(0);
                            setPaymentVerified(true);
                            break;
                        default:
                            setPaymentMethod('pay_on_delivery');
                            setShippingFee(baseShippingFee);
                            setPaymentVerified(true);
                    }
                } else {
                    // No default method found, use pay_on_delivery as fallback
                    setPaymentMethod('pay_on_delivery');
                    setShippingFee(baseShippingFee);
                    setPaymentVerified(true);
                }
            } else {
                // Error fetching payment methods, use default
                setPaymentMethod('pay_on_delivery');
                setShippingFee(baseShippingFee);
                setPaymentVerified(true);
            }
        } catch (error) {
            console.error('Error loading user payment methods:', error);
            // Fallback to pay_on_delivery
            setPaymentMethod('pay_on_delivery');
            setShippingFee(baseShippingFee);
            setPaymentVerified(true);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleRegisterRedirect = () => {
        localStorage.setItem('checkoutFormData', JSON.stringify(formData));
        localStorage.setItem('checkoutAddressData', JSON.stringify(checkoutData));

        const returnUrl = `/checkout${mode ? `?mode=${mode}` : ''}`;
        router.push(`/auth?redirect=${encodeURIComponent(returnUrl)}`);
    };

    const handleCancel = () => {
        router.back();
    };

    // Restore form data if returning from auth
    useEffect(() => {
        const savedFormData = localStorage.getItem('checkoutFormData');
        const savedAddressData = localStorage.getItem('checkoutAddressData');

        if (savedFormData) {
            try {
                const parsed = JSON.parse(savedFormData);
                setFormData(prevState => ({ ...prevState, ...parsed }));
                localStorage.removeItem('checkoutFormData');
            } catch (error) {
                console.error('Error restoring form data:', error);
            }
        }

        if (savedAddressData) {
            try {
                const parsed = JSON.parse(savedAddressData);
                setCheckoutData(prevState => ({ ...prevState, ...parsed }));
                localStorage.removeItem('checkoutAddressData');
            } catch (error) {
                console.error('Error restoring address data:', error);
            }
        }
    }, []);

    // Handle bank transfer order completion
    const handleBankTransferOrderComplete = () => {
        console.log('Completing bank transfer order:', pendingOrderId);
        
        // Clear checkout data
        if (mode === 'direct') {
            localStorage.removeItem('directPurchaseItem');
        } else {
            localStorage.removeItem('cart');
            window.dispatchEvent(new CustomEvent('cartUpdated'));
        }

        if (isGuestCheckout) {
            localStorage.removeItem('guestCheckout');
        }

        // Close bank transfer popup
        setShowBankTransferPopup(false);
        
        // Clear pending order ID
        setPendingOrderId(null);
        
        // Show success message
        notifyEvent('Payment confirmed! Your order has been processed successfully.', 'success');
        
        // Redirect to orders page or home
        if (isAuthenticated) {
            router.push('/account/orders');
        } else {
            router.push('/');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setIsSubmitting(true);

            const validationErrors = [];

            // Contact information validation
            if (!formData.email) validationErrors.push('Email is required');
            if (!formData.firstName) validationErrors.push('First name is required');
            if (!formData.lastName) validationErrors.push('Last name is required');
            if (!formData.phoneNumber) validationErrors.push('Phone number is required');

            // Shipping address validation (skip for pickup)
            if (paymentMethod !== 'pay_at_pickup') {
                if (!checkoutData.address) validationErrors.push('Street address is required');
                if (!checkoutData.state) validationErrors.push('State is required');
                if (!checkoutData.lga) validationErrors.push('LGA is required');
            }

            // Terms validation
            if (!termsAccepted) validationErrors.push('You must accept the terms and conditions');

            if (validationErrors.length > 0) {
                throw new Error(`Please correct the following: ${validationErrors.join(', ')}`);
            }

            const orderItems = checkoutItems.map(item => ({
                productId: item.productId || item.id,
                name: item.name,
                price: parseFloat(item.price) || 0,
                quantity: parseInt(item.quantity) || 1,
                imageUrl: item.imageUrl || '',
            }));

            if (!userId) {
                throw new Error('User ID is missing');
            }

            if (!orderItems || orderItems.length === 0) {
                throw new Error('No items in cart');
            }

            if (!paymentMethod) {
                throw new Error('Payment method is required');
            }

            // Combine contact and address data
            const customerData = {
                ...formData,
                ...checkoutData
            };

            const orderData = {
                userId: userId,
                items: orderItems,
                customer: customerData,
                isAuthenticated,
                isGuestCheckout,
                shippingFee,
                paymentMethod,
                totalAmount: total,
                currency: 'NGN',
                orderDate: new Date().toISOString()
            };

            console.log('Submitting order data:', orderData);

            const res = await fetch('/api/orders/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            const data = await res.json();
            console.log('API response:', data);

            if (data.order && data.order.orderId) {
                localStorage.setItem('lastOrderId', data.order.orderId);
                setPendingOrderId(data.order.orderId);

                // If bank transfer is selected, show the popup
                if (paymentMethod === 'bank_transfer') {
                    setIsSubmitting(false);
                    setShowBankTransferPopup(true);
                    return;
                }

                // Clear checkout data for other payment methods
                if (mode === 'direct') {
                    localStorage.removeItem('directPurchaseItem');
                } else {
                    localStorage.removeItem('cart');
                    window.dispatchEvent(new CustomEvent('cartUpdated'));
                }

                if (isGuestCheckout) {
                    localStorage.removeItem('guestCheckout');
                }

                // Clear pending order ID for non-bank-transfer payments
                setPendingOrderId(null);

                if (!res.ok && data.warning) {
                    notifyEvent(data.warning, 'warning');
                } else {
                    notifyEvent('Order placed successfully!', 'success');
                }

                // Prepare order details for the modal
                const orderDetails = {
                    orderId: data.order.orderId,
                    items: orderItems,
                    shippingDetails: {
                        fullName: `${formData.firstName} ${formData.lastName}`,
                        phone: formData.phoneNumber,
                        email: formData.email,
                        address: checkoutData.address,
                        city: checkoutData.city,
                        state: checkoutData.state,
                        lga: checkoutData.lga || '',
                        additionalInfo: checkoutData.additionalInfo || ''
                    },
                    paymentMethod,
                    total,
                    shippingFee,
                    status: 'pending',
                    orderDate: new Date().toISOString()
                };

                setOrderDetails(orderDetails);
                setShowOrderModal(true);
                return;
            }

            if (!res.ok) {
                console.error('Order API error:', data);
                throw new Error(data.error || 'Failed to process order');
            }
        } catch (error) {
            console.error('Error processing order:', error);
            notifyEvent(`Order processing error: ${error.message || 'Please try again'}`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Redirect if no items to checkout
    useEffect(() => {
        if (!isLoading && checkoutItems.length === 0 && !showOrderModal) {
            notifyEvent('No items to checkout. Redirecting to home page.', 'warning');
            router.push('/');
        }
    }, [isLoading, checkoutItems.length, router, showOrderModal]);

    // Render loading screen
    if (isLoading) {
        return <LoadingScreen message="Loading checkout..." />;
    }

    // Don't render if no items and modal not shown
    if (checkoutItems.length === 0 && !showOrderModal) {
        return <LoadingScreen message="Redirecting..." />;
    }

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <Head>
                <title>Checkout | ToolUp Store</title>
                <meta name="description" content="Complete your purchase" />
            </Head>

            <Header />

            <main className="container mx-auto flex-grow px-4 py-8">
                <div className="flex items-center justify-center mb-8">
                    <h1 className="text-center text-3xl font-bold text-gray-800">Complete Your Order</h1>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    {/* Order Summary */}
                    <div className="lg:col-span-4">
                        <div className="lg:sticky lg:top-8">
                            <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-shadow duration-300 hover:shadow-xl">
                                <OrderSummary
                                    checkoutItems={checkoutItems}
                                    subtotal={subtotal}
                                    shippingFee={shippingFee}
                                    total={total}
                                    formData={formData}
                                    isGuestCheckout={isGuestCheckout}
                                />
                            </div>

                            {/* Register suggestion for guest users */}
                            {isGuestCheckout && !isAuthenticated && (
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
                                                onClick={handleRegisterRedirect}
                                                className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-500 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                                            >
                                                Create Account
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Checkout Form Section */}
                    <div className="lg:col-span-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Contact Information */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <ContactInformation
                                    formData={formData}
                                    handleInputChange={handleInputChange}
                                    isAuthenticated={isAuthenticated}
                                />
                            </div>

                            {/* Address Manager - Skip for pickup */}
                            {paymentMethod !== 'pay_at_pickup' && (
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <AddressManager
                                        mode="checkout"
                                        formData={checkoutData}
                                        handleInputChange={(e) => setCheckoutData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                                        onAddressSelect={(address) => setCheckoutData(prev => ({ ...prev, ...address }))}
                                        setShippingFee={setShippingFee}
                                        setBaseShippingFee={setBaseShippingFee}
                                        paymentMethod={paymentMethod}
                                    />
                                </div>
                            )}

                            {/* Payment Method */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <PaymentMethodSelector
                                    selectedMethod={paymentMethod}
                                    onMethodChange={handlePaymentMethodChange}
                                    onShippingFeeChange={handleShippingFeeChange}
                                    onPaymentVerifiedChange={setPaymentVerified}
                                    userId={userId}
                                    isAuthenticated={isAuthenticated}
                                    onOrderComplete={handleBankTransferOrderComplete}
                                    showBankTransferPopup={showBankTransferPopup}
                                    onCloseBankTransferPopup={() => setShowBankTransferPopup(false)}
                                    orderTotal={total}
                                    pendingOrderId={pendingOrderId}
                                />
                            </div>

                            {/* Terms and Conditions */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-lg font-semibold mb-4">Terms & Conditions</h2>
                                <div className="flex items-start">
                                    <div className="flex h-5 items-center">
                                        <input
                                            id="terms"
                                            name="terms"
                                            type="checkbox"
                                            checked={termsAccepted}
                                            onChange={(e) => setTermsAccepted(e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="terms" className="text-gray-700">
                                            I agree to the{' '}
                                            <a href="/terms" target="_blank" className="text-blue-600 hover:underline">
                                                Terms of Service
                                            </a>{' '}
                                            and{' '}
                                            <a href="/privacy" target="_blank" className="text-blue-600 hover:underline">
                                                Privacy Policy
                                            </a>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-center items-center gap-4 mt-6 w-full max-w-xl mx-auto">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="w-[30%] px-4 py-3 border border-primary-700 text-primary-700 rounded hover:bg-gray-100 transition-colors duration-200 font-medium"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={!formIsValid || isSubmitting}
                                    className={`w-[70%] px-4 py-3 rounded text-white font-medium text-md ${formIsValid && !isSubmitting
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

                        </form>
                    </div>
                </div>
            </main>

            <Footer />

            {/* Order Confirmation Modal */}
            {showOrderModal && orderDetails && (
                <OrderConfirmationModal
                    orderDetails={orderDetails}
                    onClose={() => setShowOrderModal(false)}
                    onContinueShopping={() => {
                        setShowOrderModal(false);
                        router.push('/');
                    }}
                    onViewOrders={() => {
                        setShowOrderModal(false);
                        router.push('/account/orders');
                    }}
                />
            )}
        </div>
    );
}