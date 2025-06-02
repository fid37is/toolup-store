// src/pages/account/orders.jsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { notifyEvent } from '../../components/Notification';
import useAuthCheck from '../../hooks/useAuthCheck';
import LoadingScreen from '../../components/LoadingScreen';
import { generatePDFReceipt as createPDFReceipt } from '../../utils/pdfReceiptGenerator';

const OrdersPage = () => {
    const router = useRouter();
    const { isAuthenticated, user, loading: authLoading } = useAuthCheck();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [downloadingReceipt, setDownloadingReceipt] = useState(null);
    const [expandedOrders, setExpandedOrders] = useState(new Set());

    useEffect(() => {
        const handleAuth = async () => {
            // Wait for auth to complete
            if (authLoading) return;

            // Handle unauthenticated users immediately
            if (!isAuthenticated) {
                setLoading(false);
                notifyEvent('Please log in to view your orders.', 'error');
                router.push('/login');
                return;
            }

            // Handle missing user data
            if (!user?.id) {
                setLoading(false);
                notifyEvent('User information missing. Please log in again.', 'error');
                router.push('/login');
                return;
            }

            // Fetch orders for authenticated user
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

                // Sort orders by date (latest first)
                const sortedOrders = data.sort((a, b) => {
                    const dateA = new Date(a.date);
                    const dateB = new Date(b.date);
                    
                    // If dates are invalid, fallback to orderId comparison
                    if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
                        return (b.orderId || 0) - (a.orderId || 0);
                    }
                    
                    return dateB.getTime() - dateA.getTime();
                });
                
                setOrders(sortedOrders);
            } catch (error) {
                console.error('Error fetching orders:', error);
                setFetchError(error.message || 'Failed to load orders.');
                notifyEvent('Failed to load your orders.', 'error');
            } finally {
                setLoading(false);
            }
        };

        handleAuth();
    }, [isAuthenticated, user, authLoading, router]);

    const toggleOrderExpansion = (orderId) => {
        setExpandedOrders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(orderId)) {
                newSet.delete(orderId);
            } else {
                newSet.add(orderId);
            }
            return newSet;
        });
    };

    const generatePDFReceipt = async (order) => {
    setDownloadingReceipt(order.orderId);
    
    try {
        // Try to generate PDF first
        await createPDFReceipt(order, user, '/logo-2.png');
        notifyEvent('PDF receipt downloaded successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating PDF receipt:', error);
        
        // Fallback to HTML download if PDF generation fails
        console.log('Falling back to HTML receipt...');
        try {
            generateHTMLReceipt(order, user);
            notifyEvent('Receipt downloaded as HTML (PDF generation failed)', 'warning');
        } catch (htmlError) {
            console.error('Error generating HTML receipt:', htmlError);
            notifyEvent('Failed to generate receipt. Please try again.', 'error');
        }
        
    } finally {
        setDownloadingReceipt(null);
    }
};

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'delivered':
                return 'text-green-700 bg-green-100';
            case 'processing':
                return 'text-blue-700 bg-blue-100';
            case 'shipped':
                return 'text-purple-700 bg-purple-100';
            case 'cancelled':
                return 'text-red-700 bg-red-100';
            default:
                return 'text-yellow-700 bg-yellow-100';
        }
    };

    // Single loading state for everything
    if (loading) {
        return (
            <>
                <Header />
                <main className="container max-w-6xl mx-auto px-4 py-8 bg-gray-50 min-h-screen flex items-center justify-center">
                    <LoadingScreen message="Loading..." />
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <main className="container max-w-6xl mx-auto px-4 py-8 bg-gray-50 min-h-screen">
                {/* Mobile-optimized Header Section */}
                <div className="mb-6">
                    {/* Mobile Layout */}
                    <div className="block md:hidden">
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={() => router.back()}
                                className="flex items-center text-primary-700 hover:text-primary-500 transition-all duration-200 font-medium bg-white px-3 py-4 rounded mb-6 shadow-sm hover:shadow-md border border-gray-200 text-sm"
                            >
                                <span className="mr-1 text-lg">←</span> Back
                            </button>
                            {orders.length > 0 && (
                                <span className="text-sm text-gray-600">
                                    {orders.length} order{orders.length !== 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-gray-800 mb-2">
                                My Orders
                            </h1>
                            <div className="flex items-center justify-center">
                                <div className="h-1 w-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"></div>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden md:grid grid-cols-3 items-center">
                        <div className="justify-self-start">
                            <button
                                onClick={() => router.back()}
                                className="flex items-center text-primary-700 hover:text-primary-500 transition-all duration-200 font-medium bg-white px-4 py-2 rounded shadow-sm hover:shadow-md border border-gray-200"
                            >
                                <span className="mr-2 text-lg">←</span> Back
                            </button>
                        </div>

                        <div className="text-center">
                            <h1 className="text-4xl font-bold text-gray-800 mb-2">
                                My Orders
                            </h1>
                        </div>

                        <div className="justify-self-end">
                            {orders.length > 0 && (
                                <div className="text-right">
                                    <span className="text-sm text-gray-600">
                                        {orders.length} order{orders.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                {fetchError ? (
                    <div className="bg-white rounded-lg shadow-md p-8 mb-6 text-center">
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-700 mb-2">Failed to load orders</h3>
                        <p className="text-gray-500 mb-6">{fetchError}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="inline-block px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
                        >
                            Try Again
                        </button>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-8 mb-8 text-center">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-700 mb-2">No orders yet</h3>
                        <p className="text-gray-500 mb-6">Orders you place will appear here</p>
                        <button
                            onClick={() => router.push('/')}
                            className="inline-block px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-700"
                        >
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="divide-y-8 divide-gray-100">
                            {orders.map((order, index) => (
                                <div key={order.orderId}>
                                    {/* Compact Order Row */}
                                    <div 
                                        onClick={() => toggleOrderExpansion(order.orderId)}
                                        className="p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                                    >
                                        <div className="flex items-center justify-between">
                                            {/* Left side - Order info in one line */}
                                            <div className="flex items-center space-x-4 flex-grow min-w-0">
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-medium text-gray-800">
                                                        #{order.orderId}
                                                    </span>
                                                    {index === 0 && (
                                                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                                            Latest
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                <span className="text-sm text-gray-600 hidden sm:inline">
                                                    {new Date(order.date).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    })}
                                                </span>
                                                
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                    {order.status
                                                        ? order.status.charAt(0).toUpperCase() + order.status.slice(1)
                                                        : 'Pending'}
                                                </span>
                                                
                                                <span className="text-sm text-gray-600 hidden md:inline">
                                                    {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                                                </span>
                                            </div>

                                            {/* Right side - Total and arrow */}
                                            <div className="flex items-center space-x-4">
                                                <span className="font-medium text-gray-800">
                                                    ₦{Number(order.total).toLocaleString()}
                                                </span>
                                                <svg 
                                                    xmlns="http://www.w3.org/2000/svg" 
                                                    className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                                                        expandedOrders.has(order.orderId) ? 'rotate-180' : ''
                                                    }`}
                                                    fill="none" 
                                                    viewBox="0 0 24 24" 
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>

                                        {/* Mobile date display */}
                                        <div className="mt-1 sm:hidden">
                                            <span className="text-xs text-gray-500">
                                                {new Date(order.date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })} • {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Expanded Order Details */}
                                    {expandedOrders.has(order.orderId) && (
                                        <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100">
                                            <div className="space-y-4 pt-4">
                                                {/* Order Details */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <h4 className="font-medium text-gray-800 mb-2">Order Information</h4>
                                                        <div className="space-y-1 text-sm text-gray-600">
                                                            <div>
                                                                <span className="font-medium">Order Date:</span> {new Date(order.date).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric',
                                                                })}
                                                            </div>
                                                            <div>
                                                                <span className="font-medium">Status:</span> {order.status
                                                                    ? order.status.charAt(0).toUpperCase() + order.status.slice(1)
                                                                    : 'Pending'}
                                                            </div>
                                                            <div>
                                                                <span className="font-medium">Customer:</span> {user.name || user.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div>
                                                        <h4 className="font-medium text-gray-800 mb-2">Order Summary</h4>
                                                        <div className="space-y-1 text-sm text-gray-600">
                                                            <div>
                                                                <span className="font-medium">Items:</span> {order.items?.length || 0}
                                                            </div>
                                                            <div>
                                                                <span className="font-medium">Total Amount:</span> ₦{Number(order.total).toLocaleString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Order Items */}
                                                {order.items && order.items.length > 0 && (
                                                    <div>
                                                        <h4 className="font-medium text-gray-800 mb-3">Items Ordered</h4>
                                                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                                            <div className="divide-y divide-gray-200">
                                                                {order.items.map((item, idx) => (
                                                                    <div key={idx} className="p-3 flex justify-between items-center">
                                                                        <div className="flex-grow">
                                                                            <div className="font-medium text-gray-800">{item.name}</div>
                                                                            <div className="text-sm text-gray-600">
                                                                                Quantity: {item.quantity} × ₦{Number(item.price).toLocaleString()}
                                                                            </div>
                                                                        </div>
                                                                        <div className="font-medium text-gray-800">
                                                                            ₦{Number(item.price * item.quantity).toLocaleString()}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Action Buttons */}
                                                <div className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            generatePDFReceipt(order);
                                                        }}
                                                        disabled={downloadingReceipt === order.orderId}
                                                        className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 flex items-center justify-center disabled:opacity-50 w-full sm:w-auto"
                                                    >
                                                        {downloadingReceipt === order.orderId ? (
                                                            <>
                                                                <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full mr-2"></div>
                                                                Downloading...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                                                </svg>
                                                                Receipt
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
};

export default OrdersPage;