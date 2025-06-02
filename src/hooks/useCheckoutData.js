/* eslint-disable react-hooks/exhaustive-deps */
// hooks/useCheckoutData.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { notifyEvent } from '../components/Notification';

export const useCheckoutData = () => {
    const router = useRouter();
    const { mode } = router.query;
    
    const [checkoutItems, setCheckoutItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [subtotal, setSubtotal] = useState(0);

    const loadCheckoutItems = async () => {
        try {
            let items = [];

            if (mode === 'direct') {
                // Direct checkout from product page
                const directItem = JSON.parse(localStorage.getItem('directPurchaseItem') || 'null');
                if (directItem) {
                    try {
                        const response = await fetch(`/api/products/${directItem.productId}`);
                        if (response.ok) {
                            const currentProduct = await response.json();
                            items = [{
                                ...directItem,
                                price: currentProduct.price,
                                name: currentProduct.name,
                                imageUrl: currentProduct.imageUrl,
                                quantity: directItem.quantity
                            }];
                        } else {
                            items = [directItem];
                        }
                    } catch (error) {
                        console.error('Error fetching current product data:', error);
                        items = [directItem];
                    }
                }
            } else {
                // Regular checkout from cart
                const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');

                const updatedItems = await Promise.all(
                    cartItems.map(async (item) => {
                        try {
                            const response = await fetch(`/api/products/${item.productId}`);
                            if (response.ok) {
                                const currentProduct = await response.json();
                                return {
                                    ...item,
                                    price: currentProduct.price,
                                    name: currentProduct.name,
                                    imageUrl: currentProduct.imageUrl,
                                    quantity: item.quantity
                                };
                            }
                        } catch (error) {
                            console.error(`Error fetching product ${item.productId}:`, error);
                        }
                        return item;
                    })
                );

                items = updatedItems;
            }

            // Ensure each item has productId
            items = items.map(item => {
                if (!item.productId && item.id) {
                    return { ...item, productId: item.id };
                }
                if (!item.productId && !item.id) {
                    return { ...item, productId: item.name.replace(/\s+/g, '-').toLowerCase() };
                }
                return item;
            });

            setCheckoutItems(items);
            
            // Calculate subtotal
            const calculatedSubtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            setSubtotal(calculatedSubtotal);
            
        } catch (error) {
            console.error('Error loading checkout items:', error);
            notifyEvent('Error loading checkout items. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (router.isReady) {
            loadCheckoutItems();
        }
    }, [router.isReady, mode]);

    // Redirect if no items to checkout
    useEffect(() => {
        if (!isLoading && checkoutItems.length === 0) {
            notifyEvent('No items to checkout. Redirecting to home page.', 'warning');
            router.push('/');
        }
    }, [isLoading, checkoutItems.length, router]);

    return {
        checkoutItems,
        isLoading,
        subtotal,
        mode
    };
};