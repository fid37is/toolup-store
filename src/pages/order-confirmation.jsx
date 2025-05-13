// src/pages/order-confirmation.jsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const OrderConfirmationPage = () => {
    const router = useRouter();
    const [orderDetails, setOrderDetails] = useState({
        orderNumber: '',
        orderDate: '',
        estimatedDelivery: '',
        items: [],
        shippingAddress: {},
        paymentMethod: '',
        subtotal: 0,
        shippingFee: 0,
        total: 0
    });

    useEffect(() => {
        // In a real app, you would fetch order details from an API or get from router state
        // For now, we'll simulate order details
        
        // Generate random order number
        const orderNum = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
        
        // Set current date
        const currentDate = new Date();
        
        // Set estimated delivery (3-5 days from now)
        const deliveryDate = new Date(currentDate);
        deliveryDate.setDate(deliveryDate.getDate() + Math.floor(Math.random() * 3) + 3);
        
        // Try to get order details from localStorage if available
        try {
            const storedCart = localStorage.getItem('cart');
            const cartItems = storedCart ? JSON.parse(storedCart) : [];
            
            const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
            const shippingFee = 1500; // Default fee
            const total = subtotal + shippingFee;
            
            setOrderDetails({
                orderNumber: orderNum,
                orderDate: currentDate.toLocaleDateString('en-NG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }),
                estimatedDelivery: deliveryDate.toLocaleDateString('en-NG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }),
                items: cartItems,
                shippingAddress: {
                    name: 'John Doe', // In a real app, this would come from the order
                    address: '123 Main Street',
                    city: 'Lagos',
                    state: 'Lagos',
                    zipCode: '100001'
                },
                paymentMethod: router.query.method || 'Credit Card',
                subtotal,
                shippingFee,
                total
            });
        } catch (error) {
            console.error('Error retrieving order details:', error);
        }
    }, [router.query]);

    // Format currency as Naira
    const formatNaira = (amount) => {
        return `₦${Number(amount).toLocaleString('en-NG')}`;
    };

    return (
        <>
            <Head>
                <title>Order Confirmation</title>
                <meta name="description" content="Thank you for your order" />
            </Head>
            
            <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        {/* Order confirmation header */}
                        <div className="bg-green-600 px-6 py-8 text-white">
                            <div className="flex items-center justify-center mb-4">
                                <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                            <h1 className="text-3xl font-bold text-center">Order Confirmed!</h1>
                            <p className="text-center mt-2 text-green-100">Thank you for your purchase</p>
                        </div>
                        
                        {/* Order details */}
                        <div className="p-6">
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold mb-4">Order Details</h2>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600">Order Number</p>
                                        <p className="font-medium">{orderDetails.orderNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Order Date</p>
                                        <p className="font-medium">{orderDetails.orderDate}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Estimated Delivery</p>
                                        <p className="font-medium">{orderDetails.estimatedDelivery}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Payment Method</p>
                                        <p className="font-medium">{orderDetails.paymentMethod}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="border-t border-gray-200 pt-6 mb-6">
                                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                                {orderDetails.items.length === 0 ? (
                                    <p className="text-gray-500">No items in this order</p>
                                ) : (
                                    <div className="space-y-4">
                                        <ul className="divide-y divide-gray-200">
                                            {orderDetails.items.map((item, index) => (
                                                <li key={index} className="py-4 flex justify-between">
                                                    <div>
                                                        <p className="font-medium">{item.name}</p>
                                                        <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                                                    </div>
                                                    <p className="font-medium">{formatNaira(item.price * item.quantity)}</p>
                                                </li>
                                            ))}
                                        </ul>
                                        
                                        <div className="border-t border-gray-200 pt-4">
                                            <div className="flex justify-between mb-2">
                                                <p>Subtotal</p>
                                                <p>{formatNaira(orderDetails.subtotal)}</p>
                                            </div>
                                            <div className="flex justify-between mb-2">
                                                <p>Shipping</p>
                                                <p>{formatNaira(orderDetails.shippingFee)}</p>
                                            </div>
                                            <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t border-gray-200">
                                                <p>Total</p>
                                                <p>{formatNaira(orderDetails.total)}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="border-t border-gray-200 pt-6">
                                <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
                                <div className="text-sm">
                                    <p className="font-medium">{orderDetails.shippingAddress.name}</p>
                                    <p>{orderDetails.shippingAddress.address}</p>
                                    <p>{orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} {orderDetails.shippingAddress.zipCode}</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-4">
                            <div className="text-sm text-gray-600">
                                <p>Have questions about your order?</p>
                                <p>Contact our customer support team</p>
                            </div>
                            <div className="flex space-x-4">
                                <button
                                    onClick={() => {/* Would implement email functionality */}}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 text-sm"
                                >
                                    Email Receipt
                                </button>
                                <button
                                    onClick={() => router.push('/products')}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default OrderConfirmationPage;