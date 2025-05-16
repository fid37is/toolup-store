import { useState, useEffect } from 'react';

export default function PaymentMethod({ paymentMethod, setPaymentMethod, setPaymentVerified }) {
    const [showBankDetails, setShowBankDetails] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(15 * 60); // 15 minutes in seconds
    const [timerActive, setTimerActive] = useState(false);
    const [hasPaid, setHasPaid] = useState(false);
    
    // Fake account details for bank transfer
    const bankDetails = {
        accountName: "ToolUp Store",
        accountNumber: "0123456789",
        bankName: "First Bank",
    };
    
    // Set default payment method to "pay_on_pickup" on component mount
    useEffect(() => {
        if (paymentMethod !== 'pay_on_pickup') {
            setPaymentMethod('pay_on_pickup');
        }
    }, []);
    
    // Show/hide bank details based on selected payment method
    useEffect(() => {
        if (paymentMethod === 'bank_transfer') {
            setShowBankDetails(true);
            setTimerActive(true);
            // Reset payment verification when switching to bank transfer
            setHasPaid(false);
            if (setPaymentVerified) setPaymentVerified(false);
        } else {
            setShowBankDetails(false);
            setTimerActive(false);
            // Auto-verify other payment methods
            if (setPaymentVerified) setPaymentVerified(true);
        }
    }, [paymentMethod]);
    
    // Countdown timer for bank transfer
    useEffect(() => {
        let interval;
        
        if (timerActive && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining(prev => prev - 1);
            }, 1000);
        } else if (timeRemaining === 0) {
            setTimerActive(false);
        }
        
        return () => clearInterval(interval);
    }, [timerActive, timeRemaining]);
    
    // Format time as MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    
    // Handle "I have paid" button click
    const handlePaymentConfirmation = () => {
        setHasPaid(true);
        setTimerActive(false); // Stop the countdown timer
        if (setPaymentVerified) setPaymentVerified(true);
    };

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
            
            {/* Bank transfer details */}
            {showBankDetails && (
                <div className="mt-4 rounded-md bg-blue-50 p-4">
                    <h3 className="mb-2 font-medium text-blue-800">Bank Transfer Details</h3>
                    <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Bank Name:</span> {bankDetails.bankName}</p>
                        <p><span className="font-medium">Account Name:</span> {bankDetails.accountName}</p>
                        <p><span className="font-medium">Account Number:</span> {bankDetails.accountNumber}</p>
                                                    <div className="mt-3 flex items-center justify-between border-t border-blue-200 pt-3">
                            {!hasPaid && (
                                <div className="text-red-600">
                                    Time remaining: <span className="font-bold">{formatTime(timeRemaining)}</span>
                                </div>
                            )}
                            {hasPaid ? (
                                <div className="text-green-600 font-medium w-full text-center">
                                    Payment Confirmed - Thank You!
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handlePaymentConfirmation}
                                    className="rounded px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    I Have Paid
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}