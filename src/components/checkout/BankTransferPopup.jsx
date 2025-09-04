// src/components/checkout/BankTransferPopup.jsx
import React, { useState, useEffect } from 'react';
import { Clock, X, Copy, CheckCircle } from 'lucide-react';

const BankTransferPopup = ({ 
    isOpen, 
    onClose, 
    orderTotal,
    onPaymentConfirmed,
    orderId 
}) => {
    const [transferTimer, setTransferTimer] = useState(15 * 60); // 15 minutes in seconds
    const [timerActive, setTimerActive] = useState(false);
    const [copiedField, setCopiedField] = useState(null);

    // Timer effect
    useEffect(() => {
        let interval;
        if (timerActive && transferTimer > 0) {
            interval = setInterval(() => {
                setTransferTimer(prev => prev - 1);
            }, 1000);
        } else if (transferTimer === 0 && timerActive) {
            handleTransferTimeout();
        }
        return () => clearInterval(interval);
    }, [timerActive, transferTimer]);

    // Reset timer when popup opens
    useEffect(() => {
        if (isOpen) {
            setTransferTimer(15 * 60);
            setTimerActive(true);
        } else {
            setTimerActive(false);
        }
    }, [isOpen]);

    const handleTransferTimeout = () => {
        setTimerActive(false);
        onClose();
        alert('Transfer time expired. Order has been cancelled. Please try again.');
    };

    const handlePaymentConfirmation = () => {
        // For now, just call the callback without actual verification
        // The actual payment verification implementation can be added later
        setTimerActive(false);
        onPaymentConfirmed && onPaymentConfirmed();
    };

    const copyToClipboard = async (text, fieldName) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(fieldName);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(amount);
    };

    const bankDetails = [
        { label: 'Bank Name', value: 'Access Bank', copyable: false },
        { label: 'Account Number', value: '1234567890', copyable: true },
        { label: 'Account Name', value: 'Your Store Name', copyable: true, alignColumn: true },
        { label: 'Amount', value: formatCurrency(orderTotal || 0), copyable: false, alignColumn: true }
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-sm w-full shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Bank Transfer</h3>
                        {orderId && (
                            <p className="text-xs text-gray-500 mt-1">Order ID: {orderId}</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4">
                    {/* Timer */}
                    <div className={`mb-4 p-3 rounded-lg border ${
                        transferTimer <= 300 
                            ? 'bg-gradient-to-r from-red-50 to-orange-50 border-red-100' 
                            : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100'
                    }`}>
                        <div className="flex items-center justify-center">
                            <Clock className={`w-4 h-4 mr-2 ${
                                transferTimer <= 300 ? 'text-red-600' : 'text-blue-600'
                            }`} />
                            <span className={`font-mono text-xl font-bold ${
                                transferTimer <= 300 ? 'text-red-800' : 'text-blue-800'
                            }`}>
                                {formatTime(transferTimer)}
                            </span>
                        </div>
                        <p className={`text-xs text-center mt-1 ${
                            transferTimer <= 300 ? 'text-red-700' : 'text-blue-700'
                        }`}>
                            Complete transfer before time expires
                        </p>
                    </div>

                    {/* Bank Details */}
                    <div className="space-y-2 mb-6">
                        {bankDetails.map((detail, index) => (
                            <div key={index} className={`p-2 bg-gray-50 rounded-lg ${
                                detail.alignColumn ? 'flex flex-col items-start' : 'flex items-center justify-between'
                            }`}>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500 font-medium">{detail.label}</p>
                                    <p className="text-sm font-semibold text-gray-900">{detail.value}</p>
                                </div>
                                {detail.copyable && (
                                    <button
                                        onClick={() => copyToClipboard(detail.value, detail.label)}
                                        className={`p-1 text-gray-400 hover:text-gray-600 transition-colors ${
                                            detail.alignColumn ? 'self-end -mt-6' : 'ml-2'
                                        }`}
                                        title={`Copy ${detail.label}`}
                                    >
                                        {copiedField === detail.label ? (
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                        ) : (
                                            <Copy className="w-4 h-4" />
                                        )}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={handlePaymentConfirmation}
                        disabled={transferTimer === 0}
                        className="w-full bg-primary-700 text-white py-3 px-4 rounded-lg hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                        I have completed the transfer
                    </button>

                    {/* Instructions */}
                    <div className="mt-4">
                        <p className="text-xs text-gray-500 text-center">
                            Transfer the exact amount to avoid delays
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BankTransferPopup;