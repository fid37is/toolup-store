/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import useAuthCheck from '@/hooks/useAuthCheck';
import LoadingScreen from '@/components/LoadingScreen';

export default function OrderDetail() {
    const router = useRouter();
    const { orderId } = router.query;
    const { isAuthenticated, loading: authLoading } = useAuthCheck();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [authRedirected, setAuthRedirected] = useState(false);

    useEffect(() => {
        // Check if router is ready
        if (!router.isReady) return;

        // Handle auth redirection only once
        if (!authLoading && !isAuthenticated && !authRedirected) {
            setAuthRedirected(true);
            router.push('/login?redirect=/account/orders');
            return;
        }

        // Only fetch if we have the orderId and auth check is complete
        if (orderId && isAuthenticated && !authLoading) {
            fetchOrderDetails();
        }
    }, [orderId, isAuthenticated, authLoading, router.isReady]);

    const fetchOrderDetails = async () => {
        if (!orderId) return;
        
        setLoading(true);
        setError('');
        
        try {
            // Get auth token from local storage - with a fallback
            let token;
            try {
                token = localStorage.getItem('authToken');
            } catch (err) {
                console.error('Error accessing localStorage:', err);
            }

            // Add timeout to prevent infinite loading
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
            
            // Build URL with order ID
            const url = `/api/orders/${orderId}`;
            console.log('Fetching order details from:', url);
            
            const headers = {};
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }
            
            const response = await fetch(url, {
                headers,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                if (response.status === 401) {
                    // Token might be expired, redirect to login
                    router.push('/login?redirect=/account/orders');
                    return;
                }
                throw new Error(`Failed to fetch order details: ${response.status}`);
            }

            const data = await response.json();
            console.log('Order data received:', data);
            setOrder(data);
        } catch (err) {
            console.error('Error fetching order details:', err);
            if (err.name === 'AbortError') {
                setError('Request timed out. Please try again later.');
            } else {
                setError(err.message || 'Failed to load order details. Please try again later.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRetry = () => {
        fetchOrderDetails();
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        
        const date = new Date(dateString);
        // Check if date is valid
        if (isNaN(date.getTime())) return 'Invalid date';
        
        return date.toLocaleDateString('en-NG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadgeClass = (status) => {
        if (!status) return 'bg-gray-100 text-gray-800';
        
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

    // Simple loading while checking authentication or waiting for router
    if (authLoading) {
        return <LoadingScreen message="Initializing..." />;
    }

    // Show loading while fetching order details
    if (loading) {
        return <LoadingScreen message="Loading order details..." />;
    }

    // Show error state
    if (error) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <div className="flex-grow container mx-auto px-4 py-8">
                    <div className="bg-red-100 text-red-700 p-4 rounded-lg">
                        {error}
                    </div>
                    <div className="mt-4 flex space-x-4">
                        <button 
                            onClick={handleRetry}
                            className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                        >
                            Retry
                        </button>
                        <Link href="/account/orders" className="text-blue-600 hover:text-blue-800 py-2">
                            &larr; Back to My Orders
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // Show when order not found
    if (!order && orderId && !loading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <div className="flex-grow container mx-auto px-4 py-8">
                    <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg">
                        Order not found or you don&apos;t have permission to view this order.
                    </div>
                    <div className="mt-4 flex space-x-4">
                        <button 
                            onClick={handleRetry}
                            className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                        >
                            Retry
                        </button>
                        <Link href="/account/orders" className="text-blue-600 hover:text-blue-800 py-2">
                            &larr; Back to My Orders
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // Don't render order details until we have order data
    if (!order) {
        return <LoadingScreen message="Loading order information..." />;
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
                                    {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Unknown'}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <h2 className="text-lg font-medium mb-2">Shipping Address</h2>
                                <div className="bg-gray-50 p-4 rounded-md">
                                    {order.shippingAddress ? (
                                        <>
                                            <p>{order.shippingAddress.address || 'N/A'}</p>
                                            <p>
                                                {order.shippingAddress.city || 'N/A'}, {order.shippingAddress.state || 'N/A'}
                                                {order.shippingAddress.zip && `, ${order.shippingAddress.zip}`}
                                            </p>
                                            <p>{order.shippingAddress.country || 'Nigeria'}</p>
                                        </>
                                    ) : (
                                        <p>No shipping address provided</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h2 className="text-lg font-medium mb-2">Payment Information</h2>
                                <div className="bg-gray-50 p-4 rounded-md">
                                    <p><span className="font-medium">Method:</span> {order.paymentMethod || 'N/A'}</p>
                                    <p><span className="font-medium">Total:</span> ₦{order.total ? order.total.toLocaleString() : 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-6">
                            <h2 className="text-lg font-medium mb-4">Order Items</h2>
                            <div className="flow-root">
                                {order.items && order.items.length > 0 ? (
                                    <ul className="divide-y divide-gray-200">
                                        {order.items.map((item, index) => (
                                            <li key={index} className="py-4 flex">
                                                {item.imageUrl ? (
                                                    <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                                                        <Image
                                                            src={item.imageUrl}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover"
                                                            width={96}
                                                            height={96}
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
                                                        <p className="ml-4">₦{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</p>
                                                    </div>
                                                    <div className="mt-1 flex justify-between text-sm text-gray-500">
                                                        <p>Qty: {item.quantity || 1}</p>
                                                        <p>₦{(item.price || 0).toLocaleString()} each</p>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500">No items found in this order.</p>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-gray-200 mt-6 pt-6">
                            <div className="flex justify-between text-base font-medium text-gray-900">
                                <p>Subtotal</p>
                                <p>₦{((order.total || 0) - (order.shippingFee || 0)).toLocaleString()}</p>
                            </div>
                            <div className="flex justify-between text-base font-medium text-gray-500 mt-2">
                                <p>Shipping</p>
                                <p>₦{(order.shippingFee || 0).toLocaleString()}</p>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-gray-900 mt-4">
                                <p>Total</p>
                                <p>₦{(order.total || 0).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}