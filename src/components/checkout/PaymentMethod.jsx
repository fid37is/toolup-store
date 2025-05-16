// src/components/checkout/PaymentMethod.jsx

export default function PaymentMethod({ paymentMethod, setPaymentMethod }) {
    const methods = [
        { value: 'card', label: 'Card Payment (Coming Soon)', disabled: true },
        { value: 'bank_transfer', label: 'Bank Transfer' },
        { value: 'pay_on_delivery', label: 'Pay on Delivery' },
        { value: 'pay_on_pickup', label: 'Pay on Pickup' }
    ];

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">Payment Method</h2>
            <div className="space-y-3">
                {methods.map(method => (
                    <label key={method.value} className="flex items-center space-x-3">
                        <input
                            type="radio"
                            name="paymentMethod"
                            value={method.value}
                            checked={paymentMethod === method.value}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            disabled={method.disabled}
                            className="h-4 w-4"
                        />
                        <span className={`${method.disabled ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                            {method.label}
                        </span>
                    </label>
                ))}
            </div>
        </div>
    );
}
