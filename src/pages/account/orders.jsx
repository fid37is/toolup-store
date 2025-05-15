import React, { useEffect, useState } from 'react';
import { fetchUserOrders } from '../../services/orderService';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentUser } = useAuth();

    useEffect(() => {
        const loadOrders = async () => {
            try {
                setLoading(true);
                // Fetch orders for the current user
                const userOrders = await fetchUserOrders(currentUser?.email);
                setOrders(userOrders);
            } catch (err) {
                console.error('Failed to load orders:', err);
                setError('Unable to load your orders. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        if (currentUser?.email) {
            loadOrders();
        } else {
            setLoading(false);
            setError('Please sign in to view your orders.');
        }
    }, [currentUser]);

    if (loading) {
        return <div className="flex justify-center items-center h-96">Loading your orders...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center p-4">{error}</div>;
    }

    if (orders.length === 0) {
        return (
            <div className="text-center p-8">
                <h1 className="text-2xl font-bold mb-4">Your Orders</h1>
                <p>You haven't placed any orders yet.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Your Orders</h1>

            <div className="space-y-6">
                {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg overflow-hidden shadow-sm">
                        <div className="bg-gray-50 p-4 flex justify-between items-center">
                            <div>
                                <p className="font-medium">Order #{order.id}</p>
                                <p className="text-sm text-gray-500">Placed on {new Date(order.date).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold">{formatCurrency(order.total)}</p>
                                <p className={`text-sm ${order.status === 'Completed' ? 'text-green-600' : 'text-blue-600'}`}>
                                    {order.status || 'Processing'}
                                </p>
                            </div>
                        </div>

                        <div className="p-4">
                            <div className="divide-y">
                                {order.items && order.items.map((item, index) => (
                                    <div key={index} className="py-3 flex items-center">
                                        <div className="w-16 h-16 mr-4 flex-shrink-0">
                                            <img
                                                src={item.imageUrl || '/api/placeholder/64/64'}
                                                alt={item.name || 'Product'}
                                                className="w-full h-full object-cover rounded"
                                            />
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-medium">{item.name}</p>
                                            <p className="text-sm text-gray-500">
                                                Qty: {item.quantity} × {formatCurrency(item.price)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">{formatCurrency(item.quantity * item.price)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4">
                            <div className="flex justify-between">
                                <div>
                                    <p className="text-sm">Shipping Address:</p>
                                    <p className="text-sm text-gray-700">{order.shippingAddress}</p>
                                </div>
                                <div className="text-right">
                                    <button
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                        onClick={() => window.location.href = `/order/${order.id}`}
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrdersPage;