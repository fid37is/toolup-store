// src/components/checkout/OrderSummary.jsx
import { useRouter } from 'next/router';
import Image from 'next/image';

export default function OrderSummary({ 
    checkoutItems,
    subtotal,
    shippingFee,
    total,
    formData,
    isGuestCheckout
}) {
    const router = useRouter();
    
    // Function to get state name from state code
    const getStateName = (stateCode) => {
        // This would normally use the states array passed as prop
        // For simplicity, we return the state code
        return stateCode || 'Nigeria';
    };

    // Safe number conversion to prevent NaN
    const safeNumber = (value) => {
        const num = Number(value);
        return isNaN(num) ? 0 : num;
    };

    const safeSubtotal = safeNumber(subtotal);
    const safeShippingFee = safeNumber(shippingFee);
    const safeTotal = safeNumber(total);

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 border-b pb-2 text-xl font-semibold text-gray-800">Order Summary</h2>

            <div className="max-h-80 overflow-y-auto space-y-4 mb-4">
                {checkoutItems && checkoutItems.map((item, index) => (
                    <div key={index} className="flex items-center border-b border-gray-100 pb-4">
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded border border-gray-200 bg-gray-100">
                            {item.imageUrl && (
                                <Image
                                    src={item.imageUrl}
                                    alt={item.name || 'Product'}
                                    className="h-full w-full object-contain"
                                    width={25}
                                    height={25}
                                />
                            )}
                        </div>
                        <div className="ml-4 flex-1">
                            <h3 className="text-base font-medium text-gray-900">{item.name || 'Product'}</h3>
                            <p className="mt-1 text-sm text-gray-500">Qty: {safeNumber(item.quantity) || 1}</p>
                            {item.productId && (
                                <p className="mt-1 text-xs text-gray-400">ID: {item.productId}</p>
                            )}
                        </div>
                        <p className="text-right font-medium text-gray-900">
                            ₦{(safeNumber(item.price) * safeNumber(item.quantity)).toLocaleString()}
                        </p>
                    </div>
                ))}
            </div>

            <div className="space-y-3 border-b border-gray-200 pb-4">
                <div className="flex justify-between text-sm text-gray-600">
                    <p>Subtotal</p>
                    <p>₦{safeSubtotal.toLocaleString()}</p>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                    <p>Shipping to {getStateName(formData?.state)}</p>
                    <div className="text-right">
                        <p>₦{safeShippingFee.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">
                            {formData?.state && formData?.lga && formData?.town
                                ? `${formData.town}, ${formData.lga}`
                                : 'Standard rate'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-4 flex justify-between items-end">
                <div>
                    <p className="text-base font-medium text-gray-900">Total</p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">₦{safeTotal.toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
}