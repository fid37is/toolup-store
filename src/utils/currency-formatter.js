// src/utils/currency-formatter.js

/**
 * Format price directly as Nigerian Naira without applying exchange rate
 * @param {number|string} price - The raw price value from the spreadsheet
 * @returns {string} Formatted price with Naira symbol
 */
export const formatNairaPrice = (price) => {
    // Parse the price to ensure it's a number
    const priceValue = parseFloat(price);
    
    // Handle invalid input
    if (isNaN(priceValue)) {
        return '₦0';
    }
    
    // Format using Intl.NumberFormat with Nigerian locale and NGN currency
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(priceValue);
};

/**
 * Alternative formatter if you need to display prices in a custom format
 * @param {number|string} price - The raw price value 
 * @returns {string} Formatted price with custom formatting
 */
export const formatCustomPrice = (price) => {
    const priceValue = parseFloat(price);
    
    if (isNaN(priceValue)) {
        return '₦0';
    }
    
    // Format the number with commas for thousands
    return '₦' + priceValue.toLocaleString('en-US');
};