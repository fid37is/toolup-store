import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatCurrency } from '../../utils/formatters';

const OrderItemCard = ({ item }) => {
    return (
        <div className="flex items-center border-b border-gray-200 py-4 last:border-b-0">
            <div className="h-16 w-16 relative mr-4 flex-shrink-0">
                {item.imageUrl ? (
                    <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-contain rounded-md"
                    />
                ) : (
                    <div className="h-full w-full bg-gray-200 rounded-md flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No image</span>
                    </div>
                )}
            </div>
            <div className="flex-grow">
                <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-500">
                    {formatCurrency(item.price)} × {item.quantity}
                </p>
            </div>
            <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(item.price * item.quantity)}
                </p>
            </div>
        </div>
    );
};

const OrderCard = ({ order, expandedView = false }) => {
    const [isExpanded, setIsExpanded] = useState(expandedView);

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
            <div className="p-4 flex justify-between items-center border-b border-gray-200">
                <div>
                    <p className="font-semibold text-gray-900">Order #{order.orderId}</p>
                    <p className="text-sm text-gray-500">
                        {new Date(order.orderDate).toLocaleDateString()}
                    </p>
                </div>
                <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(order.total)}</p>
                    <p className="text-sm px-2 py-1 rounded-full inline-block bg-blue-100 text-blue-800">
                        {order.status || 'Processing'}
                    </p>
                </div>
            </div>

            {isExpanded ? (
                <div className="p-4">
                    {order.items?.map((item, index) => (
                        <OrderItemCard key={index} item={item} />
                    ))}
                    <div className="mt-4 flex justify-between">
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="text-gray-500 text-sm hover:text-gray-700"
                        >
                            Show less
                        </button>
                        <Link
                            href={`/account/orders/${order.orderId}`}
                            className="text-blue-600 text-sm hover:text-blue-800 font-medium"
                        >
                            View details
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="p-4 flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                        {order.items?.length} {order.items?.length === 1 ? 'item' : 'items'}
                    </p>
                    <div className="flex space-x-4">
                        <button
                            onClick={() => setIsExpanded(true)}
                            className="text-gray-500 text-sm hover:text-gray-700"
                        >
                            Show items
                        </button>
                        <Link
                            href={`/account/orders/${order.orderId}`}
                            className="text-blue-600 text-sm hover:text-blue-800 font-medium"
                        >
                            View details
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderCard;