/* eslint-disable react-hooks/exhaustive-deps */
// src/pages/checkout.jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Header from '../components/Header';
import Footer from '../components/Footer';
import OrderSummary from '../components/checkout/OrderSummary';
import ContactInformation from '../components/checkout/ContactInformation';
import ShippingAddress from '../components/checkout/ShippingAddress';
import PaymentMethod from '../components/checkout/PaymentMethod';
import LoadingScreen from '../components/LoadingScreen';
import { notifyEvent } from '../components/Notification';

export default function Checkout() {
    const router = useRouter();
    const { mode } = router.query;

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isGuestCheckout, setIsGuestCheckout] = useState(false);
    const [checkoutItems, setCheckoutItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('pay_on_delivery');
    const [paymentVerified, setPaymentVerified] = useState(true); // Default to true for non-bank methods
    const [userId, setUserId] = useState('');
    const [formIsValid, setFormIsValid] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);

    // Order completed state
    const [orderCompleted, setOrderCompleted] = useState(false);
    const [orderDetails, setOrderDetails] = useState(null);

    // Form data and shipping calculations
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        address: '',
        city: '',
        state: '', // Empty state - essential for selection to work properly
        lga: '',
        town: '',
        zip: '',
        additionalInfo: ''
    });
    const [shippingFee, setShippingFee] = useState(3500); // Initialize with standard shipping fee instead of Delta state fee
    const [baseShippingFee, setBaseShippingFee] = useState(3500); // Track the base shipping fee separately


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

    useEffect(() => {
    // If state is pre-filled from user profile, make sure to load the corresponding LGAs
    if (formData.state && formData.state.trim() !== '') {
        console.log("Loading LGAs for pre-filled state:", formData.state);
        // This will trigger the useEffect in ShippingAddress that loads LGAs
    }
}, [formData.state]);

    // Validate form whenever form data or payment status changes
    useEffect(() => {
        validateForm();

        // For debugging the state selection issue
        console.log("Form data state value updated:", formData.state);
    }, [formData, paymentVerified, termsAccepted]);

    const validateForm = () => {
        const requiredFields = [
            'email',
            'firstName',
            'lastName',
            'phoneNumber',
            'address',
            'state',
            'lga'
        ];


        // Add city validation only if needed
        const invalidFields = requiredFields.filter(field =>
            !formData[field] || formData[field].trim() === ''
        );

        if (invalidFields.length > 0) {
            console.log('Invalid fields:', invalidFields);
            console.log('Current form data:', formData);
        }

        const allFieldsFilled = invalidFields.length === 0;
        setFormIsValid(allFieldsFilled && paymentVerified && termsAccepted);
    };

    const loadCheckoutItems = async () => {
        try {
            let items = [];

            if (mode === 'direct') {
                // Direct checkout from product page
                const directItem = JSON.parse(localStorage.getItem('directPurchaseItem') || 'null');
                if (directItem) {
                    // Fetch current product data to ensure price and availability are up to date
                    try {
                        const response = await fetch(`/api/products/${directItem.productId}`);
                        if (response.ok) {
                            const currentProduct = await response.json();
                            // Update item with current data while preserving selected quantity
                            items = [{
                                ...directItem,
                                price: currentProduct.price,
                                name: currentProduct.name,
                                imageUrl: currentProduct.imageUrl,
                                // Keep the originally selected quantity
                                quantity: directItem.quantity
                            }];
                        } else {
                            // If product fetch fails, use stored data
                            items = [directItem];
                        }
                    } catch (error) {
                        console.error('Error fetching current product data:', error);
                        // Use stored data as fallback
                        items = [directItem];
                    }
                }
            } else {
                // Regular checkout from cart
                const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');

                // Fetch current data for all cart items
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
                                    // Keep the cart quantity
                                    quantity: item.quantity
                                };
                            }
                        } catch (error) {
                            console.error(`Error fetching product ${item.productId}:`, error);
                        }
                        // Return original item if fetch fails
                        return item;
                    })
                );

                items = updatedItems;
            }

            // Ensure each item has productId (critical for order tracking)
            items = items.map(item => {
                // If item doesn't have productId but has id, use that as productId
                if (!item.productId && item.id) {
                    return { ...item, productId: item.id };
                }
                // If item doesn't have either, generate a fallback ID from the name
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

    const loadAuthAndUserData = async () => {
        const authStatus = localStorage.getItem('isAuthenticated');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const guestCheckout = localStorage.getItem('guestCheckout');

        setIsAuthenticated(authStatus === 'true');
        setIsGuestCheckout(guestCheckout === 'true');

        // Set userId from the user object
        if (user && user.id) {
            setUserId(user.id);

            // If authenticated, try to fetch full user profile including address
            if (authStatus === 'true') {
                try {
                    // Fetch the user's complete profile including shipping address
                    const response = await fetch(`/api/users/profile/${user.id}`);
                    if (response.ok) {
                        const userProfile = await response.json();

                        // Pre-fill form with user data including phone and address
                        setFormData(prevState => ({
                            ...prevState,
                            email: userProfile.email || user.email || '',
                            firstName: userProfile.firstName || user.name?.split(' ')[0] || '',
                            lastName: userProfile.lastName || user.name?.split(' ').slice(1).join(' ') || '',
                            phoneNumber: userProfile.phoneNumber || user.phone || '',
                            // Pre-fill shipping address if available
                            address: userProfile.defaultAddress?.address || '',
                            city: userProfile.defaultAddress?.city || '',
                            state: userProfile.defaultAddress?.state || '',
                            lga: userProfile.defaultAddress?.lga || '',
                            town: userProfile.defaultAddress?.town || '',
                            zip: userProfile.defaultAddress?.zip || '',
                            additionalInfo: userProfile.defaultAddress?.additionalInfo || ''
                        }));

                        console.log("Pre-filled user data from profile", userProfile);
                    } else {
                        // Fallback to basic user info if profile fetch fails
                        setFormData(prevState => ({
                            ...prevState,
                            email: user.email || '',
                            firstName: user.name?.split(' ')[0] || '',
                            lastName: user.name?.split(' ').slice(1).join(' ') || '',
                            phoneNumber: user.phone || ''
                        }));
                    }
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                    // Basic fallback in case of error
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
            // Generate a guest user ID if not authenticated
            setUserId(`guest-${Date.now()}`);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Log when state field specifically is changed
        if (name === 'state') {
            console.log(`State field changed to: "${value}"`);
        }

        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleRegisterRedirect = () => {
        // Store current form data to preserve it
        localStorage.setItem('checkoutFormData', JSON.stringify(formData));

        // Store the items to preserve checkout state
        if (mode === 'direct') {
            // Already stored in directPurchaseItem
        } else {
            // Cart items are already in localStorage
        }

        // Construct return URL
        const returnUrl = `/checkout${mode ? `?mode=${mode}` : ''}`;

        // Redirect to auth page with return URL
        router.push(`/auth?redirect=${encodeURIComponent(returnUrl)}`);
    };

    // Restore form data if returning from auth
    useEffect(() => {
        const savedFormData = localStorage.getItem('checkoutFormData');
        if (savedFormData) {
            try {
                const parsed = JSON.parse(savedFormData);
                setFormData(prevState => ({
                    ...prevState,
                    ...parsed
                }));
                // Clear saved data after restoring
                localStorage.removeItem('checkoutFormData');
            } catch (error) {
                console.error('Error restoring form data:', error);
            }
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Show loading state
            setIsSubmitting(true);

            // Enhanced validation with better error messages
            const validationErrors = [];

            // Contact information validation
            if (!formData.email) validationErrors.push('Email is required');
            if (!formData.firstName) validationErrors.push('First name is required');
            if (!formData.lastName) validationErrors.push('Last name is required');
            if (!formData.phoneNumber) validationErrors.push('Phone number is required');

            // Shipping address validation
            if (!formData.address) validationErrors.push('Street address is required');
            if (!formData.state) validationErrors.push('State is required');
            if (!formData.lga) validationErrors.push('LGA is required');

            // Terms validation
            if (!termsAccepted) validationErrors.push('You must accept the terms and conditions');

            // Check if we have any validation errors
            if (validationErrors.length > 0) {
                throw new Error(`Please correct the following: ${validationErrors.join(', ')}`);
            }

            // Map order items to ensure proper product reference
            const orderItems = checkoutItems.map(item => ({
                productId: item.productId || item.id,
                name: item.name,
                price: parseFloat(item.price) || 0,
                quantity: parseInt(item.quantity) || 1,
                imageUrl: item.imageUrl || '',
            }));

            // Ensure we have the required fields
            if (!userId) {
                throw new Error('User ID is missing');
            }

            if (!orderItems || orderItems.length === 0) {
                throw new Error('No items in cart');
            }

            if (!paymentMethod) {
                throw new Error('Payment method is required');
            }

            const orderData = {
                userId: userId,
                items: orderItems,
                customer: formData,
                isAuthenticated,
                isGuestCheckout,
                shippingFee,
                paymentMethod,
                totalAmount: total,
                currency: 'NGN',
                orderDate: new Date().toISOString()
            };

            console.log('Submitting order data:', orderData);

            // Call the API to save order
            const res = await fetch('/api/orders/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            const data = await res.json();
            console.log('API response:', data);

            // Handle response - even with warnings, proceed if we have orderId
            if (data.order && data.order.orderId) {
                // Store the order ID for reference
                localStorage.setItem('lastOrderId', data.order.orderId);

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

                // Show appropriate message
                if (!res.ok && data.warning) {
                    notifyEvent(data.warning, 'warning');
                } else {
                    notifyEvent('Order placed successfully!', 'success');
                }

                // Prepare order details for the confirmation view
                const orderDetails = {
                    orderId: data.order.orderId,
                    items: orderItems,
                    shippingDetails: {
                        fullName: `${formData.firstName} ${formData.lastName}`,
                        phone: formData.phoneNumber,
                        email: formData.email,
                        address: formData.address,
                        city: formData.city,
                        state: formData.state,
                        lga: formData.lga || '',
                        additionalInfo: formData.additionalInfo || ''
                    },
                    paymentMethod,
                    total,
                    status: 'pending',
                    orderDate: new Date().toISOString()
                };

                // Update state to show confirmation view
                setOrderDetails(orderDetails);
                setOrderCompleted(true);

                // Don't redirect, show confirmation in place
                return;
            }

            // Handle failure
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
        if (!isLoading && checkoutItems.length === 0 && !orderCompleted) {
            notifyEvent('No items to checkout. Redirecting to home page.', 'warning');
            router.push('/');
        }
    }, [isLoading, checkoutItems.length, router, orderCompleted]);

    // Render loading screen
    if (isLoading) {
        return <LoadingScreen message="Loading checkout..." />;
    }

    // Don't render if no items and order not completed (will redirect)
    if (checkoutItems.length === 0 && !orderCompleted) {
        return <LoadingScreen message="Redirecting..." />;
    }

    // Render order confirmation when order is completed
    if (orderCompleted && orderDetails) {
        return (
            <div className="flex min-h-screen flex-col bg-gray-50">
                <Head>
                    <title>Order Confirmation | ToolUp Store</title>
                    <meta name="description" content="Order confirmation details" />
                </Head>

                <Header />

                <main className="container mx-auto flex-grow px-4 py-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h2 className="text-lg font-medium text-green-800">Order Placed Successfully!</h2>
                                    <p className="text-green-700">Thank you for your order. We&apos;ve received your order and are processing it now.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h1 className="text-2xl font-bold">Order Details</h1>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                    {orderDetails.status.charAt(0).toUpperCase() + orderDetails.status.slice(1)}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h2 className="font-semibold text-gray-800 mb-2">Order Information</h2>
                                    <p><span className="text-gray-600">Order ID:</span> {orderDetails.orderId}</p>
                                    <p>
                                        <span className="text-gray-600">Date:</span>{' '}
                                        {new Date(orderDetails.orderDate).toLocaleDateString('en-NG', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                    <p>
                                        <span className="text-gray-600">Payment Method:</span>{' '}
                                        {orderDetails.paymentMethod === 'bank-transfer' ? 'Bank Transfer' : 'Cash on Delivery'}
                                    </p>
                                    {orderDetails.paymentMethod === 'bank-transfer' && (
                                        <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm">
                                            <p className="font-medium">Bank Transfer Details:</p>
                                            <p>Bank Name: Your Bank Name</p>
                                            <p>Account Number: 0123456789</p>
                                            <p>Account Name: Your Store Name</p>
                                            <p className="text-xs text-gray-600 mt-1">
                                                Please include your Order ID ({orderDetails.orderId}) in the payment reference
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <h2 className="font-semibold text-gray-800 mb-2">Shipping Address</h2>
                                    <p>{orderDetails.shippingDetails.fullName}</p>
                                    <p>{orderDetails.shippingDetails.phone}</p>
                                    <p>{orderDetails.shippingDetails.email}</p>
                                    <p>{orderDetails.shippingDetails.address}</p>
                                    <p>
                                        {orderDetails.shippingDetails.lga && `${orderDetails.shippingDetails.lga}, `}
                                        {orderDetails.shippingDetails.state}
                                    </p>
                                    {orderDetails.shippingDetails.additionalInfo && <p>{orderDetails.shippingDetails.additionalInfo}</p>}
                                </div>
                            </div>

                            <h2 className="font-semibold text-gray-800 mb-3">Order Items</h2>
                            <div className="border rounded-lg overflow-hidden mb-6">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Product
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Quantity
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Price
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {orderDetails.items.map((item, index) => (
                                            <tr key={index}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        {item.imageUrl && (
                                                            <div className="flex-shrink-0 h-10 w-10 mr-4">
                                                                <Image
                                                                    src={item.imageUrl}
                                                                    alt={item.name}
                                                                    width={40}
                                                                    height={40}
                                                                    className="h-10 w-10 object-cover rounded-md"
                                                                />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                                    {item.quantity}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                                    ₦{(item.price * item.quantity).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50">
                                        <tr>
                                            <td colSpan="2" className="px-6 py-4 text-right font-medium">Subtotal</td>
                                            <td className="px-6 py-4 text-right font-medium">
                                                ₦{(orderDetails.total - shippingFee).toLocaleString()}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan="2" className="px-6 py-4 text-right font-medium">Shipping</td>
                                            <td className="px-6 py-4 text-right font-medium">₦{shippingFee.toLocaleString()}</td>
                                        </tr>
                                        <tr>
                                            <td colSpan="2" className="px-6 py-4 text-right font-medium">Total</td>
                                            <td className="px-6 py-4 text-right font-bold text-lg">₦{orderDetails.total.toLocaleString()}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            <div className="flex justify-between items-center">
                                <button
                                    onClick={() => router.push('/account/orders')}
                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    View All Orders
                                </button>
                                <button
                                    onClick={() => router.push('/')}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <Head>
                <title>Checkout | ToolUp Store</title>
                <meta name="description" content="Complete your purchase" />
            </Head>

            <Header />

            <main className="container mx-auto flex-grow px-4 py-8">
                <h1 className="mb-8 text-center text-3xl font-bold text-gray-800">Complete Your Order</h1>

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

                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <ShippingAddress
                                    formData={formData}
                                    handleInputChange={handleInputChange}
                                    setShippingFee={setShippingFee}
                                    baseShippingFee={baseShippingFee}
                                    setBaseShippingFee={setBaseShippingFee}
                                    paymentMethod={paymentMethod}
                                />
                            </div>

                            {/* Payment Method */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <PaymentMethod
                                    paymentMethod={paymentMethod}
                                    setPaymentMethod={setPaymentMethod}
                                    setPaymentVerified={setPaymentVerified}
                                    setShippingFee={setShippingFee}
                                    baseShippingFee={baseShippingFee}
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

                            {/* Submit Order Button */}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={!formIsValid || isSubmitting}
                                    className={`px-4 py-2 rounded text-white font-medium text-lg ${formIsValid && !isSubmitting
                                        ? 'bg-primary-700 hover:bg-primary-500'
                                        : 'bg-gray-300 cursor-not-allowed'
                                        } transition-colors duration-200 flex items-center`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
        </div>
    );
}