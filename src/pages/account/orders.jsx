import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import useAuthCheck from '@/hooks/useAuthCheck';
import Link from 'next/link';

export default function OrdersPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuthCheck();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Check if user is authenticated
        if (!isAuthenticated) {
            router.push('/login?redirect=/account/orders');
            return;
        }

        const fetchOrders = async () => {
            try {
                // Get auth token from local storage
                const token = localStorage.getItem('authToken');

                // Fetch user's orders
                const response = await fetch('/api/orders/user', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch orders');
                }

                const data = await response.json();
                setOrders(data);
            } catch (err) {
                console.error('Error fetching orders:', err);
                setError('Failed to load your orders. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [isAuthenticated, router]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-NG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusBadgeClass = (status) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div title="My Orders">
                <div className="max-w-6xl mx-auto p-4">
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2">Loading your orders...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div title="My Orders">
            <div className="max-w-6xl mx-auto p-4">
                <h1 className="text-2xl font-bold mb-6">My Orders</h1>

                {error && (
                    <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {orders.length === 0 ? (
                    <div className="bg-white shadow-md rounded-lg p-6 text-center">
                        <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
                        <Link href="/" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.orderId} className="bg-white shadow-md rounded-lg overflow-hidden">
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Order #{order.orderId}</p>
                                            <p className="text-sm text-gray-500">Placed on {formatDate(order.orderDate)}</p>
                                        </div>
                                        <div className="mt-2 md:mt-0">
                                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 pt-4">
                                        <div className="flow-root">
                                            <ul className="divide-y divide-gray-200">
                                                {order.items.map((item, index) => (
                                                    <li key={index} className="py-3 flex">
                                                        {item.imageUrl && (
                                                            <div className="flex-shrink-0 w-16 h-16 border border-gray-200 rounded-md overflow-hidden">
                                                                <img
                                                                    src={item.imageUrl}
                                                                    alt={item.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                        )}
                                                        <div className="ml-4 flex-1 flex flex-col">
                                                            <div>
                                                                <div className="flex justify-between text-sm font-medium text-gray-900">
                                                                    <h3>{item.name}</h3>
                                                                    <p className="ml-4">₦{(item.price * item.quantity).toLocaleString()}</p>
                                                                </div>
                                                                <p className="mt-1 text-sm text-gray-500">Qty: {item.quantity}</p>
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                                        <p className="text-lg font-medium text-gray-900">Total: ₦{order.total.toLocaleString()}</p>
                                        <Link
                                            href={`/account/orders/${order.orderId}`}
                                            className="text-blue-600 hover:text-blue-800 font-medium"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}