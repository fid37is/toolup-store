// src/utils/formatters.js

/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currencyCode - The currency code (default: USD)
 * @returns {string} - The formatted currency string
 */
export const formatCurrency = (amount, currencyCode = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
    }).format(amount);
};

/**
 * Format a date as a localized string
 * @param {string|Date} date - The date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} - The formatted date string
 */
export const formatDate = (date, options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
}) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return new Intl.DateTimeFormat('en-US', options).format(dateObj);
};

/**
 * Truncate a string to a specified length
 * @param {string} str - The string to truncate
 * @param {number} maxLength - The maximum length
 * @returns {string} - The truncated string
 */
export const truncateString = (str, maxLength) => {
    if (!str || str.length <= maxLength) return str;
    return `${str.slice(0, maxLength)}...`;
};

/**
 * Format a number with commas as thousands separators
 * @param {number} number - The number to format
 * @returns {string} - The formatted number
 */
export const formatNumber = (number) => {
    return new Intl.NumberFormat('en-US').format(number);
};

/**
 * Generate a random order ID
 * @returns {string} - A random order ID
 */
export const generateOrderId = () => {
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp}${random}`;
};