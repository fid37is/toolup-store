/* eslint-disable react-hooks/exhaustive-deps */
// src/pages/checkout.jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CheckoutAuthFlow from '../components/CheckoutAuthFlow';
import OrderSummary from '../components/checkout/OrderSummary';
import ContactInformation from '../components/checkout/ContactInformation';
import ShippingAddress from '../components/checkout/ShippingAddress';
import PaymentMethod from '../components/checkout/PaymentMethod';
import LoadingScreen from '../components/LoadingScreen';
import EmptyCart from '../components/checkout/EmptyCart';

export default function Checkout() {
    const router = useRouter();
    const { mode } = router.query;

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isGuestCheckout, setIsGuestCheckout] = useState(false);
    const [checkoutItems, setCheckoutItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState('card');
    
    // Dollar to Naira conversion rate
    const nairaRate = 800;

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
    const tax = 0; // No tax as per requirement
    const total = subtotal + tax + shippingFee;
    const totalInNaira = (total * nairaRate).toFixed(2);


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
            // Map order items to ensure proper product reference
            const orderItems = checkoutItems.map(item => ({
                productId: item.productId || item.id, // Ensure we have a productId for reference
                name: item.name,
                price: parseFloat(item.price) || 0,
                quantity: parseInt(item.quantity) || 1,
                // We don't include imageUrl directly - we'll use productId to link back to products
            }));

            const orderData = {
                items: orderItems,
                customer: formData,
                isAuthenticated,
                isGuestCheckout,
                shippingFee,
                paymentMethod,
                totalAmount: parseInt(totalInNaira),
                currency: 'NGN',
                orderDate: new Date().toISOString()
            };

            // Call the API to save order to Google Sheets
            const res = await fetch('/api/orders/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Order failed');

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

            // Redirect to order confirmation page with the order ID
            router.push(`/order-confirmation?orderId=${data.order.orderId}`);
        } catch (error) {
            console.error('Error processing order:', error);
            alert('Failed to process your order. Please try again.');
        }
    };

    // Render loading, empty cart, or auth flow screens when needed
    if (isLoading) {
        return <LoadingScreen message="Loading checkout..." />;
    }

    if (checkoutItems.length === 0) {
        return <EmptyCart />;
    }

    if (!isAuthenticated && !isGuestCheckout) {
        return <CheckoutAuthFlow />;
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
                        <OrderSummary 
                            checkoutItems={checkoutItems}
                            subtotal={subtotal}
                            shippingFee={shippingFee}
                            total={total}
                            totalInNaira={totalInNaira}
                            nairaRate={nairaRate}
                            formData={formData}
                            isGuestCheckout={isGuestCheckout}
                        />
                    </div>

                    {/* Checkout Form */}
                    <div className="lg:col-span-8 lg:order-1">
                        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
                            <ContactInformation 
                                formData={formData} 
                                handleInputChange={handleInputChange} 
                            />
                            
                            <ShippingAddress 
                                formData={formData} 
                                handleInputChange={handleInputChange}
                                setShippingFee={setShippingFee}
                            />
                            
                            <PaymentMethod 
                                paymentMethod={paymentMethod}
                                setPaymentMethod={setPaymentMethod}
                            />

                            {/* Submit button for desktop */}
                            <div className="hidden lg:block">
                                <button
                                    type="submit"
                                    className="w-full rounded-lg bg-green-600 px-6 py-3 text-center font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
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