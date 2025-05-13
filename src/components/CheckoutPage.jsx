// src/pages/checkout.jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';

const CheckoutPage = ({
    cartItems = [],
    singleItem = null,
    userProfile = {
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
    }
}) => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        paymentMethod: 'credit_card',
        cardNumber: '',
        cardExpiry: '',
        cardCvc: '',
        useProfileAddress: true
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [items, setItems] = useState([]);
    const [shippingFee, setShippingFee] = useState(0);
    const [bankTransferDetails, setBankTransferDetails] = useState({
        accountNumber: '',
        bankName: '',
        accountName: '',
        reference: '',
        expiresAt: null
    });
    const [bankTransferGenerated, setBankTransferGenerated] = useState(false);

    // Load user profile data and items on mount
    useEffect(() => {
        // Get items from localStorage if not provided directly
        const fetchCartItems = () => {
            if (singleItem) {
                return [singleItem];
            } else if (cartItems && cartItems.length > 0) {
                return cartItems;
            } else {
                try {
                    const storedCart = localStorage.getItem('cart');
                    return storedCart ? JSON.parse(storedCart) : [];
                } catch (error) {
                    console.error('Error fetching cart from localStorage:', error);
                    return [];
                }
            }
        };

        const itemsToSet = fetchCartItems();
        setItems(itemsToSet);

        // Load profile data
        if (userProfile) {
            setFormData(prev => ({
                ...prev,
                fullName: userProfile.fullName || prev.fullName,
                email: userProfile.email || prev.email,
                phone: userProfile.phone || prev.phone,
                address: userProfile.address || prev.address,
                city: userProfile.city || prev.city,
                state: userProfile.state || prev.state,
                zipCode: userProfile.zipCode || prev.zipCode,
            }));
        }
    }, [singleItem, cartItems, userProfile]);

    // Calculate shipping fee when address or useProfileAddress changes
    useEffect(() => {
        // Get the address data from the right source
        const addressData = formData.useProfileAddress ? userProfile : formData;
        
        // Calculate shipping fee based on state
        const businessState = "Delta"; // Business is in Asaba, Delta State
        let fee = 3500; // Default fee (₦3,500 outside business state)
        
        // Check if customer state matches business state
        if (addressData.state && addressData.state.trim().toLowerCase() === businessState.toLowerCase()) {
            fee = 1500; // ₦1,500 within business state
        }
        
        setShippingFee(fee);
    }, [formData.useProfileAddress, formData.state, userProfile.state, formData, userProfile]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox') {
            setFormData({
                ...formData,
                [name]: checked
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        const addressToCheck = formData.useProfileAddress ? userProfile : formData;

        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';

        if (!addressToCheck.address?.trim()) newErrors.address = 'Address is required';
        if (!addressToCheck.city?.trim()) newErrors.city = 'City is required';
        if (!addressToCheck.state?.trim()) newErrors.state = 'State is required';
        if (!addressToCheck.zipCode?.trim()) newErrors.zipCode = 'Zip code is required';

        if (formData.paymentMethod === 'credit_card') {
            if (!formData.cardNumber.trim()) newErrors.cardNumber = 'Card number is required';
            if (!formData.cardExpiry.trim()) newErrors.cardExpiry = 'Expiry date is required';
            if (!formData.cardCvc.trim()) newErrors.cardCvc = 'CVC is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const generateBankTransferDetails = async () => {
        setIsSubmitting(true);
        
        try {
            // This would be an API call to your backend
            // Simulate API call for generating temporary account details
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const now = new Date();
            const expiryTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
            
            // Generate a unique reference for this transaction
            const reference = `TRF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            
            setBankTransferDetails({
                accountNumber: '0123456789', // This would come from your API
                bankName: 'Your Bank Name', // This would come from your API
                accountName: 'Your Company Name', // This would come from your API
                reference: reference,
                expiresAt: expiryTime
            });
            
            setBankTransferGenerated(true);
        } catch (error) {
            console.error('Error generating bank transfer details:', error);
            alert('There was an error generating bank transfer details. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        // For bank transfer, we need to generate transfer details first
        if (formData.paymentMethod === 'bank_transfer' && !bankTransferGenerated) {
            return generateBankTransferDetails();
        }

        setIsSubmitting(true);

        try {
            // Create order payload

            // Simulate API call for order processing
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Handle payment method specific flows
            if (formData.paymentMethod === 'bank_transfer') {
                // For bank transfer, we'd redirect to a waiting-for-payment page
                router.push(`/payment-pending?reference=${bankTransferDetails.reference}`);
            } else if (formData.paymentMethod === 'credit_card') {
                // In a real app, you'd process the payment through a secure payment gateway
                // and only redirect on success
                router.push('/order-confirmation');
            } else {
                // Cash on delivery
                router.push('/order-confirmation');
            }
            
            // Clear cart after successful order
            localStorage.removeItem('cart');
            
        } catch (error) {
            console.error('Checkout error:', error);
            alert('There was an error processing your order. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const calculateSubtotal = () => {
        return items.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
    };

    const calculateTotal = () => {
        const subtotal = parseFloat(calculateSubtotal());
        return (subtotal + shippingFee).toFixed(2);
    };

    // Format currency as Naira
    const formatNaira = (amount) => {
        return `₦${Number(amount).toLocaleString('en-NG')}`;
    };

    // Format date for display
    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-NG', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleGoBack = () => {
        router.back();
    };

    return (
        <div className="flex min-h-screen flex-col">
            <Head>
                <title>Checkout</title>
                <meta name="description" content="Complete your purchase" />
            </Head>
            
            <Header />
            
            <main className="container mx-auto flex-grow py-6 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <button 
                            onClick={handleGoBack}
                            className="inline-flex items-center text-blue-600 hover:underline"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                            Back
                        </button>
                        <h1 className="text-2xl font-bold">Checkout</h1>
                        <div className="w-20"></div> {/* Empty div for flex spacing */}
                    </div>
                    
                    {items.length === 0 ? (
                        <div className="bg-white p-8 rounded-lg shadow text-center">
                            <p className="text-lg mb-4">Your cart is empty</p>
                            <button 
                                onClick={() => router.push('/products')}
                                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column: Customer & Order Details */}
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                {/* Order Summary */}
                                <div className="p-6 border-b border-gray-200">
                                    <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                                    <div className="max-h-48 overflow-y-auto mb-4">
                                        <ul className="divide-y divide-gray-200">
                                            {items.map((item) => (
                                                <li key={item.productId} className="py-3 flex justify-between">
                                                    <div>
                                                        <p className="font-medium">{item.name}</p>
                                                        <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                                                    </div>
                                                    <p className="font-medium">{formatNaira(item.price * item.quantity)}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="pt-3">
                                        <div className="flex justify-between mb-2">
                                            <p>Subtotal</p>
                                            <p>{formatNaira(calculateSubtotal())}</p>
                                        </div>
                                        <div className="flex justify-between mb-2">
                                            <p>Shipping</p>
                                            <p>{formatNaira(shippingFee)}</p>
                                        </div>
                                        <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t border-gray-200">
                                            <p>Total</p>
                                            <p>{formatNaira(calculateTotal())}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Customer Information */}
                                <div className="p-6 border-b border-gray-200">
                                    <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                            <input
                                                type="text"
                                                name="fullName"
                                                id="fullName"
                                                value={formData.fullName}
                                                onChange={handleInputChange}
                                                className={`w-full border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-md p-2`}
                                            />
                                            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                                        </div>
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                id="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className={`w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md p-2`}
                                            />
                                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                        </div>
                                        <div className="md:col-span-2">
                                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                id="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className={`w-full border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md p-2`}
                                            />
                                            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Shipping Address */}
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-semibold">Shipping Address</h2>
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="useProfileAddress"
                                                name="useProfileAddress"
                                                checked={formData.useProfileAddress}
                                                onChange={handleInputChange}
                                                className="h-4 w-4 text-blue-600"
                                            />
                                            <label htmlFor="useProfileAddress" className="ml-2 text-sm font-medium text-gray-700">
                                                Use Profile Address
                                            </label>
                                        </div>
                                    </div>

                                    {formData.useProfileAddress ? (
                                        <div className="bg-gray-50 p-4 rounded-md mb-4">
                                            <p className="font-medium">{userProfile.fullName}</p>
                                            <p>{userProfile.address}</p>
                                            <p>{userProfile.city}, {userProfile.state} {userProfile.zipCode}</p>
                                            <p>{userProfile.phone}</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    id="address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    className={`w-full border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-md p-2`}
                                                />
                                                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                                            </div>
                                            <div>
                                                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    id="city"
                                                    value={formData.city}
                                                    onChange={handleInputChange}
                                                    className={`w-full border ${errors.city ? 'border-red-500' : 'border-gray-300'} rounded-md p-2`}
                                                />
                                                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                                            </div>
                                            <div>
                                                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                                <input
                                                    type="text"
                                                    name="state"
                                                    id="state"
                                                    value={formData.state}
                                                    onChange={handleInputChange}
                                                    className={`w-full border ${errors.state ? 'border-red-500' : 'border-gray-300'} rounded-md p-2`}
                                                />
                                                {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                                            </div>
                                            <div>
                                                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                                                <input
                                                    type="text"
                                                    name="zipCode"
                                                    id="zipCode"
                                                    value={formData.zipCode}
                                                    onChange={handleInputChange}
                                                    className={`w-full border ${errors.zipCode ? 'border-red-500' : 'border-gray-300'} rounded-md p-2`}
                                                />
                                                {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Column: Payment Methods */}
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                <div className="p-6 border-b border-gray-200">
                                    <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                                    <div className="space-y-4">
                                        {/* Credit Card Option */}
                                        <div className="bg-gray-50 p-4 rounded-md">
                                            <div className="flex items-center mb-2">
                                                <input
                                                    type="radio"
                                                    id="credit_card"
                                                    name="paymentMethod"
                                                    value="credit_card"
                                                    checked={formData.paymentMethod === 'credit_card'}
                                                    onChange={handleInputChange}
                                                    className="h-4 w-4 text-blue-600"
                                                />
                                                <label htmlFor="credit_card" className="ml-2 font-medium text-gray-700">Credit Card</label>
                                            </div>

                                            {formData.paymentMethod === 'credit_card' && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                                    <div className="md:col-span-2">
                                                        <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                                                        <input
                                                            type="text"
                                                            name="cardNumber"
                                                            id="cardNumber"
                                                            placeholder="XXXX XXXX XXXX XXXX"
                                                            value={formData.cardNumber}
                                                            onChange={handleInputChange}
                                                            className={`w-full border ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'} rounded-md p-2`}
                                                        />
                                                        {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
                                                    </div>
                                                    <div>
                                                        <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                                                        <input
                                                            type="text"
                                                            name="cardExpiry"
                                                            id="cardExpiry"
                                                            placeholder="MM/YY"
                                                            value={formData.cardExpiry}
                                                            onChange={handleInputChange}
                                                            className={`w-full border ${errors.cardExpiry ? 'border-red-500' : 'border-gray-300'} rounded-md p-2`}
                                                        />
                                                        {errors.cardExpiry && <p className="text-red-500 text-xs mt-1">{errors.cardExpiry}</p>}
                                                    </div>
                                                    <div>
                                                        <label htmlFor="cardCvc" className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                                                        <input
                                                            type="text"
                                                            name="cardCvc"
                                                            id="cardCvc"
                                                            placeholder="CVC"
                                                            value={formData.cardCvc}
                                                            onChange={handleInputChange}
                                                            className={`w-full border ${errors.cardCvc ? 'border-red-500' : 'border-gray-300'} rounded-md p-2`}
                                                        />
                                                        {errors.cardCvc && <p className="text-red-500 text-xs mt-1">{errors.cardCvc}</p>}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Bank Transfer Option */}
                                        <div className="bg-gray-50 p-4 rounded-md">
                                            <div className="flex items-center mb-2">
                                                <input
                                                    type="radio"
                                                    id="bank_transfer"
                                                    name="paymentMethod"
                                                    value="bank_transfer"
                                                    checked={formData.paymentMethod === 'bank_transfer'}
                                                    onChange={handleInputChange}
                                                    className="h-4 w-4 text-blue-600"
                                                />
                                                <label htmlFor="bank_transfer" className="ml-2 font-medium text-gray-700">Bank Transfer</label>
                                            </div>

                                            {formData.paymentMethod === 'bank_transfer' && (
                                                <div className="mt-3">
                                                    {bankTransferGenerated ? (
                                                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
                                                            <h3 className="font-medium text-blue-800 mb-2">Transfer Details</h3>
                                                            <p className="text-sm mb-2">Please transfer the exact amount to the following account:</p>
                                                            
                                                            <div className="space-y-2 mb-4">
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">Bank Name:</span>
                                                                    <span className="font-medium">{bankTransferDetails.bankName}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">Account Number:</span>
                                                                    <span className="font-medium">{bankTransferDetails.accountNumber}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">Account Name:</span>
                                                                    <span className="font-medium">{bankTransferDetails.accountName}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">Amount:</span>
                                                                    <span className="font-medium">{formatNaira(calculateTotal())}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">Reference:</span>
                                                                    <span className="font-medium">{bankTransferDetails.reference}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">Expires:</span>
                                                                    <span className="font-medium">
                                                                        {bankTransferDetails.expiresAt && formatDate(bankTransferDetails.expiresAt)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="bg-yellow-50 p-3 rounded border border-yellow-200 text-sm text-yellow-800">
                                                                <p>
                                                                    <strong>Important:</strong> Please include the reference number in your transfer
                                                                    description. Your order will be processed once payment is confirmed.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-gray-600">
                                                            Select this option to receive bank transfer details. You&apos;ll need to make a transfer to the
                                                            provided account within 24 hours.
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Cash on Delivery Option */}
                                        <div className="bg-gray-50 p-4 rounded-md">
                                            <div className="flex items-center">
                                                <input
                                                    type="radio"
                                                    id="cash_on_delivery"
                                                    name="paymentMethod"
                                                    value="cash_on_delivery"
                                                    checked={formData.paymentMethod === 'cash_on_delivery'}
                                                    onChange={handleInputChange}
                                                    className="h-4 w-4 text-blue-600"
                                                />
                                                <label htmlFor="cash_on_delivery" className="ml-2 font-medium text-gray-700">
                                                    Cash on Delivery
                                                </label>
                                            </div>
                                            
                                            {formData.paymentMethod === 'cash_on_delivery' && (
                                                <p className="text-sm text-gray-600 mt-3">
                                                    Pay with cash when your order is delivered. Please have the exact amount ready.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="p-6">
                                    <button
                                        type="submit"
                                        onClick={handleSubmit}
                                        disabled={isSubmitting || items.length === 0}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-md flex items-center justify-center disabled:bg-gray-400"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                {formData.paymentMethod === 'bank_transfer' && !bankTransferGenerated 
                                                    ? 'Generating Bank Details...'
                                                    : 'Processing Order...'}
                                            </>
                                        ) : formData.paymentMethod === 'bank_transfer' && !bankTransferGenerated ? (
                                            'Generate Bank Transfer Details'
                                        ) : (
                                            `Complete Order - ${formatNaira(calculateTotal())}`
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            
            <Footer />
        </div>
    );
};

export default CheckoutPage;