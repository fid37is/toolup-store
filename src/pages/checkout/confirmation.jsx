import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import OrderCard from '../../components/OrderCard';
import { getUserOrders } from '../../services/orderService';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const OrderConfirmation = () => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { orderId } = router.query;
    const { user } = useAuth();

    useEffect(() => {
        async function fetchOrder() {
            if (!orderId || !user) return;

            try {
                setLoading(true);
                // Get all user orders
                const orders = await getUserOrders(user.uid);
                // Find the one matching the orderId
                const currentOrder = orders.find(o => o.orderId === orderId);

                if (currentOrder) {
                    setOrder(currentOrder);
                } else {
                    // If order not found, redirect to orders page
                    router.push('/account/orders');
                }
            } catch (err) {
                console.error('Failed to fetch order confirmation:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchOrder();
    }, [orderId, user, router]);

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner />
                </div>
            </Layout>
        );
    }

    if (!order) {
        return (
            <Layout>
                <div className="text-center py-8">
                    <p>Order information not found</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
                    <p className="text-gray-600">
                        Thank you for your purchase. Your order has been received and is being processed.
                    </p>
                </div>

                <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                    <OrderCard order={order} expandedView={true} />
                </div>

                <div className="text-center mt-8">
                    <p className="text-gray-600 mb-4">
                        A confirmation email has been sent to your email address.
                    </p>
                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={() => router.push('/account/orders')}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            View All Orders
                        </button>
                        <button
                            onClick={() => router.push('/')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default OrderConfirmation;