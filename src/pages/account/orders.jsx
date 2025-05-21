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
            <main className="container max-w-6xl mx-auto px-4 py-8 bg-gray-50 min-h-screen">
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-primary-700 hover:text-primary-500 transition-colors font-medium"
                    >
                        <span className="mr-2 text-lg">←</span> Back
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800 relative">
                        My Orders
                        <span className="block h-1 w-12 bg-accent-500 mt-2 rounded-full"></span>
                    </h1>
                </div>

                {loading ? (
                    <LoadingScreen message="Loading your orders..." />
                ) : fetchError ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-8 rounded-xl text-center shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-lg font-semibold">Error: {fetchError}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-6 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                        >
                            Retry
                        </button>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center shadow-md border border-gray-100">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <p className="text-gray-700 text-xl mb-6">You have no orders yet.</p>
                        <button
                            onClick={() => router.push('/')}
                            className="bg-primary-700 text-white px-4 py-2 rounded hover:bg-primary-500 transition-colors shadow-md font-medium"
                        >
                            Browse Products
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div
                                key={order.orderId}
                                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                            >
                                <div className="bg-gradient-to-r from-primary-50 to-gray-50 p-5 flex justify-between items-center border-b border-gray-200">
                                    <div>
                                        <p className="font-bold text-lg text-gray-800">Order #{order.orderId}</p>
                                        <p className="text-gray-500">
                                            {new Date(order.date).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-xl text-primary-600">
                                            ₦{Number(order.total).toLocaleString()}
                                        </p>
                                        <span
                                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                                order.status === 'delivered'
                                                    ? 'bg-green-100 text-green-800'
                                                    : order.status === 'processing'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : order.status === 'cancelled'
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                            }`}
                                        >
                                            {order.status
                                                ? order.status.charAt(0).toUpperCase() + order.status.slice(1)
                                                : 'Pending'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5">
                                    {order.items && order.items.length > 0 ? (
                                        <ul className="divide-y divide-gray-100">
                                            {order.items.map((item, idx) => (
                                                <li
                                                    key={idx}
                                                    className="py-4 flex justify-between items-center"
                                                >
                                                    <div>
                                                        <p className="font-medium text-gray-800">{item.name}</p>
                                                        <p className="text-gray-500">Qty: {item.quantity}</p>
                                                    </div>
                                                    <p className="font-medium text-gray-900">
                                                        ₦{Number(item.price).toLocaleString()}
                                                    </p>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-500 text-center py-4">
                                            Order details not available
                                        </p>
                                    )}
                                </div>

                                <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-between items-center">
                                    <button
                                        onClick={() => router.push(`/account/orders/${order.orderId}`)}
                                        className="text-primary-600 hover:text-primary-800 font-medium flex items-center group transition-colors"
                                    >
                                        View Order Details 
                                        <span className="transform transition-transform duration-300 group-hover:translate-x-1 ml-1">→</span>
                                    </button>
                                    
                                    {/* Optional: Add receipt download button */}
                                    <button className="text-gray-500 hover:text-gray-700 text-sm flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                        </svg>
                                        Receipt
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