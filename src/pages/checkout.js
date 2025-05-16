import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useCart } from '@/context/CartContext';
import Layout from '@/components/Layout';
import useAuthCheck from '@/hooks/useAuthCheck';
import { fetchStates, fetchLGAs } from '@/services/locationService';
import Image from 'next/image';

export default function Checkout() {
    const router = useRouter();
    const { cart, total, clearCart } = useCart();
    const { isAuthenticated } = useAuthCheck();

    // Form states
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        state: '',
        lga: '',
        additionalInfo: '',
        paymentMethod: 'bank-transfer'
    });

    // Location data states
    const [states, setStates] = useState([]);
    const [lgas, setLgas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch states on component mount
    useEffect(() => {
        const getStates = async () => {
            try {
                const statesData = await fetchStates();
                setStates(statesData);
            } catch (err) {
                console.error('Error fetching states:', err);
                setError('Failed to load states data');
            }
        };

        getStates();
    }, []);

    // Fetch LGAs when state changes
    useEffect(() => {
        const getLGAs = async () => {
            if (!formData.state) return;

            try {
                const lgasData = await fetchLGAs(formData.state);
                setLgas(lgasData);
            } catch (err) {
                console.error('Error fetching LGAs:', err);
                setError('Failed to load LGA data');
            }
        };

        getLGAs();
    }, [formData.state]);

    // Check if cart is empty and redirect if necessary
    useEffect(() => {
        if (cart.length === 0) {
            router.push('/cart');
        }
    }, [cart, router]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Prepare order data
            const orderData = {
                userId: isAuthenticated ? localStorage.getItem('userId') || 'guest' : 'guest',
                items: cart.map(item => ({
                    productId: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    imageUrl: item.imageUrl
                })),
                shippingDetails: {
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    state: formData.state,
                    lga: formData.lga,
                    additionalInfo: formData.additionalInfo
                },
                paymentMethod: formData.paymentMethod,
                total: total,
                status: 'pending',
                orderDate: new Date().toISOString()
            };

            // Submit order
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Include auth token if authenticated
                    ...(isAuthenticated && {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    })
                },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                throw new Error('Failed to create order');
            }

            const result = await response.json();

            // Clear cart after successful order
            clearCart();

            // Redirect to order confirmation
            router.push({
                pathname: '/order-confirmation',
                query: { orderId: result.orderId }
            });
        } catch (err) {
            console.error('Error creating order:', err);
            setError('Failed to process your order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return <div>Loading...</div>;
    }

    return (
        <Layout title="Checkout">
            <div className="max-w-4xl mx-auto p-4">
                <h1 className="text-2xl font-bold mb-6">Checkout</h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Shipping Information */}
                    <div className="md:col-span-2">
                        <form onSubmit={handleSubmit}>
                            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                                <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="mb-4">
                                        <label className="block text-gray-700 mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700 mb-2">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-2">Delivery Address</label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        required
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="mb-4">
                                        <label className="block text-gray-700 mb-2">State</label>
                                        <select
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        >
                                            <option value="">Select State</option>
                                            {states.map(state => (
                                                <option key={state.value} value={state.value}>
                                                    {state.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-gray-700 mb-2">LGA</label>
                                        <select
                                            name="lga"
                                            value={formData.lga}
                                            onChange={handleChange}
                                            required
                                            disabled={!formData.state}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        >
                                            <option value="">Select LGA</option>
                                            {lgas.map(lga => (
                                                <option key={lga.value} value={lga.value}>
                                                    {lga.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-2">Additional Information (Optional)</label>
                                    <textarea
                                        name="additionalInfo"
                                        value={formData.additionalInfo}
                                        onChange={handleChange}
                                        rows="2"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    ></textarea>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                                <h2 className="text-xl font-semibold mb-4">Payment Method</h2>

                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <input
                                            type="radio"
                                            id="bank-transfer"
                                            name="paymentMethod"
                                            value="bank-transfer"
                                            checked={formData.paymentMethod === 'bank-transfer'}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-blue-600"
                                        />
                                        <label htmlFor="bank-transfer" className="ml-2 block text-gray-700">
                                            Bank Transfer
                                        </label>
                                    </div>

                                    {formData.paymentMethod === 'bank-transfer' && (
                                        <div className="ml-6 p-4 bg-gray-50 rounded-md">
                                            <p className="font-medium">Bank Transfer Details:</p>
                                            <p>Bank Name: Your Bank Name</p>
                                            <p>Account Number: 0123456789</p>
                                            <p>Account Name: Your Store Name</p>
                                            <p className="text-sm text-gray-600 mt-2">
                                                After making payment, please forward payment receipt to email@example.com
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex items-center">
                                        <input
                                            type="radio"
                                            id="cash-on-delivery"
                                            name="paymentMethod"
                                            value="cash-on-delivery"
                                            checked={formData.paymentMethod === 'cash-on-delivery'}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-blue-600"
                                        />
                                        <label htmlFor="cash-on-delivery" className="ml-2 block text-gray-700">
                                            Cash on Delivery
                                        </label>
                                    </div>

                                    {formData.paymentMethod === 'cash-on-delivery' && (
                                        <div className="ml-6 p-4 bg-gray-50 rounded-md">
                                            <p className="text-sm text-gray-600">
                                                You&apos;ll pay for the order when it&apos;s delivered to your address.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md 
                  ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                            >
                                {loading ? 'Processing...' : 'Place Order'}
                            </button>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

                            <div className="space-y-4 mb-4">
                                {cart.map(item => (
                                    <div key={item.id} className="flex items-center space-x-4">
                                        <div className="w-16 h-16 flex-shrink-0">
                                            {item.imageUrl && (
                                                <Image
                                                    src={item.imageUrl}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover rounded"
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-sm font-medium">{item.name}</h3>
                                            <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">₦{(item.price * item.quantity).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-200 pt-4 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium">₦{total.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="font-medium">₦0</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                                    <span>Total</span>
                                    <span>₦{total.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}