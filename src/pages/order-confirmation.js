import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function OrderConfirmation() {
    const router = useRouter();
    const { orderId } = router.query;
    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!orderId) return;

            try {
                const response = await fetch(`/api/orders/${orderId}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch order details');
                }

                const data = await response.json();
                setOrderDetails(data);
            } catch (err) {
                console.error('Error fetching order details:', err);
                setError('Could not load order details. Please check your order ID.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId]);

    if (loading) {
        return (
            <div title="Order Confirmation">
                <div className="max-w-4xl mx-auto p-4 min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p>Loading order details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div title="Order Confirmation">
                <div className="max-w-4xl mx-auto p-4 min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                        <Link href="/" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md">
                            Return to Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (!orderDetails) return null;

    const { items, shippingDetails, paymentMethod, total, status, orderDate } = orderDetails;
    const formattedDate = new Date(orderDate).toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div title="Order Confirmation">
            <div className="max-w-4xl mx-auto p-4">
                <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h2 className="text-lg font-medium text-green-800">Order Placed Successfully!</h2>
                            <p className="text-green-700">Thank you for your order. We&apos;ve received your order and are processing it now.</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold">Order Details</h1>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <h2 className="font-semibold text-gray-800 mb-2">Order Information</h2>
                            <p><span className="text-gray-600">Order ID:</span> {orderId}</p>
                            <p><span className="text-gray-600">Date:</span> {formattedDate}</p>
                            <p>
                                <span className="text-gray-600">Payment Method:</span>{' '}
                                {paymentMethod === 'bank-transfer' ? 'Bank Transfer' : 'Cash on Delivery'}
                            </p>
                            {paymentMethod === 'bank-transfer' && (
                                <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm">
                                    <p className="font-medium">Bank Transfer Details:</p>
                                    <p>Bank Name: Your Bank Name</p>
                                    <p>Account Number: 0123456789</p>
                                    <p>Account Name: Your Store Name</p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        Please include your Order ID ({orderId}) in the payment reference
                                    </p>
                                </div>
                            )}
                        </div>

                        <div>
                            <h2 className="font-semibold text-gray-800 mb-2">Shipping Address</h2>
                            <p>{shippingDetails.fullName}</p>
                            <p>{shippingDetails.phone}</p>
                            <p>{shippingDetails.email}</p>
                            <p>{shippingDetails.address}</p>
                            <p>{shippingDetails.lga}, {shippingDetails.state}</p>
                            {shippingDetails.additionalInfo && <p>{shippingDetails.additionalInfo}</p>}
                        </div>
                    </div>

                    <h2 className="font-semibold text-gray-800 mb-3">Order Items</h2>
                    <div className="border rounded-lg overflow-hidden mb-6">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Product
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Quantity
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Price
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {items.map((item, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {item.imageUrl && (
                                                    <div className="flex-shrink-0 h-10 w-10 mr-4">
                                                        <Image className="h-10 w-10 object-cover rounded-md" src={item.imageUrl} alt={item.name} />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                            {item.quantity}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                            ₦{(item.price * item.quantity).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-50">
                                <tr>
                                    <td colSpan="2" className="px-6 py-4 text-right font-medium">Total</td>
                                    <td className="px-6 py-4 text-right font-bold">₦{total.toLocaleString()}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div className="flex justify-between items-center">
                        <Link href="/account/orders" className="text-blue-600 hover:text-blue-800">
                            View All Orders
                        </Link>
                        <Link href="/" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}