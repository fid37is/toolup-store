import { useState, useEffect } from 'react';
import { Package, ChevronDown, ChevronUp, Search, Filter, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    useEffect(() => {
        // Fetch orders from the API
        const fetchOrders = async () => {
            setIsLoading(true);
            try {
                // In a real app, replace with your actual API endpoint
                const response = await fetch('/api/orders');
                
                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                setOrders(data);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch orders:', err);
                setError('Failed to load your orders. Please try again later.');
                
                // For demo purposes, load sample data if API fails
                setOrders([
                    {
                        id: 'ORD-12345',
                        date: '2025-05-01',
                        status: 'Delivered',
                        total: 125.99,
                        items: [
                            { id: 1, name: 'Power Drill Set', price: 89.99, quantity: 1, image: '/api/placeholder/100/100' },
                            { id: 2, name: 'Screwdriver Kit', price: 36.00, quantity: 1, image: '/api/placeholder/100/100' }
                        ]
                    },
                    {
                        id: 'ORD-12344',
                        date: '2025-04-25',
                        status: 'Processing',
                        total: 54.49,
                        items: [
                            { id: 3, name: 'Wrench Set', price: 54.49, quantity: 1, image: '/api/placeholder/100/100' }
                        ]
                    },
                    {
                        id: 'ORD-12343',
                        date: '2025-04-10',
                        status: 'Delivered',
                        total: 210.97,
                        items: [
                            { id: 4, name: 'Circular Saw', price: 159.99, quantity: 1, image: '/api/placeholder/100/100' },
                            { id: 5, name: 'Safety Goggles', price: 15.99, quantity: 2, image: '/api/placeholder/100/100' },
                            { id: 6, name: 'Work Gloves', price: 18.99, quantity: 1, image: '/api/placeholder/100/100' }
                        ]
                    }
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const toggleOrderDetails = (orderId) => {
        if (expandedOrderId === orderId) {
            setExpandedOrderId(null);
        } else {
            setExpandedOrderId(orderId);
        }
    };

    // Handle cancellation of an order
    const handleCancelOrder = async (orderId) => {
        if (!confirm('Are you sure you want to cancel this order?')) {
            return;
        }
        
        try {
            // In a real app, replace with your actual API endpoint
            const response = await fetch(`/api/orders/${orderId}/cancel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
            // Update the local state to reflect the canceled order
            setOrders(orders.map(order => 
                order.id === orderId 
                    ? { ...order, status: 'Cancelled' } 
                    : order
            ));
            
            alert('Order canceled successfully');
        } catch (err) {
            console.error('Failed to cancel order:', err);
            alert('Failed to cancel order. Please try again later.');
        }
    };

    // Filter orders based on search and status filter
    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesFilter = filterStatus === 'All' || order.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    // Helper function to get the appropriate status style
    const getStatusStyle = (status) => {
        switch (status) {
            case 'Delivered':
                return 'bg-green-100 text-green-800';
            case 'Processing':
                return 'bg-blue-100 text-primary-700';
            case 'Shipped':
                return 'bg-yellow-100 text-yellow-800';
            case 'Cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <button
                onClick={() => window.history.back()}
                className="sticky top-4 z-10 mb-4 inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
            >
                <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back
            </button>
            <h1 className="text-3xl font-bold mb-8 text-gray-800">My Orders</h1>

            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search orders by ID or product name"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent-600 focus:ring focus:ring-accent-500 focus:ring-opacity-50"
                        />
                    </div>

                    <div className="flex items-center">
                        <Filter className="h-5 w-5 text-gray-400 mr-2" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="py-2 pl-2 pr-8 rounded-md border-gray-300 shadow-sm focus:border-accent-600 focus:ring focus:ring-accent-500 focus:ring-opacity-50"
                        >
                            <option value="All">All Status</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
                    </div>
                ) : error ? (
                    <div className="text-center py-10">
                        <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-700">{error}</h3>
                        <button 
                            onClick={() => window.location.reload()}
                            className="mt-4 inline-block px-4 py-2 bg-primary-700 text-white rounded-md hover:bg-primary-500"
                        >
                            Try Again
                        </button>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-10">
                        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-700">No orders found</h3>
                        <p className="text-gray-500 mt-1">Try adjusting your search or filter</p>
                        <Link href="/shop" className="mt-4 inline-block px-4 py-2 bg-primary-700 text-white rounded-md hover:bg-primary-500">
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => (
                            <div key={order.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                <div
                                    className="bg-gray-50 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer"
                                    onClick={() => toggleOrderDetails(order.id)}
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="bg-blue-100 rounded-full p-2">
                                            <Package className="h-5 w-5 text-primary-700" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">{order.id}</p>
                                            <p className="text-sm text-gray-500">Placed on {new Date(order.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-2 sm:mt-0">
                                        <div className="flex flex-col items-end">
                                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusStyle(order.status)}`}>
                                                {order.status}
                                            </span>
                                            <p className="font-medium text-gray-800 mt-1">₦{order.total.toFixed(2)}</p>
                                        </div>
                                        <div className="ml-4">
                                            {expandedOrderId === order.id ? (
                                                <ChevronUp className="h-5 w-5 text-gray-500" />
                                            ) : (
                                                <ChevronDown className="h-5 w-5 text-gray-500" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {expandedOrderId === order.id && (
                                    <div className="p-4 bg-white border-t border-gray-200">
                                        <h4 className="font-medium text-gray-800 mb-3">Order Items</h4>
                                        <div className="space-y-3">
                                            {order.items.map((item) => (
                                                <div key={item.id} className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded border border-gray-200">
                                                            <Image
                                                                src={item.image}
                                                                alt={item.name}
                                                                width={64}
                                                                height={64}
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-800">{item.name}</p>
                                                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                                        </div>
                                                    </div>
                                                    <p className="font-medium text-gray-800">₦{item.price.toFixed(2)}</p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-gray-200">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-gray-600">Subtotal</span>
                                                <span className="text-gray-800">₦{order.total.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-gray-600">Shipping</span>
                                                <span className="text-gray-800">₦0.00</span>
                                            </div>
                                            <div className="flex justify-between items-center font-medium">
                                                <span className="text-gray-800">Total</span>
                                                <span className="text-gray-800">₦{order.total.toFixed(2)}</span>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                                            <Link href={`/account/orders/${order.id}`} className="px-4 py-2 text-center border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                                                View Details
                                            </Link>
                                            {order.status === 'Delivered' && (
                                                <button className="px-4 py-2 bg-primary-700 text-center text-white rounded-md hover:bg-primary-500">
                                                    Leave Review
                                                </button>
                                            )}
                                            {order.status === 'Processing' && (
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCancelOrder(order.id);
                                                    }}
                                                    className="px-4 py-2 bg-red-600 text-center text-white rounded-md hover:bg-red-700"
                                                >
                                                    Cancel Order
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;