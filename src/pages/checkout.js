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
    const [userId, setUserId] = useState(''); // Added userId state

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
    const total = subtotal + shippingFee; // Removed currency conversion

    // Load checkout items once when component mounts or mode changes
    useEffect(() => {
        if (router.isReady) {
            loadCheckoutItems();
            loadAuthAndUserData();
        }
    }, [router.isReady, mode]);

    const loadCheckoutItems = () => {
        let items = [];

        if (mode === 'direct') {
            // Direct checkout from product page
            const directItem = JSON.parse(localStorage.getItem('directPurchaseItem') || 'null');
            if (directItem) {
                items = [directItem];
            }
        } else {
            // Regular checkout from cart
            const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
            items = cartItems;
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
        setIsLoading(false);
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Show loading state
            setIsLoading(true);

            // Map order items to ensure proper product reference
            const orderItems = checkoutItems.map(item => ({
                productId: item.productId || item.id, // Ensure we have a productId for reference
                name: item.name,
                price: parseFloat(item.price) || 0,
                quantity: parseInt(item.quantity) || 1,
            }));

            // Ensure we have the required fields according to error message
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
                userId: userId, // Add the userId field that was missing
                items: orderItems, // Ensure items array is properly formed
                customer: formData,
                isAuthenticated,
                isGuestCheckout,
                shippingFee,
                paymentMethod, // Already included but mentioned in error
                totalAmount: total, // Use Naira amount directly
                currency: 'NGN',
                orderDate: new Date().toISOString()
            };

            console.log('Submitting order data:', orderData);

            // Call the API to save order to Google Sheets
            const res = await fetch('/api/orders/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            const data = await res.json();
            console.log('API response:', data);

            // Even if there's a database warning, if we have an orderId, consider it a partial success
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

                // Show any warnings if present but proceed with redirect
                if (!res.ok && data.warning) {
                    notifyEvent(data.warning, 'warning');
                } else {
                    notifyEvent('Order placed successfully!', 'success');
                }

                // Redirect to order confirmation page with the order ID
                router.push(`/order-confirmation?orderId=${data.order.orderId}`);
                return;
            }

            // Otherwise handle as a failure
            if (!res.ok) {
                console.error('Order API error:', data);
                throw new Error(data.error || 'Failed to process order');
            }
        } catch (error) {
            console.error('Error processing order:', error);
            notifyEvent(`Order processing error: ${error.message || 'Please try again'}`, 'error');
        } finally {
            // Ensure loading state is turned off
            setIsLoading(false);
        }
    };

    // Render loading, empty cart, or auth flow screens when needed
    if (isLoading) {
        return <LoadingScreen message="Loading checkout..." />;
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
                    <div className="lg:col-span-4 lg:order-2">
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

                        {/* Submit button for mobile */}
                        <div className="mt-6 block lg:hidden">
                            <button
                                type="submit"
                                form="checkout-form"
                                disabled={!paymentVerified}
                                className={`w-full rounded-lg px-6 py-3 text-center font-medium text-white transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${paymentVerified
                                    ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                                    : 'bg-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                Complete Order
                            </button>
                        </div>
                    </div>

                    {/* Checkout Form */}
                    <div className="lg:col-span-8 lg:order-1">
                        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
                            <div className="bg-white rounded-xl shadow-lg p-6 transition-shadow duration-300 hover:shadow-xl">
                                <ContactInformation
                                    formData={formData}
                                    handleInputChange={handleInputChange}
                                />
                            </div>

                            <div className="bg-white rounded-xl shadow-lg p-6 transition-shadow duration-300 hover:shadow-xl">
                                <ShippingAddress
                                    formData={formData}
                                    handleInputChange={handleInputChange}
                                    setShippingFee={setShippingFee}
                                />
                            </div>

                            <div className="bg-white rounded-xl shadow-lg p-6 transition-shadow duration-300 hover:shadow-xl">
                                <PaymentMethod
                                    paymentMethod={paymentMethod}
                                    setPaymentMethod={setPaymentMethod}
                                    setPaymentVerified={setPaymentVerified}
                                />
                            </div>

                            {/* Submit button for desktop */}
                            <div className="hidden lg:block">
                                <button
                                    type="submit"
                                    disabled={!paymentVerified}
                                    className={`w-full rounded-lg px-6 py-4 text-center font-medium text-white text-lg transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-offset-2 ${paymentVerified
                                        ? 'bg-green-600 hover:bg-green-700 hover:scale-[1.02] focus:ring-green-500'
                                        : 'bg-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    Complete Order
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