/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import useAuthCheck from '@/hooks/useAuthCheck';

export default function OrderDetail() {
    const router = useRouter();
    const { orderId } = router.query;
    const { isAuthenticated } = useAuthCheck();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Redirect to login if not authenticated
        if (!isAuthenticated) {
            router.push(`/login?redirect=/account/orders/${orderId}`);
            return;
        }

        // Only fetch if we have the orderId
        if (orderId) {
            fetchOrderDetails();
        }
    }, [orderId, isAuthenticated, router]);

    const fetchOrderDetails = async () => {
        try {
            // Get auth token from local storage
            const token = localStorage.getItem('authToken');

            // Fetch order details
            const response = await fetch(`/api/orders/detail?orderId=${orderId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch order details');
            }

            const data = await response.json();
            setOrder(data);
        } catch (err) {
            console.error('Error fetching order details:', err);
            setError('Failed to load order details. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-NG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
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
            <div className="min-h-screen flex flex-col">
                <Header />
                <div className="flex-grow flex items-center justify-center">
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2">Loading order details...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <div className="flex-grow container mx-auto px-4 py-8">
                    <div className="bg-red-100 text-red-700 p-4 rounded-lg">
                        {error}
                    </div>
                    <div className="mt-4">
                        <Link href="/account/orders" className="text-blue-600 hover:text-blue-800">
                            &larr; Back to My Orders
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <div className="flex-grow container mx-auto px-4 py-8">
                    <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg">
                        Order not found.
                    </div>
                    <div className="mt-4">
                        <Link href="/account/orders" className="text-blue-600 hover:text-blue-800">
                            &larr; Back to My Orders
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <div className="flex-grow container mx-auto px-4 py-8">
                <div className="mb-6">
                    <Link href="/account/orders" className="text-blue-600 hover:text-blue-800">
                        &larr; Back to My Orders
                    </Link>
                </div>

                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                            <div>
                                <h1 className="text-2xl font-bold">Order #{order.orderId}</h1>
                                <p className="text-gray-500">Placed on {formatDate(order.orderDate)}</p>
                            </div>
                            <div className="mt-2 md:mt-0">
                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <h2 className="text-lg font-medium mb-2">Shipping Address</h2>
                                <div className="bg-gray-50 p-4 rounded-md">
                                    <p>{order.shippingAddress?.address}</p>
                                    <p>
                                        {order.shippingAddress?.city}, {order.shippingAddress?.state}
                                        {order.shippingAddress?.zip && `, ${order.shippingAddress.zip}`}
                                    </p>
                                    <p>{order.shippingAddress?.country || 'Nigeria'}</p>
                                </div>
                            </div>
                            <div>
                                <h2 className="text-lg font-medium mb-2">Payment Information</h2>
                                <div className="bg-gray-50 p-4 rounded-md">
                                    <p><span className="font-medium">Method:</span> {order.paymentMethod || 'N/A'}</p>
                                    <p><span className="font-medium">Total:</span> ₦{order.total.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-6">
                            <h2 className="text-lg font-medium mb-4">Order Items</h2>
                            <div className="flow-root">
                                <ul className="divide-y divide-gray-200">
                                    {order.items.map((item, index) => (
                                        <li key={index} className="py-4 flex">
                                            {item.imageUrl ? (
                                                <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                                                    <Image
                                                        src={item.imageUrl}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                        width={25}
                                                        height={25}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center">
                                                    <span className="text-gray-400">No image</span>
                                                </div>
                                            )}
                                            <div className="ml-6 flex-1 flex flex-col">
                                                <div className="flex justify-between text-base font-medium text-gray-900">
                                                    <h3>{item.name}</h3>
                                                    <p className="ml-4">₦{(item.price * item.quantity).toLocaleString()}</p>
                                                </div>
                                                <div className="mt-1 flex justify-between text-sm text-gray-500">
                                                    <p>Qty: {item.quantity}</p>
                                                    <p>₦{item.price.toLocaleString()} each</p>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 mt-6 pt-6">
                            <div className="flex justify-between text-base font-medium text-gray-900">
                                <p>Subtotal</p>
                                <p>₦{(order.total - (order.shippingFee || 0)).toLocaleString()}</p>
                            </div>
                            <div className="flex justify-between text-base font-medium text-gray-500 mt-2">
                                <p>Shipping</p>
                                <p>₦{(order.shippingFee || 0).toLocaleString()}</p>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-gray-900 mt-4">
                                <p>Total</p>
                                <p>₦{order.total.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}