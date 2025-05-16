import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { createOrder } from '../../services/orderService';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';

const CheckoutPage = () => {
    const { user } = useAuth();
    const { cart, clearCart, cartTotal } = useCart();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'United States'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (cart.length === 0) {
            setError('Your cart is empty');
            return;
        }

        try {
            setLoading(true);
            setError('');

            // Prepare order data
            const orderData = {
                userId: user?.uid || 'guest',
                items: cart.map(item => ({
                    productId: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    imageUrl: item.imageUrl
                })),
                total: cartTotal(),
                shippingAddress: {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    street: formData.street,
                    city: formData.city,
                    state: formData.state,
                    postalCode: formData.postalCode,
                    country: formData.country
                },
                status: 'Processing',
                orderDate: new Date().toISOString()
            };

            // Create order
            const order = await createOrder(orderData);

            // Clear cart
            clearCart();

            // Redirect to confirmation page
            router.push(`/checkout/confirmation?orderId=${order.orderId}`);
        } catch (err) {
            console.error('Checkout error:', err);
            setError('Failed to process your order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner />
                    <p className="ml-2">Processing your order...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6">Checkout</h1>

                {error && (
                    <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
                        {error}
                    </div>
                )}

                {cart.length === 0 ? (
                    <div className="bg-white shadow-md rounded-lg p-6 text-center">
                        <p className="mb-4">Your cart is empty.</p>
                        <button
                            onClick={() => router.push('/')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Continue Shopping
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <div className="bg-white shadow-md rounded-lg p-6">
                                <h2 className="text-lg font-semibold mb-4">Shipping Information</h2>
                                <form onSubmit={handleSubmit}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Full Name
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Street Address
                                        </label>
                                        <input
                                            type="text"
                                            name="street"
                                            value={formData.street}
                                            onChange={handleChange}
                                            required
                                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                City
                                            </label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                                required
                                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                State/Province
                                            </label>
                                            <input
                                                type="text"
                                                name="state"
                                                value={formData.state}
                                                onChange={handleChange}
                                                required
                                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Postal Code
                                            </label>
                                            <input
                                                type="text"
                                                name="postalCode"
                                                value={formData.postalCode}
                                                onChange={handleChange}
                                                required
                                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Country
                                            </label>
                                            <select
                                                name="country"
                                                value={formData.country}
                                                onChange={handleChange}
                                                required
                                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                            >
                                                <option value="United States">United States</option>
                                                <option value="Canada">Canada</option>
                                                <option value="United Kingdom">United Kingdom</option>
                                                {/* Add more countries as needed */}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-blue-600 text-white rounded-md py-2 px-4 hover:bg-blue-700"
                                        >
                                            Place Order
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <div>
                            <div className="bg-white shadow-md rounded-lg p-6">
                                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                                <div className="space-y-3 mb-4">
                                    {cart.map((item) => (
                                        <div key={item.id} className="flex justify-between">
                                            <div>
                                                <p className="text-sm font-medium">{item.name}</p>
                                                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t border-gray-200 pt-4">
                                    <div className="flex justify-between mb-2">
                                        <p>Subtotal</p>
                                        <p>${cartTotal().toFixed(2)}</p>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <p>Shipping</p>
                                        <p>Free</p>
                                    </div>
                                    <div className="flex justify-between font-semibold mt-4">
                                        <p>Total</p>
                                        <p>${cartTotal().toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default CheckoutPage;