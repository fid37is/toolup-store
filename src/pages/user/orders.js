/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
// Store Front - /pages/user/orders.js - MODIFIED WITH REAL-TIME UPDATES
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../context/AuthContext';
import { useWebSocket } from '../../../hooks/useWebSocket';
import { toast } from 'sonner';
import {
    Package,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Truck,
    Eye,
    RefreshCw,
    Calendar,
    DollarSign
} from 'lucide-react';

const UserOrders = () => {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderDetails, setShowOrderDetails] = useState(false);

    // WebSocket connection for real-time updates
    const { isConnected, lastMessage } = useWebSocket(
        process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3002'
    );

    const statusConfig = {
        pending: {
            label: 'Pending',
            color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            icon: Clock,
            description: 'Your order is being reviewed'
        },
        processing: {
            label: 'Processing',
            color: 'bg-blue-100 text-blue-800 border-blue-200',
            icon: AlertCircle,
            description: 'Your order is being prepared'
        },
        fulfilled: {
            label: 'Fulfilled',
            color: 'bg-green-100 text-green-800 border-green-200',
            icon: CheckCircle,
            description: 'Your order has been completed'
        },
        shipped: {
            label: 'Shipped',
            color: 'bg-purple-100 text-purple-800 border-purple-200',
            icon: Truck,
            description: 'Your order is on its way'
        },
        delivered: {
            label: 'Delivered',
            color: 'bg-green-100 text-green-800 border-green-200',
            icon: CheckCircle,
            description: 'Your order has been delivered'
        },
        cancelled: {
            label: 'Cancelled',
            color: 'bg-red-100 text-red-800 border-red-200',
            icon: XCircle,
            description: 'Your order has been cancelled'
        }
    };

    // Handle real-time WebSocket updates
    useEffect(() => {
        if (lastMessage && user) {
            try {
                const data = JSON.parse(lastMessage);
                
                if (data.type === 'order_status_update' && data.userId === user.uid) {
                    // Update specific order status
                    setOrders(prevOrders => 
                        prevOrders.map(order => 
                            order.orderId === data.orderId 
                                ? { ...order, status: data.newStatus, trackingNumber: data.trackingNumber || order.trackingNumber }
                                : order
                        )
                    );

                    // Show toast notification
                    const statusInfo = statusConfig[data.newStatus];
                    toast.success(`Order ${data.orderId} status updated to ${statusInfo?.label || data.newStatus}`);
                }
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        }
    }, [lastMessage, user]);

    // Fetch user orders
    const fetchOrders = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const response = await fetch(`/api/orders/user/${user.uid}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }

            const data = await response.json();
            setOrders(data.orders || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    // Initial load and authentication check
    useEffect(() => {
        if (authLoading) return;
        
        if (!user) {
            router.push('/auth/login');
            return;
        }

        fetchOrders();
    }, [user, authLoading, router]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const StatusBadge = ({ status }) => {
        const config = statusConfig[status] || statusConfig.pending;
        const IconComponent = config.icon;

        return (
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
                <IconComponent className="w-4 h-4 mr-2" />
                {config.label}
            </div>
        );
    };

    const OrderDetailsModal = () => {
        if (!selectedOrder) return null;

        const statusInfo = statusConfig[selectedOrder.status] || statusConfig.pending;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                            <button
                                onClick={() => setShowOrderDetails(false)}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        {/* Order Status */}
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <StatusBadge status={selectedOrder.status} />
                                {isConnected && (
                                    <div className="flex items-center text-green-600 text-sm">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                                        Live updates active
                                    </div>
                                )}
                            </div>
                            <p className="text-gray-600 text-sm">{statusInfo.description}</p>
                        </div>

                        {/* Order Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-3 flex items-center">
                                    <Package className="w-5 h-5 mr-2" />
                                    Order Information
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <div><strong>Order ID:</strong> {selectedOrder.orderId}</div>
                                    <div><strong>Date:</strong> {formatDate(selectedOrder.orderDate)}</div>
                                    <div><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</div>
                                    {selectedOrder.trackingNumber && (
                                        <div><strong>Tracking Number:</strong> {selectedOrder.trackingNumber}</div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-3 flex items-center">
                                    <DollarSign className="w-5 h-5 mr-2" />
                                    Order Summary
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span>{formatCurrency(selectedOrder.total - (selectedOrder.shippingFee || 0))}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Shipping:</span>
                                        <span>{formatCurrency(selectedOrder.shippingFee || 0)}</span>
                                    </div>
                                    <div className="flex justify-between font-semibold border-t pt-2">
                                        <span>Total:</span>
                                        <span>{formatCurrency(selectedOrder.total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-3">Order Items</h3>
                            <div className="space-y-3">
                                {selectedOrder.items?.map((item, index) => (
                                    <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                                        {item.imageUrl && (
                                            <img
                                                src={item.imageUrl}
                                                alt={item.name}
                                                className="w-16 h-16 object-cover rounded-lg"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <h4 className="font-medium">{item.name}</h4>
                                            <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">{formatCurrency(item.price)}</p>
                                            <p className="text-sm text-gray-600">each</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-3">Shipping Address</h3>
                            <div className="text-sm text-gray-600">
                                <p>{selectedOrder.customerName}</p>
                                <p>{selectedOrder.shippingAddress}</p>
                                <p>{selectedOrder.customerEmail}</p>
                                {selectedOrder.customerPhone && <p>{selectedOrder.customerPhone}</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    <span>Loading your orders...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                            <p className="text-gray-600 mt-1">Track and manage your orders</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            {isConnected && (
                                <div className="flex items-center text-green-600 text-sm">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                                    Live updates
                                </div>
                            )}
                            <button
                                onClick={fetchOrders}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>

                {/* Orders List */}
                {orders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
                        <p className="text-gray-600 mb-6">When you place orders, they&apos;ll appear here.</p>
                        <button
                            onClick={() => router.push('/products')}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.orderId} className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Order #{order.orderId}
                                        </h3>
                                        <p className="text-gray-600 text-sm flex items-center mt-1">
                                            <Calendar className="w-4 h-4 mr-1" />
                                            {formatDate(order.orderDate)}
                                        </p>
                                    </div>
                                    <StatusBadge status={order.status} />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Total Amount</p>
                                            <p className="text-lg font-semibold">{formatCurrency(order.total)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Items</p>
                                            <p className="text-lg font-semibold">{order.items?.length || 0}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSelectedOrder(order);
                                            setShowOrderDetails(true);
                                        }}
                                        className="flex items-center px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                                    >
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Details
                                    </button>
                                </div>

                                {/* Order progress indicator */}
                                <div className="mt-4 pt-4 border-t">
                                    <div className="flex items-center space-x-2">
                                        {['pending', 'processing', 'fulfilled'].map((status, index) => {
                                            const isActive = ['pending', 'processing', 'fulfilled'].indexOf(order.status) >= index;
                                            const isCurrent = order.status === status;
                                            
                                            return (
                                                <React.Fragment key={status}>
                                                    <div className={`w-3 h-3 rounded-full ${
                                                        isActive ? 'bg-blue-600' : 'bg-gray-300'
                                                    } ${isCurrent ? 'ring-4 ring-blue-200' : ''}`} />
                                                    {index < 2 && (
                                                        <div className={`h-1 w-8 ${
                                                            isActive ? 'bg-blue-600' : 'bg-gray-300'
                                                        }`} />
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Order Details Modal */}
                {showOrderDetails && <OrderDetailsModal />}
            </div>
        </div>
    );
};

export default UserOrders;