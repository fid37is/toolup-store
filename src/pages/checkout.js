/* eslint-disable react-hooks/exhaustive-deps */
// src/pages/checkout.jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
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
    const [paymentMethod, setPaymentMethod] = useState('pay_on_pickup'); // Default to pay on pickup
    const [paymentVerified, setPaymentVerified] = useState(true); // Default to true for non-bank methods
    const [userId, setUserId] = useState('');
    const [formIsValid, setFormIsValid] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);

    // Form data and shipping calculations
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        address: '',
        city: '',
        state: '',
        lga: '',
        town: '',
        zip: '',
        additionalInfo: ''
    });
    const [shippingFee, setShippingFee] = useState(3500);

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
    }, [formData, paymentVerified, termsAccepted]);

    const validateForm = () => {
        const requiredFields = [
            'email', 
            'firstName', 
            'lastName', 
            'phoneNumber',
            'address',
            'city',
            'state'
        ];
        
        const allFieldsFilled = requiredFields.every(field => 
            formData[field] && formData[field].trim() !== ''
        );
        
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

    const loadAuthAndUserData = () => {
        const authStatus = localStorage.getItem('isAuthenticated');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const guestCheckout = localStorage.getItem('guestCheckout');

        setIsAuthenticated(authStatus === 'true');
        setIsGuestCheckout(guestCheckout === 'true');
        
        // Set userId from the user object
        if (user && user.id) {
            setUserId(user.id);
        } else {
            // Generate a guest user ID if not authenticated
            setUserId(`guest-${Date.now()}`);
        }

        // Pre-fill email if user is authenticated
        if (authStatus === 'true' && user.email) {
            setFormData(prevState => ({
                ...prevState,
                email: user.email,
                firstName: user.name?.split(' ')[0] || '',
                lastName: user.name?.split(' ').slice(1).join(' ') || '',
                phoneNumber: user.phone || ''
            }));
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
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
            setIsLoading(true);

            // Validate required fields
            if (!formData.email || !formData.firstName || !formData.lastName || !formData.phoneNumber) {
                throw new Error('Please fill in all required contact information');
            }

            if (!formData.address || !formData.city || !formData.state) {
                throw new Error('Please fill in all required shipping address fields');
            }
            
            if (!termsAccepted) {
                throw new Error('You must accept the terms and conditions to complete your order');
            }

            // Map order items to ensure proper product reference
            const orderItems = checkoutItems.map(item => ({
                productId: item.productId || item.id,
                name: item.name,
                price: parseFloat(item.price) || 0,
                quantity: parseInt(item.quantity) || 1,
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

                // Redirect to order confirmation page
                router.push(`/order-confirmation?orderId=${data.order.orderId}`);
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
            setIsLoading(false);
        }
    };

    // Redirect if no items to checkout
    useEffect(() => {
        if (!isLoading && checkoutItems.length === 0) {
            notifyEvent('No items to checkout. Redirecting to home page.', 'warning');
            router.push('/');
        }
    }, [isLoading, checkoutItems.length, router]);

    // Render loading screen
    if (isLoading) {
        return <LoadingScreen message="Loading checkout..." />;
    }

    // Don't render if no items (will redirect)
    if (checkoutItems.length === 0) {
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

                    {/* Checkout Form */}
                    <div className="lg:col-span-8">
                        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
                            {/* Contact Information */}
                            <div className="bg-white rounded-xl shadow-lg p-6 transition-shadow duration-300 hover:shadow-xl">
                                <ContactInformation
                                    formData={formData}
                                    handleInputChange={handleInputChange}
                                />
                            </div>

                            {/* Shipping Address */}
                            <div className="bg-white rounded-xl shadow-lg p-6 transition-shadow duration-300 hover:shadow-xl">
                                <ShippingAddress
                                    formData={formData}
                                    handleInputChange={handleInputChange}
                                    setShippingFee={setShippingFee}
                                />
                            </div>

                            {/* Payment Method */}
                            <div className="bg-white rounded-xl shadow-lg p-6 transition-shadow duration-300 hover:shadow-xl">
                                <PaymentMethod
                                    paymentMethod={paymentMethod}
                                    setPaymentMethod={setPaymentMethod}
                                    setPaymentVerified={setPaymentVerified}
                                />
                            </div>
                            
                            {/* Terms and Conditions */}
                            <div className="bg-white rounded-xl shadow-lg p-6 transition-shadow duration-300 hover:shadow-xl">
                                <div className="border-b border-gray-200 pb-4 mb-4">
                                    <h2 className="text-lg font-medium text-gray-900">Terms and Conditions</h2>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Please review and accept our terms before placing your order
                                    </p>
                                </div>
                                
                                <div className="mb-6 text-sm text-gray-700 max-h-40 overflow-y-auto bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <p className="mb-2">By placing this order, you agree to the following terms:</p>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>All personal information provided is accurate and complete</li>
                                        <li>Orders are subject to availability and confirmation of the order price</li>
                                        <li>Delivery times are estimates and not guaranteed</li>
                                        <li>You agree to our <a href="/terms" className="text-blue-600 hover:underline" target="_blank">Terms of Service</a> and <a href="/privacy" className="text-blue-600 hover:underline" target="_blank">Privacy Policy</a></li>
                                        <li>Payment will be processed upon order confirmation</li>
                                        <li>Cancellations may be subject to fee depending on order status</li>
                                    </ul>
                                </div>
                                
                                <div className="flex items-start mb-6">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="terms"
                                            name="terms"
                                            type="checkbox"
                                            required
                                            checked={termsAccepted}
                                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                            onChange={(e) => setTermsAccepted(e.target.checked)}
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="terms" className="font-medium text-gray-700">I accept the terms and conditions</label>
                                        <p className="text-gray-500">This acknowledgment is required to complete your order</p>
                                    </div>
                                </div>
                            </div>

                            {/* Submit button - single version for both mobile and desktop */}
                            <div className="bg-white rounded-xl shadow-lg p-6 transition-shadow duration-300 hover:shadow-xl">
                                <div className="border-b border-gray-200 pb-4 mb-4">
                                    <h2 className="text-lg font-medium text-gray-900">Complete Order</h2>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {formIsValid && paymentVerified 
                                            ? "Your order is ready to be submitted" 
                                            : "Please complete all required fields and accept terms to proceed"}
                                    </p>
                                </div>
                                
                                <button
                                    type="submit"
                                    disabled={!formIsValid || !paymentVerified}
                                    className={`w-full rounded-lg px-6 py-4 text-center font-medium text-white text-lg transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                        formIsValid && paymentVerified
                                            ? 'bg-green-600 hover:bg-green-700 hover:scale-[1.02] focus:ring-green-500'
                                            : 'bg-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    {!formIsValid ? 'Complete Required Fields' : !paymentVerified ? 'Verify Payment Method' : 'Complete Order'}
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