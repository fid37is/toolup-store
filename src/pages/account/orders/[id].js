import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import { getOrderById } from '../../../services/orderService';
import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency } from '../../../utils/formatters';
import LoadingSpinner from '../../../components/LoadingSpinner';

const OrderDetail = () => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();
    const { id } = router.query;

    useEffect(() => {
        async function fetchOrder() {
            if (!id) return;

            try {
                setLoading(true);
                const orderData = await getOrderById(id);
                setOrder(orderData);
            } catch (err) {
                console.error('Failed to fetch order:', err);
                setError('Failed to load order details. Please try again.');
            } finally {
                setLoading(false);
            }
        }

        fetchOrder();
    }, [id]);

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner />
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="text-center py-8">
                    <p className="text-red-500 mb-4">{error}</p>
                    <Link href="/account/orders" className="text-blue-600 hover:underline">
                        Return to Orders
                    </Link>
                </div>
            </Layout>
        );
    }

    if (!order) {
        return (
            <Layout>
                <div className="text-center py-8">
                    <p>Order not found</p>
                    <Link href="/account/orders" className="text-blue-600 hover:underline">
                        Return to Orders
                    </Link>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Order #{order.orderId}</h1>
                    <Link href="/account/orders" className="text-blue-600 hover:underline">
                        Back to Orders
                    </Link>
                </div>

                <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <h2 className="font-semibold text-gray-700">Order Information</h2>
                            <p className="text-gray-600">Date: {new Date(order.orderDate).toLocaleDateString()}</p>
                            <p className="text-gray-600">Status: {order.status || 'Processing'}</p>
                            <p className="text-gray-600">Total: {formatCurrency(order.total)}</p>
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-700">Shipping Address</h2>
                            {order.shippingAddress ? (
                                <div className="text-gray-600">
                                    <p>{order.shippingAddress.name}</p>
                                    <p>{order.shippingAddress.street}</p>
                                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                                    <p>{order.shippingAddress.country}</p>
                                </div>
                            ) : (
                                <p className="text-gray-600">No shipping address provided</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <h2 className="font-semibold text-gray-700 mb-4">Order Items</h2>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Product
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Quantity
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Subtotal
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {order.items && order.items.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {item.imageUrl && (
                                                        <div className="h-16 w-16 relative mr-4">
                                                            <Image
                                                                src={item.imageUrl}
                                                                alt={item.name}
                                                                fill
                                                                sizes="64px"
                                                                className="object-contain"
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                                        <div className="text-sm text-gray-500">ID: {item.productId}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatCurrency(item.price)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {item.quantity}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatCurrency(item.price * item.quantity)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50">
                                    <tr>
                                        <td colSpan="3" className="px-6 py-4 text-right font-medium">
                                            Total:
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {formatCurrency(order.total)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default OrderDetail;