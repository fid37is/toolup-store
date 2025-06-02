/* eslint-disable react-hooks/exhaustive-deps */
// hooks/usePaymentMethods.js
import { useState, useEffect } from 'react';

export const usePaymentMethods = (userId, isAuthenticated) => {
    const [paymentMethod, setPaymentMethod] = useState('pay_on_delivery');
    const [paymentVerified, setPaymentVerified] = useState(true);
    const [shippingFee, setShippingFee] = useState(3500);
    const [baseShippingFee, setBaseShippingFee] = useState(3500);

    const calculateShippingFeeAdjustment = (paymentMethod, baseShippingFee) => {
        switch (paymentMethod) {
            case 'pay_on_delivery':
                return baseShippingFee;
            case 'pay_at_pickup':
                return 0;
            default:
                return baseShippingFee;
        }
    };

    const handlePaymentMethodChange = (newMethod) => {
        setPaymentMethod(newMethod);

        // Calculate new shipping fee
        const newShippingFee = calculateShippingFeeAdjustment(newMethod, baseShippingFee);
        setShippingFee(newShippingFee);

        // Update payment verification status
        if (newMethod.startsWith('saved_card_') ||
            newMethod === 'bank_transfer' ||
            newMethod === 'pay_on_delivery' ||
            newMethod === 'pay_at_pickup') {
            setPaymentVerified(true);
        } else if (newMethod === 'card') {
            setPaymentVerified(false);
        }
    };

    const handleShippingFeeChange = (feeAdjustment) => {
        if (feeAdjustment < 0) {
            setShippingFee(0);
        } else {
            setShippingFee(baseShippingFee + feeAdjustment);
        }
    };

    const loadUserDefaultPaymentMethod = async (userIdParam) => {
        try {
            const response = await fetch(`/api/users/payment-methods/${userIdParam}`);
            if (response.ok) {
                const data = await response.json();
                const { paymentMethods = [], savedCards = [] } = data;

                const defaultCard = savedCards.find(card => card.isDefault);
                const defaultMethod = paymentMethods.find(method => method.isDefault);

                if (defaultCard) {
                    setPaymentMethod(`saved_card_${defaultCard.id}`);
                    setShippingFee(baseShippingFee);
                    setPaymentVerified(true);
                } else if (defaultMethod) {
                    switch (defaultMethod.type) {
                        case 'card':
                            setPaymentMethod('card');
                            setShippingFee(baseShippingFee);
                            setPaymentVerified(false);
                            break;
                        case 'bank_transfer':
                            setPaymentMethod('bank_transfer');
                            setShippingFee(baseShippingFee);
                            setPaymentVerified(true);
                            break;
                        case 'pay_on_delivery':
                            setPaymentMethod('pay_on_delivery');
                            setShippingFee(baseShippingFee);
                            setPaymentVerified(true);
                            break;
                        case 'pay_at_pickup':
                            setPaymentMethod('pay_at_pickup');
                            setShippingFee(0);
                            setPaymentVerified(true);
                            break;
                        default:
                            setPaymentMethod('pay_on_delivery');
                            setShippingFee(baseShippingFee);
                            setPaymentVerified(true);
                    }
                } else {
                    setPaymentMethod('pay_on_delivery');
                    setShippingFee(baseShippingFee);
                    setPaymentVerified(true);
                }
            } else {
                setPaymentMethod('pay_on_delivery');
                setShippingFee(baseShippingFee);
                setPaymentVerified(true);
            }
        } catch (error) {
            console.error('Error loading user payment methods:', error);
            setPaymentMethod('pay_on_delivery');
            setShippingFee(baseShippingFee);
            setPaymentVerified(true);
        }
    };

    useEffect(() => {
        if (userId && isAuthenticated) {
            loadUserDefaultPaymentMethod(userId);
        }
    }, [userId, isAuthenticated]);

    return {
        paymentMethod,
        paymentVerified,
        shippingFee,
        baseShippingFee,
        setShippingFee,
        setBaseShippingFee,
        setPaymentVerified,
        handlePaymentMethodChange,
        handleShippingFeeChange
    };
};