// src/components/checkout/PaymentMethodSelector.jsx
import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Truck, MapPin, Plus } from 'lucide-react';
import BankTransferPopup from './BankTransferPopup';

const PaymentMethodSelector = ({ 
    selectedMethod, 
    onMethodChange, 
    onShippingFeeChange, 
    onPaymentVerifiedChange,
    userId,
    isAuthenticated,
    onOrderComplete,
    showBankTransferPopup,
    onCloseBankTransferPopup,
    orderTotal,
    orderId
}) => {
    const [savedCards, setSavedCards] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userDefaultMethod, setUserDefaultMethod] = useState(null);

    // Default payment methods
    const defaultMethods = [
        { 
            id: 'card', 
            type: 'card', 
            name: 'Credit/Debit Card', 
            icon: CreditCard, 
            description: 'Pay with your card',
            fee: 0 
        },
        { 
            id: 'bank_transfer', 
            type: 'bank_transfer', 
            name: 'Bank Transfer', 
            icon: DollarSign, 
            description: 'Transfer to bank account',
            fee: 0 
        },
        { 
            id: 'pay_on_delivery', 
            type: 'pay_on_delivery', 
            name: 'Pay on Delivery', 
            icon: Truck, 
            description: 'Pay when order arrives',
            fee: 0
        },
        { 
            id: 'pay_at_pickup', 
            type: 'pay_at_pickup', 
            name: 'Pay at Pick Up', 
            icon: MapPin, 
            description: 'Pay when collecting order',
            fee: -3500 // Removes shipping fee
        }
    ];

    useEffect(() => {
        if (isAuthenticated && userId && !userId.startsWith('guest-')) {
            loadUserPaymentMethods();
        } else {
            setPaymentMethods(defaultMethods);
            setUserDefaultMethod(null);
        }
    }, [userId, isAuthenticated]);

    const loadUserPaymentMethods = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/users/payment-methods/${userId}`);
            
            if (response.ok) {
                const data = await response.json();
                setSavedCards(data.savedCards || []);
                setPaymentMethods(defaultMethods);
                
                if (data.defaultMethod) {
                    setUserDefaultMethod(data.defaultMethod.id);
                    if (!selectedMethod) {
                        onMethodChange(data.defaultMethod.id);
                    }
                } else if (data.savedCards?.[0]) {
                    const defaultId = `saved_card_${data.savedCards[0].id}`;
                    setUserDefaultMethod(defaultId);
                    if (!selectedMethod) {
                        onMethodChange(defaultId);
                    }
                }
            } else {
                setPaymentMethods(defaultMethods);
                setUserDefaultMethod(null);
            }
        } catch (error) {
            console.error('Error loading payment methods:', error);
            setPaymentMethods(defaultMethods);
            setUserDefaultMethod(null);
        } finally {
            setLoading(false);
        }
    };

    const handleMethodSelect = (methodId, methodType) => {
        onMethodChange(methodId);
        
        if (methodId.startsWith('saved_card_')) {
            onPaymentVerifiedChange(true);
            onShippingFeeChange(0);
        } else {
            const method = defaultMethods.find(m => m.id === methodId);
            if (method) {
                onPaymentVerifiedChange(method.type !== 'card');
                onShippingFeeChange(method.fee);
            }
        }
    };

    const handleAddNewCard = () => {
        window.open('/account/payment-methods', '_blank');
    };

    const handleBankTransferConfirmed = () => {
        onCloseBankTransferPopup();
        onOrderComplete && onOrderComplete();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(amount);
    };

    const getDefaultMethodName = () => {
        if (!userDefaultMethod) return null;
        
        if (userDefaultMethod.startsWith('saved_card_')) {
            const card = savedCards.find(c => `saved_card_${c.id}` === userDefaultMethod);
            return card ? `${card.cardType} Card ending in ${card.cardNumber.slice(-4)}` : null;
        } else {
            const method = defaultMethods.find(m => m.id === userDefaultMethod);
            return method ? method.name : null;
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-12 bg-gray-200 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    const shouldShowAddCard = selectedMethod === 'card' || selectedMethod?.startsWith('saved_card_');

    return (
        <>
            <div>
                <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
                
                {/* User's default method indicator */}
                {userDefaultMethod && getDefaultMethodName() && (
                    <div className="mb-4 p-3 rounded border border-blue-200 bg-blue-50">
                        <div className="flex items-center text-sm">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                            <span className="text-blue-800 font-medium">
                                Your default: {getDefaultMethodName()}
                            </span>
                        </div>
                    </div>
                )}

                {/* Payment Methods Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    {/* Saved Cards */}
                    {savedCards.length > 0 && (
                        <>
                            {savedCards.map(card => (
                                <label key={card.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer transition-colors">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value={`saved_card_${card.id}`}
                                        checked={selectedMethod === `saved_card_${card.id}`}
                                        onChange={() => handleMethodSelect(`saved_card_${card.id}`, 'saved_card')}
                                        className="mr-3 text-blue-600 focus:ring-blue-500"
                                    />
                                    <CreditCard className="w-5 h-5 text-gray-400 mr-3" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {card.cardType} {card.cardNumber}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Expires {card.expiryMonth}/{card.expiryYear}
                                        </p>
                                    </div>
                                    {card.isDefault && (
                                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                            Default
                                        </span>
                                    )}
                                </label>
                            ))}
                        </>
                    )}

                    {/* Default Payment Methods */}
                    {paymentMethods.map(method => {
                        const IconComponent = method.icon;
                        return (
                            <label key={method.id} className="flex items-center p-3 border border-gray-200 rounded hover:border-gray-300 cursor-pointer transition-colors">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value={method.id}
                                    checked={selectedMethod === method.id}
                                    onChange={() => handleMethodSelect(method.id, method.type)}
                                    className="mr-3 text-primary-700 focus:ring-primary-500"
                                />
                                <IconComponent className="w-5 h-5 text-gray-400 mr-3" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900">{method.name}</p>
                                    <p className="text-xs text-gray-500">{method.description}</p>
                                    {method.fee < 0 && (
                                        <p className="text-xs text-green-600">Free shipping</p>
                                    )}
                                </div>
                            </label>
                        );
                    })}
                </div>

                {/* Add New Card Option */}
                {isAuthenticated && shouldShowAddCard && (
                    <button
                        type="button"
                        onClick={handleAddNewCard}
                        className="flex items-center justify-center w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-sm text-gray-600 hover:text-gray-700 mb-4"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Card
                    </button>
                )}

                {/* Payment Method Instructions */}
                {selectedMethod === 'bank_transfer' && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs text-blue-800">
                            Bank details will be provided after order confirmation. 
                            Please complete transfer within 15 minutes to avoid cancellation.
                        </p>
                    </div>
                )}

                {selectedMethod === 'pay_at_pickup' && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-xs text-green-800">
                            No shipping fee. You'll receive pickup instructions after order confirmation.
                            Pickup location: Our store address.
                        </p>
                    </div>
                )}
            </div>

            {/* Bank Transfer Popup */}
            <BankTransferPopup
                isOpen={showBankTransferPopup}
                onClose={onCloseBankTransferPopup}
                orderTotal={orderTotal}
                orderId={orderId}
                onPaymentConfirmed={handleBankTransferConfirmed}
            />
        </>
    );
};

export default PaymentMethodSelector;