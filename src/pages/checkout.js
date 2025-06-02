/* eslint-disable react-hooks/exhaustive-deps */
// src/pages/checkout.jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';
import OrderSummary from '../components/checkout/OrderSummary';
import LoadingScreen from '../components/LoadingScreen';
import { notifyEvent } from '../components/Notification';
import OrderConfirmationModal from '../components/checkout/OrderConfirmationModal';
import GuestRegistrationPrompt from '../components/checkout/GuestRegistrationPrompt';
import CheckoutForm from '../components/checkout/CheckoutForm';
import { useCheckoutAddress } from '../hooks/useCheckoutAddress';
import { useCheckoutData } from '../hooks/useCheckoutData';
import { useCheckoutForm } from '../hooks/useCheckoutForm';
import { usePaymentMethods } from '../hooks/usePaymentMethods';

export default function Checkout() {
    const router = useRouter();
    const { mode } = router.query;

    // Custom hooks
    const { checkoutData, setCheckoutData } = useCheckoutAddress();
    const { 
        checkoutItems, 
        isLoading, 
        subtotal, 
        total, 
        shippingFee, 
        setShippingFee, 
        baseShippingFee, 
        setBaseShippingFee 
    } = useCheckoutData();
    
    const {
        formData,
        setFormData,
        handleInputChange,
        formIsValid,
        setFormIsValid,
        termsAccepted,
        setTermsAccepted,
    } = useCheckoutForm();

    // Fixed: Pass the setShippingFee function properly to usePaymentMethods
    const {
        paymentMethod,
        paymentVerified,
        setPaymentVerified,
        handlePaymentMethodChange: handlePaymentChange
    } = usePaymentMethods(baseShippingFee, setShippingFee);

    // Authentication and user state
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isGuestCheckout, setIsGuestCheckout] = useState(false);
    const [userId, setUserId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Address management state
    const [defaultAddress, setDefaultAddress] = useState(null);

    // Order completed state
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [orderDetails, setOrderDetails] = useState(null);

    // Bank transfer popup state
    const [showBankTransferPopup, setShowBankTransferPopup] = useState(false);
    const [pendingOrderId, setPendingOrderId] = useState(null);

    // UI state for smooth interactions
    const [isFormTransitioning, setIsFormTransitioning] = useState(false);

    // Load data when component mounts or mode changes
    useEffect(() => {
        if (router.isReady) {
            loadAuthAndUserData();
        }
    }, [router.isReady, mode]);

    // Enhanced form validation that works with the new CheckoutForm approach
    useEffect(() => {
        const validateFormData = () => {
            const errors = [];
            
            // Contact information validation
            if (!formData.email?.trim()) errors.push('Email is required');
            if (!formData.firstName?.trim()) errors.push('First name is required');
            if (!formData.lastName?.trim()) errors.push('Last name is required');
            if (!formData.phoneNumber?.trim()) errors.push('Phone number is required');

            // Address validation (skip for pickup)
            if (paymentMethod !== 'pay_at_pickup') {
                if (!checkoutData.address?.trim()) errors.push('Street address is required');
                if (!checkoutData.state?.trim()) errors.push('State is required');
                if (!checkoutData.lga?.trim()) errors.push('LGA is required');
                if (!checkoutData.city?.trim()) errors.push('City is required');
            }

            // Payment verification
            if (!paymentVerified) errors.push('Payment method verification required');
            
            // Terms acceptance
            if (!termsAccepted) errors.push('Terms and conditions must be accepted');

            setFormIsValid(errors.length === 0);
            return errors;
        };

        validateFormData();
    }, [formData, checkoutData, paymentVerified, termsAccepted, paymentMethod, setFormIsValid]);

    const handlePaymentMethodChange = (newMethod) => {
        setIsFormTransitioning(true);
        handlePaymentChange(newMethod);
        setFormIsValid(false); // Trigger revalidation
        
        // Smooth transition delay
        setTimeout(() => {
            setIsFormTransitioning(false);
        }, 150);
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

                        // Set form data from user profile
                        setFormData(prevState => ({
                            ...prevState,
                            email: userProfile.email || user.email || '',
                            firstName: userProfile.firstName || user.name?.split(' ')[0] || '',
                            lastName: userProfile.lastName || user.name?.split(' ').slice(1).join(' ') || '',
                            phoneNumber: userProfile.phoneNumber || user.phone || ''
                        }));

                        // Set default address if available
                        if (userProfile.defaultAddress) {
                            setDefaultAddress(userProfile.defaultAddress);
                            setCheckoutData(prevState => ({
                                ...prevState,
                                address: userProfile.defaultAddress.address || '',
                                city: userProfile.defaultAddress.city || '',
                                state: userProfile.defaultAddress.state || '',
                                lga: userProfile.defaultAddress.lga || '',
                                town: userProfile.defaultAddress.town || '',
                                zip: userProfile.defaultAddress.zip || '',
                                landmark: userProfile.defaultAddress.landmark || '',
                                additionalInfo: userProfile.defaultAddress.additionalInfo || ''
                            }));
                        }

                        // Load user's default payment method
                        await loadUserDefaultPaymentMethod(user.id);
                    } else {
                        // Fallback to basic user data
                        setFormData(prevState => ({
                            ...prevState,
                            email: user.email || '',
                            firstName: user.name?.split(' ')[0] || '',
                            lastName: user.name?.split(' ').slice(1).join(' ') || '',
                            phoneNumber: user.phone || ''
                        }));
                        await loadUserDefaultPaymentMethod(user.id);
                    }
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                    // Set basic user data on error
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
            // Generate guest user ID
            setUserId(`guest-${Date.now()}`);
        }
    };

    const loadUserDefaultPaymentMethod = async (userIdParam) => {
        try {
            const response = await fetch(`/api/users/payment-methods/${userIdParam}`);
            if (response.ok) {
                const data = await response.json();
                const { paymentMethods = [], savedCards = [] } = data;

                // Check for default saved card first
                const defaultCard = savedCards.find(card => card.isDefault);
                if (defaultCard) {
                    handlePaymentChange(`saved_card_${defaultCard.id}`);
                    // Fixed: Use setShippingFee from useCheckoutData hook
                    if (typeof setShippingFee === 'function') {
                        setShippingFee(baseShippingFee);
                    }
                    setPaymentVerified(true);
                    return;
                }

                // Check for default payment method
                const defaultMethod = paymentMethods.find(method => method.isDefault);
                if (defaultMethod) {
                    const methodType = defaultMethod.type;
                    handlePaymentChange(methodType);
                    
                    // Adjust shipping fee based on method
                    if (typeof setShippingFee === 'function') {
                        if (methodType === 'pay_at_pickup') {
                            setShippingFee(0);
                        } else {
                            setShippingFee(baseShippingFee);
                        }
                    }
                    
                    // Set payment verification status
                    setPaymentVerified(methodType !== 'card');
                    return;
                }
            }
            
            // Fallback to default method
            handlePaymentChange('pay_on_delivery');
            if (typeof setShippingFee === 'function') {
                setShippingFee(baseShippingFee);
            }
            setPaymentVerified(true);
        } catch (error) {
            console.error('Error loading user payment methods:', error);
            // Fallback on error
            handlePaymentChange('pay_on_delivery');
            if (typeof setShippingFee === 'function') {
                setShippingFee(baseShippingFee);
            }
            setPaymentVerified(true);
        }
    };

    const handleRegisterRedirect = () => {
        // Save current form state
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

    const handleBankTransferOrderComplete = () => {
        console.log('Completing bank transfer order:', pendingOrderId);
        
        // Clean up cart/direct purchase data
        if (mode === 'direct') {
            localStorage.removeItem('directPurchaseItem');
        } else {
            localStorage.removeItem('cart');
            window.dispatchEvent(new CustomEvent('cartUpdated'));
        }

        // Clean up guest checkout flag
        if (isGuestCheckout) {
            localStorage.removeItem('guestCheckout');
        }

        // Close popup and reset state
        setShowBankTransferPopup(false);
        setPendingOrderId(null);
        
        notifyEvent('Payment confirmed! Your order has been processed successfully.', 'success');
        
        // Redirect based on authentication status
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

            // Comprehensive validation
            const validationErrors = [];

            // Contact information validation
            if (!formData.email?.trim()) validationErrors.push('Email is required');
            if (!formData.firstName?.trim()) validationErrors.push('First name is required');
            if (!formData.lastName?.trim()) validationErrors.push('Last name is required');
            if (!formData.phoneNumber?.trim()) validationErrors.push('Phone number is required');

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (formData.email && !emailRegex.test(formData.email)) {
                validationErrors.push('Please enter a valid email address');
            }

            // Address validation (skip for pickup)
            if (paymentMethod !== 'pay_at_pickup') {
                // Use defaultAddress if available, otherwise use checkoutData
                const addressData = defaultAddress || checkoutData;
                if (!addressData.address?.trim()) validationErrors.push('Street address is required');
                if (!addressData.state?.trim()) validationErrors.push('State is required');
                if (!addressData.lga?.trim()) validationErrors.push('LGA is required');
                if (!addressData.city?.trim()) validationErrors.push('City is required');
            }

            // Payment verification
            if (!paymentVerified) validationErrors.push('Payment method must be verified');

            // Terms acceptance
            if (!termsAccepted) validationErrors.push('You must accept the terms and conditions');

            if (validationErrors.length > 0) {
                throw new Error(`Please correct the following: ${validationErrors.join(', ')}`);
            }

            // Prepare order items
            const orderItems = checkoutItems.map(item => ({
                productId: item.productId || item.id,
                name: item.name,
                price: parseFloat(item.price) || 0,
                quantity: parseInt(item.quantity) || 1,
                imageUrl: item.imageUrl || '',
            }));

            // Validate order data
            if (!userId) throw new Error('User ID is missing');
            if (!orderItems || orderItems.length === 0) throw new Error('No items in cart');
            if (!paymentMethod) throw new Error('Payment method is required');

            // Prepare customer data combining contact info and address
            // Use defaultAddress if available, otherwise use checkoutData
            const addressData = defaultAddress || checkoutData;
            const customerData = {
                ...formData,
                ...addressData
            };

            // Prepare order data
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

            // Submit order
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

                // Handle bank transfer separately
                if (paymentMethod === 'bank_transfer') {
                    setIsSubmitting(false);
                    setShowBankTransferPopup(true);
                    return;
                }

                // Clean up cart/direct purchase data
                if (mode === 'direct') {
                    localStorage.removeItem('directPurchaseItem');
                } else {
                    localStorage.removeItem('cart');
                    window.dispatchEvent(new CustomEvent('cartUpdated'));
                }

                // Clean up guest checkout flag
                if (isGuestCheckout) {
                    localStorage.removeItem('guestCheckout');
                }

                setPendingOrderId(null);

                // Show appropriate notification
                if (!res.ok && data.warning) {
                    notifyEvent(data.warning, 'warning');
                } else {
                    notifyEvent('Order placed successfully!', 'success');
                }

                // Prepare order details for confirmation modal
                const addressData = defaultAddress || checkoutData;
                const orderDetails = {
                    orderId: data.order.orderId,
                    items: orderItems,
                    shippingDetails: {
                        fullName: `${formData.firstName} ${formData.lastName}`,
                        phone: formData.phoneNumber,
                        email: formData.email,
                        address: addressData.address,
                        city: addressData.city,
                        state: addressData.state,
                        lga: addressData.lga || '',
                        town: addressData.town || '',
                        landmark: addressData.landmark || '',
                        additionalInfo: addressData.additionalInfo || ''
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

    if (isLoading) {
        return <LoadingScreen message="Loading checkout..." />;
    }

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

                            {/* Guest Registration Prompt */}
                            {isGuestCheckout && !isAuthenticated && (
                                <GuestRegistrationPrompt
                                    onRegisterRedirect={handleRegisterRedirect}
                                />
                            )}
                        </div>
                    </div>

                    {/* Checkout Form Section */}
                    <div className="lg:col-span-8">
                        <div className={`transition-all duration-150 ${isFormTransitioning ? 'opacity-95 transform scale-[0.999]' : 'opacity-100 transform scale-100'}`}>
                            <CheckoutForm
                                formData={formData}
                                handleInputChange={handleInputChange}
                                isAuthenticated={isAuthenticated}
                                paymentMethod={paymentMethod}
                                handlePaymentMethodChange={handlePaymentMethodChange}
                                defaultAddress={defaultAddress}
                                checkoutData={checkoutData}
                                setCheckoutData={setCheckoutData}
                                setShippingFee={setShippingFee}
                                setBaseShippingFee={setBaseShippingFee}
                                userId={userId}
                                onPaymentVerifiedChange={setPaymentVerified}
                                onOrderComplete={handleBankTransferOrderComplete}
                                showBankTransferPopup={showBankTransferPopup}
                                onCloseBankTransferPopup={() => setShowBankTransferPopup(false)}
                                orderTotal={total}
                                pendingOrderId={pendingOrderId}
                                termsAccepted={termsAccepted}
                                setTermsAccepted={setTermsAccepted}
                                formIsValid={formIsValid}
                                isSubmitting={isSubmitting}
                                onSubmit={handleSubmit}
                                onCancel={handleCancel}
                            />
                        </div>
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