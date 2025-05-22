import { useState, useEffect } from 'react';
import { getCheckoutAddress } from '../services/addressService';

export const useCheckoutAddress = () => {
    const [checkoutData, setCheckoutData] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadDefaultAddress = async () => {
            try {
                const defaultAddress = await getCheckoutAddress();
                if (defaultAddress) {
                    setCheckoutData(defaultAddress);
                }
            } catch (error) {
                console.error('Error loading default address:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadDefaultAddress();
    }, []);

    return { checkoutData, isLoading, setCheckoutData };
};