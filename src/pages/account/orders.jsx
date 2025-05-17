// src/pages/account/orders.jsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { notifyEvent } from '../../components/Notification';
import useAuthCheck from '../../hooks/useAuthCheck';
import LoadingScreen from '../../components/LoadingScreen';

const OrdersPage = () => {
    const router = useRouter();
    const { isAuthenticated, user, loading: authLoading } = useAuthCheck();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    useEffect(() => {
        if (authLoading) return; // Wait for auth to finish

        if (!isAuthenticated) {
            notifyEvent('Please log in to view your orders.', 'error');
            router.push('/login');
            return;
        }

        if (!user?.id) {
            notifyEvent('User information missing. Please log in again.', 'error');
            router.push('/login');
            return;
        }

        const fetchOrders = async () => {
            setLoading(true);
            setFetchError(null);

            try {
                const res = await fetch(`/api/orders/user?userId=${user.id}`);
                if (!res.ok) {
                    throw new Error(`Failed to fetch orders: ${res.statusText}`);
                }

                const data = await res.json();

                // Defensive: ensure data is an array
                if (!Array.isArray(data)) {
                    throw new Error('Invalid order data received');
                }

                setOrders(data);
            } catch (error) {
                console.error('Error fetching orders:', error);
                setFetchError(error.message || 'Failed to load orders.');
                notifyEvent('Failed to load your orders.', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [isAuthenticated, user, authLoading, router]);

    if (authLoading) {
        return <LoadingScreen message="Checking authentication..." />;
    }

    if (!isAuthenticated) {
        return <LoadingScreen message="Redirecting to login..." />;
    }

    return (
        <>
            <Header />
            <main className="container max-w-4xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-primary-600 hover:underline"
                    >
                        <span className="mr-1">←</span> Back
                    </button>
                    <h1 className="text-2xl font-bold">My Orders</h1>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="text-center">
                            <div className="inline-block w-12 h-12 border-4 border-t-accent-500 rounded-full animate-spin"></div>
                            <p className="mt-4 text-gray-600">Loading your orders...</p>
                        </div>
                    </div>
                ) : fetchError ? (
                    <div className="bg-red-50 text-red-700 p-6 rounded-lg text-center">
                        <p>Error: {fetchError}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                        >
                            Retry
                        </button>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <p className="text-gray-600 text-lg mb-4">You have no orders yet.</p>
                        <button
                            onClick={() => router.push('/products')}
                            className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
                        >
                            Browse Products
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div
                                key={order.orderId}
                                className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="bg-gray-50 p-4 flex justify-between items-center border-b">
                                    <div>
                                        <p className="font-medium">Order #{order.orderId}</p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(order.date).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg">
                                            ₦{Number(order.total).toLocaleString()}
                                        </p>
                                        <p
                                            className={`text-sm ${order.status === 'delivered'
                                                    ? 'text-green-600'
                                                    : order.status === 'processing'
                                                        ? 'text-blue-600'
                                                        : order.status === 'cancelled'
                                                            ? 'text-red-600'
                                                            : 'text-orange-600'
                                                }`}
                                        >
                                            {order.status
                                                ? order.status.charAt(0).toUpperCase() + order.status.slice(1)
                                                : 'Pending'}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4">
                                    {order.items && order.items.length > 0 ? (
                                        <ul className="divide-y">
                                            {order.items.map((item, idx) => (
                                                <li
                                                    key={idx}
                                                    className="py-3 flex justify-between"
                                                >
                                                    <div>
                                                        <p className="font-medium">{item.name}</p>
                                                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                                    </div>
                                                    <p className="font-medium">
                                                        ₦{Number(item.price).toLocaleString()}
                                                    </p>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-500 text-sm py-2">
                                            Order details not available
                                        </p>
                                    )}
                                </div>

                                <div className="bg-gray-50 p-4 border-t">
                                    <button
                                        onClick={() => router.push(`/orders/${order.orderId}`)}
                                        className="text-primary-600 hover:underline text-sm"
                                    >
                                        View Order Details →
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
};

export default OrdersPage;
