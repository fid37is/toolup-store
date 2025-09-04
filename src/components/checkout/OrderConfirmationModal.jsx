import React from 'react';
import { X, Check, Package, ArrowRight } from 'lucide-react';

const OrderConfirmationModal = ({ 
    orderDetails, 
    onClose, 
    onContinueShopping, 
    onViewOrders 
}) => {
    // Mock order data for demonstration
    const mockOrderDetails = orderDetails || {
        orderId: 'ORD-2024-001',
        orderDate: new Date().toISOString(),
        status: 'processing',
        paymentMethod: 'bank-transfer',
        total: 45000,
        shippingFee: 2500,
        shippingDetails: {
            fullName: 'John Doe',
            phone: '+234 801 234 5678',
            email: 'john.doe@email.com',
            address: '123 Victoria Island, Lagos',
            state: 'Lagos State',
            lga: 'Victoria Island'
        },
        items: [
            {
                name: 'Premium Wireless Headphones',
                quantity: 1,
                price: 25000,
                imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=60&h=60&fit=crop'
            },
            {
                name: 'Bluetooth Speaker',
                quantity: 2,
                price: 10000,
                imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=60&h=60&fit=crop'
            }
        ]
    };

    const order = mockOrderDetails;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            {/* Modal */}
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
                
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-10 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X className="h-5 w-5 text-gray-400" />
                </button>

                {/* Success Header */}
                <div className="text-center pt-12 pb-8 px-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                        <Check className="h-8 w-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-semibold text-gray-900 mb-2">Order Confirmed</h1>
                    <p className="text-gray-500">Order #{order.orderId.split('-')[2]}</p>
                </div>

                {/* Order Summary */}
                <div className="px-8 pb-8">
                    
                    {/* Items */}
                    <div className="space-y-3 mb-6">
                        {order.items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <img
                                        src={item.imageUrl}
                                        alt={item.name}
                                        className="h-12 w-12 object-cover rounded-lg bg-gray-100"
                                    />
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                                        <p className="text-gray-500 text-sm">Qty {item.quantity}</p>
                                    </div>
                                </div>
                                <p className="font-medium text-gray-900">
                                    ₦{(item.price * item.quantity).toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Total */}
                    <div className="border-t pt-4 mb-6 space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="text-gray-900">₦{(order.total - order.shippingFee).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Shipping</span>
                            <span className="text-gray-900">₦{order.shippingFee.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t">
                            <span className="text-lg font-semibold text-gray-900">Total</span>
                            <span className="text-lg font-semibold text-gray-900">₦{order.total.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                        <h3 className="font-medium text-gray-900 mb-2">Delivery Details</h3>
                        <p className="text-sm text-gray-600">{order.shippingDetails.fullName}</p>
                        <p className="text-sm text-gray-600">{order.shippingDetails.address}</p>
                        <p className="text-sm text-gray-600">{order.shippingDetails.state}</p>
                    </div>

                    {/* Payment Method */}
                    {order.paymentMethod === 'bank-transfer' && (
                        <div className="bg-blue-50 rounded-2xl p-4 mb-8">
                            <h3 className="font-medium text-blue-900 mb-2">Complete Payment</h3>
                            <div className="text-sm text-blue-800 space-y-1">
                                <p><span className="font-medium">Bank:</span> GTBank</p>
                                <p><span className="font-medium">Account:</span> 0123456789</p>
                                <p><span className="font-medium">Reference:</span> {order.orderId}</p>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={onContinueShopping || (() => console.log('Continue shopping'))}
                            className="w-full bg-primary-700  text-white py-2 rounded font-medium hover:bg-primary-500 transition-colors flex items-center justify-center space-x-2"
                        >
                            <span>Continue Shopping</span>
                            <ArrowRight className="h-4 w-4" />
                        </button>
                        <button
                            onClick={onViewOrders || (() => console.log('View orders'))}
                            className="w-full border border-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                            View All Orders
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmationModal;