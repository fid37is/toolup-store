// src/server/api/bankTransferAPI.js

/**
 * This file contains the server-side API handlers for the bank transfer payment system.
 * In a real implementation, this would be part of your backend API.
 */

import { randomUUID } from 'crypto';
import { prisma } from '../db';

/**
 * Creates a temporary bank transfer payment record and generates details
 * for the customer to make the transfer.
 * 
 * @param {Object} orderData - Order data including customer details and amount
 * @returns {Object} Bank transfer details
 */
export async function generateBankTransferDetails(orderData) {
    // Generate a unique reference code
    const reference = `TRF-${Date.now().toString().slice(-6)}-${randomUUID().slice(0, 8)}`;

    // Calculate expiry time (24 hours from now)
    const expiryTime = new Date();
    expiryTime.setHours(expiryTime.getHours() + 24);

    try {
        // In a real application, you might generate a virtual account number
        // through integration with a payment processor like Flutterwave or Paystack

        // Store the payment request in the database
        const paymentRequest = await prisma.paymentRequest.create({
            data: {
                reference,
                amount: orderData.totalAmount,
                currency: 'NGN',
                status: 'PENDING',
                paymentMethod: 'BANK_TRANSFER',
                expiresAt: expiryTime,
                customerId: orderData.customerId || null,
                orderId: orderData.orderId || null,
                // You might include more metadata as needed
                metadata: {
                    items: orderData.items,
                    customerEmail: orderData.customerInfo.email,
                    customerName: orderData.customerInfo.fullName
                }
            }
        });

        // Return the bank details to be displayed to the customer
        return {
            reference: paymentRequest.reference,
            accountNumber: process.env.COMPANY_ACCOUNT_NUMBER,
            bankName: process.env.COMPANY_BANK_NAME,
            accountName: process.env.COMPANY_ACCOUNT_NAME,
            amount: orderData.totalAmount,
            expiresAt: paymentRequest.expiresAt,
            currency: 'NGN'
        };
    } catch (error) {
        console.error('Error generating bank transfer details:', error);
        throw new Error('Failed to generate bank transfer details');
    }
}

/**
 * Checks the status of a bank transfer payment
 * 
 * @param {string} reference - Payment reference code
 * @returns {Object} Payment status information
 */
export async function checkBankTransferStatus(reference) {
    try {
        const paymentRequest = await prisma.paymentRequest.findUnique({
            where: { reference }
        });

        if (!paymentRequest) {
            throw new Error('Payment reference not found');
        }

        // In a real application, you would check with your payment processor
        // or bank API to see if the transfer has been received

        return {
            status: paymentRequest.status,
            reference: paymentRequest.reference,
            amount: paymentRequest.amount,
            expiresAt: paymentRequest.expiresAt
        };
    } catch (error) {
        console.error('Error checking bank transfer status:', error);
        throw new Error('Failed to check payment status');
    }
}

/**
 * This function would be called by a webhook from your bank or payment processor
 * when a transfer is received into your account
 * 
 * @param {Object} transferData - Data from the webhook about the received transfer
 * @returns {boolean} Success status
 */
export async function handleBankTransferWebhook(transferData) {
    try {
        // Extract reference from the transfer description/narration
        const reference = extractReferenceFromNarration(transferData.narration);

        if (!reference) {
            console.error('No reference found in transfer narration:', transferData.narration);
            return false;
        }

        // Find the payment request
        const paymentRequest = await prisma.paymentRequest.findUnique({
            where: { reference }
        });

        if (!paymentRequest) {
            console.error('Payment request not found for reference:', reference);
            return false;
        }

        // Verify the amount matches
        if (parseFloat(transferData.amount) !== parseFloat(paymentRequest.amount)) {
            console.error('Transfer amount does not match payment request amount');
            await updatePaymentStatus(reference, 'AMOUNT_MISMATCH');
            return false;
        }

        // Update payment status to confirmed
        await updatePaymentStatus(reference, 'CONFIRMED');

        // If there's an order ID, update the order status
        if (paymentRequest.orderId) {
            await prisma.order.update({
                where: { id: paymentRequest.orderId },
                data: { status: 'PAID' }
            });
        }

        return true;
    } catch (error) {
        console.error('Error handling bank transfer webhook:', error);
        return false;
    }
}

/**
 * Helper function to update payment status
 * 
 * @param {string} reference - Payment reference
 * @param {string} status - New status
 */
async function updatePaymentStatus(reference, status) {
    try {
        await prisma.paymentRequest.update({
            where: { reference },
            data: { status }
        });
    } catch (error) {
        console.error('Error updating payment status:', error);
        throw error;
    }
}

/**
 * Helper function to extract reference from transfer narration
 * 
 * @param {string} narration - The transfer description
 * @returns {string|null} Reference if found, null otherwise
 */
function extractReferenceFromNarration(narration) {
    // Look for TRF-XXXXXX-XXXXXXXX pattern in the narration
    const match = narration.match(/TRF-\d{6}-[a-zA-Z0-9]{8}/);
    return match ? match[0] : null;
}

/**
 * Marks expired payment requests as expired
 * This function would typically be run by a scheduled job
 */
export async function cleanupExpiredPayments() {
    const now = new Date();

    try {
        await prisma.paymentRequest.updateMany({
            where: {
                status: 'PENDING',
                expiresAt: {
                    lt: now
                }
            },
            data: {
                status: 'EXPIRED'
            }
        });

        // For expired payments with associated orders, update those orders
        const expiredPayments = await prisma.paymentRequest.findMany({
            where: {
                status: 'EXPIRED',
                orderId: {
                    not: null
                }
            }
        });

        // Update associated orders
        for (const payment of expiredPayments) {
            await prisma.order.update({
                where: { id: payment.orderId },
                data: { status: 'PAYMENT_EXPIRED' }
            });
        }

        return true;
    } catch (error) {
        console.error('Error cleaning up expired payments:', error);
        return false;
    }
}