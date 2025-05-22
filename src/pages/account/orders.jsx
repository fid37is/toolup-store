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
    const [downloadingReceipt, setDownloadingReceipt] = useState(null);

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

    const generatePDFReceipt = async (order) => {
        setDownloadingReceipt(order.orderId);
        
        try {
            const receiptContent = `
                <html>
                <head>
                    <title>Order Receipt #${order.orderId}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
                        .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                        .order-info { margin-bottom: 30px; }
                        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                        .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                        .items-table th { background-color: #f5f5f5; font-weight: bold; }
                        .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
                        .footer { margin-top: 40px; text-align: center; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Order Receipt</h1>
                        <h2>Order #${order.orderId}</h2>
                    </div>
                    
                    <div class="order-info">
                        <p><strong>Order Date:</strong> ${new Date(order.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}</p>
                        <p><strong>Status:</strong> ${order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending'}</p>
                        <p><strong>Customer:</strong> ${user.name || user.email}</p>
                    </div>
                    
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items?.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${item.quantity}</td>
                                    <td>₦${Number(item.price).toLocaleString()}</td>
                                    <td>₦${Number(item.price * item.quantity).toLocaleString()}</td>
                                </tr>
                            `).join('') || '<tr><td colspan="4">No items available</td></tr>'}
                        </tbody>
                    </table>
                    
                    <div class="total">
                        <p>Total Amount: ₦${Number(order.total).toLocaleString()}</p>
                    </div>
                    
                    <div class="footer">
                        <p>Thank you for your business!</p>
                        <p>Generated on ${new Date().toLocaleDateString()}</p>
                    </div>
                </body>
                </html>
            `;

            const printWindow = window.open('', '_blank');
            printWindow.document.write(receiptContent);
            printWindow.document.close();
            
            printWindow.onload = () => {
                printWindow.print();
                printWindow.close();
            };
            
            notifyEvent('Receipt generated successfully!', 'success');
        } catch (error) {
            console.error('Error generating receipt:', error);
            notifyEvent('Failed to generate receipt. Please try again.', 'error');
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
                                className="flex items-center text-primary-700 hover:text-primary-500 transition-all duration-200 font-medium bg-white px-3 py-2 rounded-lg shadow-sm hover:shadow-md border border-gray-200 text-sm"
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
                                className="flex items-center text-primary-700 hover:text-primary-500 transition-all duration-200 font-medium bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md border border-gray-200"
                            >
                                <span className="mr-2 text-lg">←</span> Back
                            </button>
                        </div>

                        <div className="text-center">
                            <h1 className="text-4xl font-bold text-gray-800 mb-2">
                                My Orders
                            </h1>
                            <div className="flex items-center justify-center">
                                <div className="h-1 w-16 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"></div>
                            </div>
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
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
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
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
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
                        <ul className="divide-y divide-gray-200">
                            {orders.map((order, index) => (
                                <li key={order.orderId} className="p-4">
                                    {/* Mobile-optimized Order Layout */}
                                    <div className="space-y-4">
                                        {/* Order Header - Mobile Stacked, Desktop Side-by-side */}
                                        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                                            <div className="flex-grow">
                                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                                    <h3 className="text-lg font-medium text-gray-800">
                                                        Order #{order.orderId}
                                                    </h3>
                                                    {index === 0 && (
                                                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                                            Latest
                                                        </span>
                                                    )}
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                        {order.status
                                                            ? order.status.charAt(0).toUpperCase() + order.status.slice(1)
                                                            : 'Pending'}
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                                                    <span>
                                                        {new Date(order.date).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                        })}
                                                    </span>
                                                    <span>
                                                        {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="text-left md:text-right md:ml-4 mt-2 md:mt-0">
                                                <span className="font-medium text-gray-800 text-lg">
                                                    ₦{Number(order.total).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Order Items Preview */}
                                        {order.items && order.items.length > 0 && (
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <div className="space-y-2">
                                                    {order.items.slice(0, 2).map((item, idx) => (
                                                        <div key={idx} className="flex justify-between items-center text-sm">
                                                            <span className="text-gray-700">
                                                                {item.name} × {item.quantity}
                                                            </span>
                                                            <span className="text-gray-600">
                                                                ₦{Number(item.price * item.quantity).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    ))}
                                                    {order.items.length > 2 && (
                                                        <div className="text-center text-xs text-gray-500 pt-1">
                                                            +{order.items.length - 2} more item{order.items.length - 2 !== 1 ? 's' : ''}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Action Buttons - Mobile Stacked, Desktop Horizontal */}
                                        <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
                                            <button
                                                onClick={() => generatePDFReceipt(order)}
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

                                            <button
                                                onClick={() => router.push(`/account/orders/${order.orderId}`)}
                                                className="px-4 py-2 rounded flex items-center justify-center bg-primary-500 text-white hover:bg-primary-700 w-full sm:w-auto"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
};

export default OrdersPage;