// src/components/CheckoutModal.jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const CheckoutModal = ({ isOpen, onClose, cartItems = [], singleItem = null }) => {
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
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [items, setItems] = useState([]);

    useEffect(() => {
        if (singleItem && (items.length !== 1 || items[0]?.productId !== singleItem.productId)) {
            setItems([singleItem]);
        } else if (!singleItem && JSON.stringify(items) !== JSON.stringify(cartItems)) {
            setItems(cartItems);
        }
    }, [singleItem, cartItems, items]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.state.trim()) newErrors.state = 'State is required';
        if (!formData.zipCode.trim()) newErrors.zipCode = 'Zip code is required';

        if (formData.paymentMethod === 'credit_card') {
            if (!formData.cardNumber.trim()) newErrors.cardNumber = 'Card number is required';
            if (!formData.cardExpiry.trim()) newErrors.cardExpiry = 'Expiry date is required';
            if (!formData.cardCvc.trim()) newErrors.cardCvc = 'CVC is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            // Simulate API call for order processing
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Success - would normally handle order confirmation here
            alert('Order placed successfully! Thank you for your purchase.');
            onClose();
            router.push('/order-confirmation');
        } catch (error) {
            console.error('Checkout error:', error);
            alert('There was an error processing your order. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const calculateTotal = () => {
        return items.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
    };

    // If the modal is not open, don't render anything
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-auto">
            <div className="bg-white w-full max-w-3xl rounded-lg shadow-xl mx-4 my-8 max-h-[90vh] overflow-y-auto">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Checkout</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                        aria-label="Close checkout"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6">
                    {items.length === 0 ? (
                        <div className="text-center py-8">
                            <p>No items to checkout</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            {/* Order Summary */}
                            <div className="mb-8">
                                <h3 className="text-lg font-medium mb-4">Order Summary</h3>
                                <div className="bg-gray-50 p-4 rounded-md">
                                    <ul className="divide-y divide-gray-200">
                                        {items.map((item) => (
                                            <li key={item.productId} className="py-4 flex justify-between">
                                                <div>
                                                    <p className="font-medium">{item.name}</p>
                                                    <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                                                </div>
                                                <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between font-bold">
                                        <p>Total</p>
                                        <p>${calculateTotal()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Information */}
                            <div className="mb-8">
                                <h3 className="text-lg font-medium mb-4">Customer Information</h3>
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
                                    <div>
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
                            <div className="mb-8">
                                <h3 className="text-lg font-medium mb-4">Shipping Address</h3>
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
                                    <div className="grid grid-cols-2 gap-4">
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
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="mb-8">
                                <h3 className="text-lg font-medium mb-4">Payment Method</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <input
                                            type="radio"
                                            id="credit_card"
                                            name="paymentMethod"
                                            value="credit_card"
                                            checked={formData.paymentMethod === 'credit_card'}
                                            onChange={handleInputChange}
                                            className="h-4 w-4 text-blue-600"
                                        />
                                        <label htmlFor="credit_card" className="ml-2 text-sm font-medium text-gray-700">Credit Card</label>
                                    </div>

                                    {formData.paymentMethod === 'credit_card' && (
                                        <div className="pl-6 grid grid-cols-1 md:grid-cols-2 gap-4">
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

                                    <div className="flex items-center">
                                        <input
                                            type="radio"
                                            id="paypal"
                                            name="paymentMethod"
                                            value="paypal"
                                            checked={formData.paymentMethod === 'paypal'}
                                            onChange={handleInputChange}
                                            className="h-4 w-4 text-blue-600"
                                        />
                                        <label htmlFor="paypal" className="ml-2 text-sm font-medium text-gray-700">PayPal</label>
                                    </div>

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
                                        <label htmlFor="cash_on_delivery" className="ml-2 text-sm font-medium text-gray-700">Cash on Delivery</label>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-md flex items-center justify-center"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Processing...
                                    </>
                                ) : (
                                    `Complete Order - $${calculateTotal()}`
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;