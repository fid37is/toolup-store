// src/pages/checkout.jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CheckoutAuthFlow from '../components/CheckoutAuthFlow';
import Image from 'next/image';
import {
    fetchAllStates,
    fetchLGAs,
    fetchTowns,
    calculateShippingFee,
    filterTownsByLGA
} from '../utils/nigeriaLocations';

export default function Checkout() {
    const router = useRouter();
    const { mode } = router.query;

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isGuestCheckout, setIsGuestCheckout] = useState(false);
    const [checkoutItems, setCheckoutItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Location data states
    const [states, setStates] = useState([]);
    const [lgas, setLgas] = useState([]);
    const [towns, setTowns] = useState([]);
    const [loading, setLoading] = useState({
        states: false,
        lgas: false,
        towns: false
    });

    // Payment method state
    const [paymentMethod, setPaymentMethod] = useState('card');

    // User information form fields
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

    // Shipping fee
    const [shippingFee, setShippingFee] = useState(3500);

    useEffect(() => {
        // Check authentication status
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

        // Load checkout items based on the mode
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

        setCheckoutItems(items);
        setIsLoading(false);

        // Fetch Nigerian states on component mount
        loadStates();
    }, [mode]);

    // Load all Nigerian states
    const loadStates = async () => {
        setLoading(prev => ({ ...prev, states: true }));
        const statesData = await fetchAllStates();
        setStates(statesData);
        setLoading(prev => ({ ...prev, states: false }));
    };

    // Load LGAs when state changes
    useEffect(() => {
        const loadLGAs = async () => {
            if (!formData.state) {
                setLgas([]);
                return;
            }

            setLoading(prev => ({ ...prev, lgas: true }));
            const lgasData = await fetchLGAs(formData.state);
            setLgas(lgasData);
            setLoading(prev => ({ ...prev, lgas: false }));

            // Clear selected LGA when state changes
            setFormData(prev => ({ ...prev, lga: '', town: '' }));
        };

        loadLGAs();
    }, [formData.state]);

    // Load towns when LGA changes
    useEffect(() => {
        const loadTowns = async () => {
            if (!formData.state || !formData.lga) {
                setTowns([]);
                return;
            }

            setLoading(prev => ({ ...prev, towns: true }));

            // First get all towns for the state
            const stateTowns = await fetchTowns(formData.state);

            // Then filter them by LGA
            const filteredTowns = filterTownsByLGA(stateTowns, formData.lga);

            setTowns(filteredTowns);
            setLoading(prev => ({ ...prev, towns: false }));

            // Clear selected town when LGA changes
            setFormData(prev => ({ ...prev, town: '' }));
        };

        loadTowns();
    }, [formData.state, formData.lga]);

    // Update shipping fee when location changes
    useEffect(() => {
        const fee = calculateShippingFee({
            state: formData.state,
            lga: formData.lga,
            town: formData.town
        });
        setShippingFee(fee);
    }, [formData.state, formData.lga, formData.town]);

    // Calculate order summary
    const subtotal = checkoutItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    // No tax as per requirement
    const tax = 0;
    const total = subtotal + tax + shippingFee;

    // Dollar to Naira conversion rate (hypothetical)
    const nairaRate = 800;
    const totalInNaira = (total * nairaRate).toFixed(2);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handlePaymentMethodChange = (method) => {
        setPaymentMethod(method);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const orderData = {
                items: checkoutItems,
                customer: formData,
                isAuthenticated,
                isGuestCheckout,
                shippingFee,
                paymentMethod,
                totalAmount: parseInt(totalInNaira),
                currency: 'NGN'
            };

            // 👉 Call your API to save order to Google Sheets
            const res = await fetch('/api/orders/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Order failed');

            const { orderId } = data;

            // ✅ Clear checkout data
            if (mode === 'direct') {
                localStorage.removeItem('directPurchaseItem');
            } else {
                localStorage.removeItem('cart');
                window.dispatchEvent(new CustomEvent('cartUpdated'));
            }

            if (isGuestCheckout) {
                localStorage.removeItem('guestCheckout');
            }

            // ✅ Redirect to dynamic order page with ID
            router.push(`/orders/${orderId}`);
        } catch (error) {
            console.error('Error processing order:', error);
            alert('Failed to process your order. Please try again.');
        }
    };


    // If we're still determining authentication status, show loading
    if (isLoading) {
        return (
            <div className="flex min-h-screen flex-col">
                <Header />
                <div className="container mx-auto flex flex-grow items-center justify-center py-16">
                    <div className="text-center">
                        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-accent-600"></div>
                        <p className="text-gray-600">Loading checkout...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // If no items in checkout, show empty state
    if (checkoutItems.length === 0) {
        return (
            <div className="flex min-h-screen flex-col">
                <Header />
                <div className="container mx-auto my-16 px-4 flex-grow">
                    <div className="rounded-lg bg-gray-50 p-6 text-center">
                        <h1 className="mb-4 text-2xl font-bold text-gray-700">Your Cart is Empty</h1>
                        <p className="mb-6 text-gray-600">
                            You don&apos;t have any items in your cart to checkout.
                        </p>
                        <button
                            onClick={() => router.push('/')}
                            className="rounded-lg bg-primary-700 px-6 py-2 text-white hover:bg-primary-500"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // If user is not authenticated and not in guest checkout mode, show auth flow
    if (!isAuthenticated && !isGuestCheckout) {
        return <CheckoutAuthFlow />;
    }

    // Function to get state name from state code
    const getStateName = (stateCode) => {
        const state = states.find(s => s.code === stateCode);
        return state ? state.name : '';
    };

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
                        <div className="sticky top-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 border-b pb-2 text-xl font-semibold text-gray-800">Order Summary</h2>

                            <div className="max-h-80 overflow-y-auto space-y-4 mb-4">
                                {checkoutItems.map((item, index) => (
                                    <div key={index} className="flex items-center border-b border-gray-100 pb-4">
                                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-100">
                                            {item.imageUrl && (
                                                <Image
                                                    src={item.imageUrl}
                                                    alt={item.name}
                                                    className="h-full w-full object-contain"
                                                    width={25}
                                                    height={25}
                                                />
                                            )}
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <h3 className="text-base font-medium text-gray-900">{item.name}</h3>
                                            <p className="mt-1 text-sm text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="text-right font-medium text-gray-900">
                                            ₦{(item.price * item.quantity * nairaRate).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 border-b border-gray-200 pb-4">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <p>Subtotal</p>
                                    <p>₦{(subtotal * nairaRate).toLocaleString()}</p>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <p>Shipping to {formData.state ? getStateName(formData.state) : 'Nigeria'}</p>
                                    <div className="text-right">
                                        <p>₦{shippingFee.toLocaleString()}</p>
                                        <p className="text-xs text-gray-500">
                                            {formData.state && formData.lga && formData.town
                                                ? `${formData.town}, ${formData.lga}`
                                                : 'Standard rate'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 flex justify-between items-end">
                                <div>
                                    <p className="text-base font-medium text-gray-900">Total</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-gray-900">₦{parseInt(totalInNaira).toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Order button for mobile */}
                            <div className="mt-6 block lg:hidden">
                                <button
                                    type="submit"
                                    form="checkout-form"
                                    className="w-full rounded-lg bg-green-600 px-6 py-3 text-center font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                >
                                    Complete Order
                                </button>
                            </div>
                        </div>

                        {/* Show account creation prompt for guest users */}
                        {isGuestCheckout && (
                            <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-sm">
                                <h3 className="text-sm font-medium text-blue-800">Create an account for faster checkout</h3>
                                <p className="mt-1 text-xs text-blue-600">
                                    Save your info for next time and easily track your orders.
                                </p>
                                <button
                                    onClick={() => router.push('/auth?redirect=checkout')}
                                    className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                    Create account →
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Checkout Form */}
                    <div className="lg:col-span-8 lg:order-1">
                        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
                            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                                <h2 className="mb-4 pb-2 border-b text-xl font-semibold text-gray-800">Contact Information</h2>

                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            placeholder="your.email@example.com"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            id="firstName"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            required
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            id="lastName"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            required
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            id="phoneNumber"
                                            name="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={handleInputChange}
                                            required
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            placeholder="+234"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            For delivery coordination and order updates
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                                <h2 className="mb-4 pb-2 border-b text-xl font-semibold text-gray-800">Shipping Address</h2>

                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-6">
                                    {/* Nigerian State Selection */}
                                    <div className="sm:col-span-3">
                                        <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                                            State <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                id="state"
                                                name="state"
                                                value={formData.state}
                                                onChange={handleInputChange}
                                                required
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                disabled={loading.states}
                                            >
                                                <option value="">Select a state</option>
                                                {states.map((state) => (
                                                    <option key={state.code} value={state.code}>
                                                        {state.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {loading.states && (
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600"></div>
                                                </div>
                                            )}
                                        </div>
                                        {formData.state === 'DE' && (
                                            <p className="mt-1 text-xs text-green-600">
                                                You&apos;re eligible for reduced shipping in Delta State!
                                            </p>
                                        )}
                                    </div>

                                    {/* LGA Selection */}
                                    <div className="sm:col-span-3">
                                        <label htmlFor="lga" className="block text-sm font-medium text-gray-700">
                                            Local Government Area <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                id="lga"
                                                name="lga"
                                                value={formData.lga}
                                                onChange={handleInputChange}
                                                required
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                disabled={!formData.state || loading.lgas}
                                            >
                                                <option value="">Select an LGA</option>
                                                {lgas.map((lga) => (
                                                    <option key={lga.name} value={lga.name}>
                                                        {lga.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {loading.lgas && (
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600"></div>
                                                </div>
                                            )}
                                        </div>
                                        {formData.state === 'DE' && formData.lga && ['Warri South', 'Uvwie', 'Sapele', 'Udu'].includes(formData.lga) && (
                                            <p className="mt-1 text-xs text-green-600">
                                                Special shipping rates apply in this area!
                                            </p>
                                        )}
                                    </div>

                                    {/* Town Selection */}
                                    <div className="sm:col-span-3">
                                        <label htmlFor="town" className="block text-sm font-medium text-gray-700">
                                            Town/City <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                id="town"
                                                name="town"
                                                value={formData.town}
                                                onChange={handleInputChange}
                                                required
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                disabled={!formData.lga || loading.towns}
                                            >
                                                <option value="">Select a town</option>
                                                {towns.map((town) => (
                                                    <option key={town.name} value={town.name}>
                                                        {town.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {loading.towns && (
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600"></div>
                                                </div>
                                            )}
                                        </div>
                                        {formData.town && (formData.town === 'Warri' || formData.town === 'Effurun') && (
                                            <p className="mt-1 text-xs text-green-600">
                                                Lowest shipping rate available here!
                                            </p>
                                        )}
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label htmlFor="zip" className="block text-sm font-medium text-gray-700">
                                            ZIP / Postal Code <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="zip"
                                            name="zip"
                                            value={formData.zip}
                                            onChange={handleInputChange}
                                            required
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        />
                                    </div>

                                    <div className="sm:col-span-6">
                                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                            Street Address <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            required
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            placeholder="House number, street name, landmark"
                                        />
                                    </div>

                                    <div className="sm:col-span-6">
                                        <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700">
                                            Additional Information (Optional)
                                        </label>
                                        <textarea
                                            id="additionalInfo"
                                            name="additionalInfo"
                                            value={formData.additionalInfo}
                                            onChange={handleInputChange}
                                            rows="3"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            placeholder="Delivery instructions, landmarks, or other helpful information"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Methods Section */}
                            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                                <h2 className="mb-4 pb-2 border-b text-xl font-semibold text-gray-800">Payment Method</h2>
                                <p className="text-sm text-gray-600 mb-4">Select your preferred payment method. All transactions are in Nigerian Naira (₦).</p>

                                <div className="space-y-4">
                                    {/* Card Payment Option */}
                                    <div className="relative flex items-start">
                                        <div className="flex h-5 items-center">
                                            <input
                                                id="payment-card"
                                                name="payment-method"
                                                type="radio"
                                                checked={paymentMethod === 'card'}
                                                onChange={() => handlePaymentMethodChange('card')}
                                                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="ml-3 text-sm">
                                            <label htmlFor="payment-card" className="font-medium text-gray-700">Debit/Credit Card</label>
                                            <p className="text-gray-500">Pay securely with your bank card</p>

                                            {paymentMethod === 'card' && (
                                                <div className="mt-3 border-t border-gray-100 pt-3">
                                                    <div className="flex flex-wrap gap-2 mb-2">
                                                        <div className="p-1 border border-gray-200 rounded">
                                                            <div className="h-6 w-10 bg-gray-100 rounded flex items-center justify-center text-xs font-medium text-gray-800">VISA</div>
                                                        </div>
                                                        <div className="p-1 border border-gray-200 rounded">
                                                            <div className="h-6 w-10 bg-gray-100 rounded flex items-center justify-center text-xs font-medium text-gray-800">MC</div>
                                                        </div>
                                                        <div className="p-1 border border-gray-200 rounded">
                                                            <div className="h-6 w-10 bg-gray-100 rounded flex items-center justify-center text-xs font-medium text-gray-800">Verve</div>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-gray-500">
                                                        Secure payment processing by Paystack
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Bank Transfer Option */}
                                    <div className="relative flex items-start">
                                        <div className="flex h-5 items-center">
                                            <input
                                                id="payment-transfer"
                                                name="payment-method"
                                                type="radio"
                                                checked={paymentMethod === 'bank_transfer'}
                                                onChange={() => handlePaymentMethodChange('bank_transfer')}
                                                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="ml-3 text-sm">
                                            <label htmlFor="payment-transfer" className="font-medium text-gray-700">Bank Transfer</label>
                                            <p className="text-gray-500">Pay by transferring funds to our account</p>

                                            {paymentMethod === 'bank_transfer' && (
                                                <div className="mt-3 border-t border-gray-100 pt-3">
                                                    <div className="bg-blue-50 p-3 rounded">
                                                        <p className="text-sm text-gray-700 mb-1">Bank: <span className="font-medium">First Bank of Nigeria</span></p>
                                                        <p className="text-sm text-gray-700 mb-1">Account Name: <span className="font-medium">ToolUp Enterprises Ltd</span></p>
                                                        <p className="text-sm text-gray-700">Account Number: <span className="font-medium">30XXXXXXXX</span></p>
                                                    </div>
                                                    <p className="mt-2 text-xs text-gray-500">
                                                        Please include your order number as reference when making the transfer.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Cash on Delivery Option */}
                                    <div className="relative flex items-start">
                                        <div className="flex h-5 items-center">
                                            <input
                                                id="payment-cod"
                                                name="payment-method"
                                                type="radio"
                                                checked={paymentMethod === 'cod'}
                                                onChange={() => handlePaymentMethodChange('cod')}
                                                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="ml-3 text-sm">
                                            <label htmlFor="payment-cod" className="font-medium text-gray-700">Cash on Delivery</label>
                                            <p className="text-gray-500">Pay with cash when your order is delivered</p>

                                            {paymentMethod === 'cod' && (
                                                <div className="mt-3 border-t border-gray-100 pt-3">
                                                    <p className="text-xs text-gray-600">
                                                        Please ensure you have the exact amount ready at delivery time.
                                                        A small additional fee may apply for Cash on Delivery orders.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Review & Terms */}
                            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                                <h2 className="mb-4 text-xl font-semibold text-gray-800">Review Order</h2>

                                <div className="mb-6">
                                    <div className="flex items-start">
                                        <div className="flex h-5 items-center">
                                            <input
                                                id="terms"
                                                name="terms"
                                                type="checkbox"
                                                required
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="ml-3 text-sm">
                                            <label htmlFor="terms" className="font-medium text-gray-700">
                                                I agree to the Terms and Conditions and Privacy Policy
                                            </label>
                                            <p className="text-gray-500">
                                                By placing this order, you agree to our terms and conditions and acknowledge our privacy policy.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Order button for desktop */}
                                <div className="hidden lg:block">
                                    <button
                                        type="submit"
                                        className="w-full rounded-lg bg-green-600 px-6 py-3 text-center font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                    >
                                        Complete Order
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}