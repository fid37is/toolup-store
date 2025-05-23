import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Check, Trash2, DollarSign, Truck, MapPin, Clock, ArrowLeft } from 'lucide-react';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import { useRouter } from 'next/router';

const PaymentMethodsPage = () => {
    const router = useRouter()
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [savedCards, setSavedCards] = useState([]); // Fixed: Initialize as empty array instead of undefined
    const [showAddCard, setShowAddCard] = useState(false);
    const [newCard, setNewCard] = useState({
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        holderName: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    // Initialize payment methods with default options
    useEffect(() => {
        const defaultMethods = [
            { id: 'card', type: 'card', name: 'Card Payment', icon: CreditCard, isDefault: false },
            { id: 'bank_transfer', type: 'bank_transfer', name: 'Bank Transfer', icon: DollarSign, isDefault: false },
            { id: 'pay_on_delivery', type: 'pay_on_delivery', name: 'Pay on Delivery', icon: Truck, isDefault: true },
            { id: 'pay_at_pickup', type: 'pay_at_pickup', name: 'Pay at Pick Up', icon: MapPin, isDefault: false }
        ];
        setPaymentMethods(defaultMethods);
    }, []);

    const handleSetDefault = async (methodId, methodType) => {
        try {
            // Update UI optimistically
            if (methodType === 'card') {
                setSavedCards(prev => prev.map(card => ({
                    ...card,
                    isDefault: card.id === methodId
                })));
                setPaymentMethods(prev => prev.map(method => ({
                    ...method,
                    isDefault: method.type === 'card' && methodId
                })));
            } else {
                setPaymentMethods(prev => prev.map(method => ({
                    ...method,
                    isDefault: method.id === methodId
                })));
                setSavedCards(prev => prev.map(card => ({
                    ...card,
                    isDefault: false
                })));
            }

            // Persist to database (only for authenticated users)
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user.id) {
                await fetch(`/api/users/payment-methods/${user.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        defaultMethodId: methodId,
                        defaultMethodType: methodType
                    })
                });
            }
        } catch (error) {
            console.error('Error updating default payment method:', error);
            // Could add notification here if needed
        }
    };


    const handleAddCard = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            const cardId = `card${Date.now()}`;
            const newCardData = {
                id: cardId,
                type: 'card',
                cardNumber: `****${newCard.cardNumber.slice(-4)}`,
                cardType: detectCardType(newCard.cardNumber),
                expiryMonth: newCard.expiryMonth,
                expiryYear: newCard.expiryYear,
                holderName: newCard.holderName,
                isDefault: savedCards.length === 0,
                createdAt: new Date().toISOString()
            };

            setSavedCards(prev => [...prev, newCardData]);
            setNewCard({ cardNumber: '', expiryMonth: '', expiryYear: '', cvv: '', holderName: '' });
            setShowAddCard(false);
        } catch (error) {
            console.error('Error adding card:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const detectCardType = (cardNumber) => {
        const firstDigit = cardNumber.charAt(0);
        if (firstDigit === '4') return 'Visa';
        if (firstDigit === '5') return 'Mastercard';
        return 'Card';
    };

    const handleDeleteCard = (cardId) => {
        setSavedCards(prev => prev.filter(card => card.id !== cardId));
    };

    const getDefaultPaymentMethod = () => {
        const defaultCard = savedCards.find(card => card.isDefault);
        if (defaultCard) {
            return { type: 'card', method: defaultCard };
        }
        const defaultMethod = paymentMethods.find(method => method.isDefault);
        return { type: 'method', method: defaultMethod };
    };

    return (
        <>
            <Header />
            <main className="container max-w-6xl mx-auto px-4 py-8 bg-gray-50 min-h-screen">
                {/* Header */}
                {/* Mobile Layout - Stack vertically */}
                <div className="block md:hidden mb-6">
                    {/* Back button */}
                    <div className="mb-4">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center text-primary-700 hover:text-primary-500 transition-all duration-200 font-medium bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md border border-gray-200"
                        >
                            <span className="mr-2 text-lg">←</span> Back
                        </button>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-4">
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">
                            Payment Methods
                        </h1>
                        <div className="flex items-center justify-center">
                            <div className="h-1 w-16 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* Desktop Layout - Grid */}
                <div className="hidden md:flex items-center justify-between mb-6">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-primary-700 hover:text-primary-500 transition-all duration-200 font-medium bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md border border-gray-200"
                    >
                        <span className="mr-2 text-lg">←</span> Back
                    </button>

                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-800 mb-2">
                            Payment Methods
                        </h1>
                        <div className="flex items-center justify-center">
                            <div className="h-1 w-16 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"></div>
                        </div>
                    </div>

                    <div className="w-20"></div> {/* Spacer for centering */}
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Current Default - Compact Display */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                <span className="text-sm font-medium text-gray-700">Default:</span>
                            </div>
                            {(() => {
                                const defaultInfo = getDefaultPaymentMethod();
                                if (defaultInfo.type === 'card') {
                                    const card = defaultInfo.method;
                                    return (
                                        <div className="flex items-center text-sm text-gray-900">
                                            <CreditCard className="w-4 h-4 mr-2" />
                                            {card.cardType} {card.cardNumber}
                                        </div>
                                    );
                                } else {
                                    const method = defaultInfo.method;
                                    const IconComponent = method?.icon || Clock;
                                    return (
                                        <div className="flex items-center text-sm text-gray-900">
                                            <IconComponent className="w-4 h-4 mr-2" />
                                            {method?.name}
                                        </div>
                                    );
                                }
                            })()}
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Saved Cards */}
                        <div className="bg-white rounded-lg border border-gray-200">
                            <div className="p-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-medium text-gray-900">Saved Cards</h2>
                                    <button
                                        onClick={() => setShowAddCard(true)}
                                        className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        <Plus className="w-4 h-4 mr-1" />
                                        Add Card
                                    </button>
                                </div>
                            </div>

                            <div className="p-4">
                                {savedCards.length === 0 && !showAddCard ? (
                                    <div className="text-center py-8">
                                        <CreditCard className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                                        <p className="text-gray-500 text-sm">No saved cards</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {savedCards.map(card => (
                                            <div key={card.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                                                <div className="flex items-center min-w-0 flex-1">
                                                    <CreditCard className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                                                    <div className="min-w-0">
                                                        <div className="flex items-center">
                                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                                {card.cardType} {card.cardNumber}
                                                            </p>
                                                            {card.isDefault && (
                                                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                                    Default
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-500">
                                                            Expires {card.expiryMonth}/{card.expiryYear}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2 ml-4">
                                                    {!card.isDefault && (
                                                        <button
                                                            onClick={() => handleSetDefault(card.id, 'card')}
                                                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                                        >
                                                            Set Default
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteCard(card.id)}
                                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Add Card Form - Compact */}
                                {showAddCard && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                <input
                                                    type="text"
                                                    placeholder="Card Number"
                                                    maxLength="19"
                                                    value={newCard.cardNumber}
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                                                        const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                                                        setNewCard(prev => ({ ...prev, cardNumber: value }));
                                                        e.target.value = formatted;
                                                    }}
                                                    className="col-span-2 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                <select
                                                    value={newCard.expiryMonth}
                                                    onChange={(e) => setNewCard(prev => ({ ...prev, expiryMonth: e.target.value }))}
                                                    className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value="">Month</option>
                                                    {Array.from({ length: 12 }, (_, i) => (
                                                        <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                                                            {String(i + 1).padStart(2, '0')}
                                                        </option>
                                                    ))}
                                                </select>
                                                <select
                                                    value={newCard.expiryYear}
                                                    onChange={(e) => setNewCard(prev => ({ ...prev, expiryYear: e.target.value }))}
                                                    className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value="">Year</option>
                                                    {Array.from({ length: 10 }, (_, i) => {
                                                        const year = new Date().getFullYear() + i;
                                                        return (
                                                            <option key={year} value={String(year).slice(-2)}>
                                                                {year}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                                <input
                                                    type="text"
                                                    placeholder="CVV"
                                                    maxLength="4"
                                                    value={newCard.cvv}
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                                        setNewCard(prev => ({ ...prev, cvv: value }));
                                                    }}
                                                    className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Cardholder Name"
                                                    value={newCard.holderName}
                                                    onChange={(e) => setNewCard(prev => ({ ...prev, holderName: e.target.value }))}
                                                    className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                            <div className="flex justify-end space-x-2 pt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowAddCard(false)}
                                                    className="px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleAddCard}
                                                    disabled={isLoading}
                                                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                                                >
                                                    {isLoading ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                                            Adding...
                                                        </>
                                                    ) : (
                                                        'Add Card'
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payment Options */}
                        <div className="bg-white rounded-lg border border-gray-200">
                            <div className="p-4 border-b border-gray-200">
                                <h2 className="text-lg font-medium text-gray-900">Payment Options</h2>
                            </div>
                            <div className="p-4">
                                <div className="space-y-3">
                                    {paymentMethods.map(method => {
                                        const IconComponent = method.icon;
                                        return (
                                            <div key={method.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                                                <div className="flex items-center">
                                                    <IconComponent className="w-5 h-5 text-gray-400 mr-3" />
                                                    <div>
                                                        <div className="flex items-center">
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {method.name}
                                                            </p>
                                                            {method.isDefault && (
                                                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                                    Default
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-500">
                                                            {method.type === 'bank_transfer' && 'Transfer to bank account'}
                                                            {method.type === 'pay_on_delivery' && 'Pay when order arrives'}
                                                            {method.type === 'pay_at_pickup' && 'Pay when collecting order'}
                                                            {method.type === 'card' && 'Credit or debit card'}
                                                        </p>
                                                    </div>
                                                </div>
                                                {!method.isDefault && (
                                                    <button
                                                        onClick={() => handleSetDefault(method.id, method.type)}
                                                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                                    >
                                                        Set Default
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Simple Info Note */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800">
                            Your default payment method will be pre-selected at checkout. You can change it during the order process if needed.
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default PaymentMethodsPage;