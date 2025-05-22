// src/components/checkout/OrderConfirmationModal.jsx
import React from 'react';
import Image from 'next/image';
import { X, Check, Package, MapPin, CreditCard, Calendar } from 'lucide-react';

const OrderConfirmationModal = ({ 
    orderDetails, 
    onClose, 
    onContinueShopping, 
    onViewOrders 
}) => {
    if (!orderDetails) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                {/* Backdrop */}
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                    onClick={onClose}
                ></div>

                {/* Modal */}
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-full overflow-y-auto">
                    {/* Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-green-100 rounded-full">
                                    <Check className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Order Confirmed!</h2>
                                    <p className="text-sm text-gray-600">Thank you for your purchase</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="h-6 w-6 text-gray-400" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {/* Success Message */}
                        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-r-lg">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <Package className="h-5 w-5 text-green-500" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-green-800 font-medium">
                                        Your order has been placed successfully!
                                    </p>
                                    <p className="text-green-700 text-sm mt-1">
                                        We've received your order and are processing it now. You'll receive updates via email.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Order Info Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Order Details */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center space-x-2 mb-3">
                                    <Package className="h-5 w-5 text-blue-600" />
                                    <h3 className="font-semibold text-gray-800">Order Information</h3>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Order ID:</span>
                                        <span className="font-medium text-gray-900">{orderDetails.orderId}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Date:</span>
                                        <span className="font-medium text-gray-900">
                                            {new Date(orderDetails.orderDate).toLocaleDateString('en-NG', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Status:</span>
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {orderDetails.status.charAt(0).toUpperCase() + orderDetails.status.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center space-x-2 mb-3">
                                    <CreditCard className="h-5 w-5 text-blue-600" />
                                    <h3 className="font-semibold text-gray-800">Payment Method</h3>
                                </div>
                                <div className="text-sm">
                                    <p className="font-medium text-gray-900 mb-2">
                                        {orderDetails.paymentMethod === 'bank-transfer' ? 'Bank Transfer' : 'Cash on Delivery'}
                                    </p>
                                    {orderDetails.paymentMethod === 'bank-transfer' && (
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                            <p className="text-yellow-800 font-medium text-xs mb-2">Bank Transfer Details:</p>
                                            <div className="text-xs text-yellow-700 space-y-1">
                                                <p><span className="font-medium">Bank:</span> Your Bank Name</p>
                                                <p><span className="font-medium">Account:</span> 0123456789</p>
                                                <p><span className="font-medium">Name:</span> Your Store Name</p>
                                                <p className="text-xs text-yellow-600 mt-2 p-2 bg-yellow-100 rounded">
                                                    Include Order ID: <span className="font-mono font-bold">{orderDetails.orderId}</span> in payment reference
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-gray-50 rounded-xl p-4 mb-6">
                            <div className="flex items-center space-x-2 mb-3">
                                <MapPin className="h-5 w-5 text-blue-600" />
                                <h3 className="font-semibold text-gray-800">Shipping Address</h3>
                            </div>
                            <div className="text-sm text-gray-700">
                                <p className="font-medium">{orderDetails.shippingDetails.fullName}</p>
                                <p>{orderDetails.shippingDetails.phone}</p>
                                <p>{orderDetails.shippingDetails.email}</p>
                                <p className="mt-2">{orderDetails.shippingDetails.address}</p>
                                <p>
                                    {orderDetails.shippingDetails.lga && `${orderDetails.shippingDetails.lga}, `}
                                    {orderDetails.shippingDetails.state}
                                </p>
                                {orderDetails.shippingDetails.additionalInfo && (
                                    <p className="text-gray-600 mt-1">{orderDetails.shippingDetails.additionalInfo}</p>
                                )}
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                <h3 className="font-semibold text-gray-800">Order Items</h3>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {orderDetails.items.map((item, index) => (
                                    <div key={index} className="p-4 flex items-center space-x-4">
                                        {item.imageUrl && (
                                            <div className="flex-shrink-0">
                                                <Image
                                                    src={item.imageUrl}
                                                    alt={item.name}
                                                    width={64}
                                                    height={64}
                                                    className="h-16 w-16 object-cover rounded-lg"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-medium text-gray-900 truncate">
                                                {item.name}
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                Quantity: {item.quantity}
                                            </p>
                                        </div>
                                        <div className="text-sm font-medium text-gray-900">
                                            ₦{(item.price * item.quantity).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Order Summary */}
                            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-medium">
                                            ₦{(orderDetails.total - orderDetails.shippingFee).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Shipping</span>
                                        <span className="font-medium">₦{orderDetails.shippingFee.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2">
                                        <span>Total</span>
                                        <span>₦{orderDetails.total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Next Steps */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                            <div className="flex items-center space-x-2 mb-3">
                                <Calendar className="h-5 w-5 text-blue-600" />
                                <h3 className="font-semibold text-blue-800">What's Next?</h3>
                            </div>
                            <div className="text-sm text-blue-700 space-y-2">
                                <div className="flex items-start space-x-2">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></div>
                                    <p>We'll send you an email confirmation with your order details</p>
                                </div>
                                <div className="flex items-start space-x-2">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></div>
                                    <p>Your order will be processed and prepared for shipping</p>
                                </div>
                                <div className="flex items-start space-x-2">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></div>
                                    <p>You'll receive tracking information once your order ships</p>
                                </div>
                                {orderDetails.paymentMethod === 'bank-transfer' && (
                                    <div className="flex items-start space-x-2">
                                        <div className="w-2 h-2 bg-yellow-400 rounded-full mt-1.5 flex-shrink-0"></div>
                                        <p className="text-yellow-700">
                                            <span className="font-medium">Important:</span> Please complete your bank transfer to process your order
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl">
                        <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
                            <button
                                onClick={onViewOrders}
                                className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                View All Orders
                            </button>
                            <button
                                onClick={onContinueShopping}
                                className="flex items-center justify-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmationModal;