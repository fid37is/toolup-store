// src/pages/api/users/[userId].js
// Unified API endpoint to handle both payment methods and orders for a user

import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// Initialize Google Sheets authentication
const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Fetch user payment methods from Google Sheets or payment provider
async function getUserPaymentMethods(userId) {
    try {
        const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
        await doc.loadInfo();

        const paymentMethodsSheet = doc.sheetsByTitle['PaymentMethods'];

        if (!paymentMethodsSheet) {
            // If sheet doesn't exist, return empty structure
            return {
                savedCards: [],
                paymentMethods: [],
                defaultMethodId: null,
                defaultMethodType: null
            };
        }

        // Fetch payment methods for this specific user
        const paymentRows = await paymentMethodsSheet.getRows();
        const userPaymentMethods = paymentRows.filter(row =>
            row.get('userId') === userId || row.get('customerEmail') === userId
        );

        const savedCards = [];
        const paymentMethods = [];
        let defaultMethodId = null;
        let defaultMethodType = null;

        userPaymentMethods.forEach(row => {
            const methodId = row.get('id');
            const isDefault = row.get('isDefault') === 'true' || row.get('isDefault') === true;

            // Build saved card object
            const savedCard = {
                id: methodId,
                cardType: row.get('cardType') || 'Unknown',
                cardNumber: row.get('maskedCardNumber') || '****0000',
                expiryMonth: row.get('expiryMonth') || '',
                expiryYear: row.get('expiryYear') || '',
                holderName: row.get('holderName') || '',
                isDefault: isDefault,
                createdAt: row.get('createdAt') || new Date().toISOString()
            };

            // Build payment method object
            const paymentMethod = {
                id: methodId,
                type: row.get('type') || 'card',
                card: {
                    brand: row.get('cardBrand') || 'unknown',
                    last4: row.get('last4') || '0000',
                    exp_month: parseInt(row.get('expiryMonth')) || 1,
                    exp_year: parseInt(row.get('expiryYear')) || new Date().getFullYear()
                },
                isDefault: isDefault
            };

            savedCards.push(savedCard);
            paymentMethods.push(paymentMethod);

            // Set default method info
            if (isDefault) {
                defaultMethodId = methodId;
                defaultMethodType = row.get('type') || 'card';
            }
        });

        return {
            savedCards,
            paymentMethods,
            defaultMethodId,
            defaultMethodType
        };

    } catch (error) {
        console.error(`Error fetching payment methods for user ${userId}:`, error);
        throw error;
    }
}

// Fetch user orders from Google Sheets
async function getUserOrders(userId) {
    try {
        const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
        await doc.loadInfo();

        const ordersSheet = doc.sheetsByTitle['Orders'];
        const orderItemsSheet = doc.sheetsByTitle['OrderItems'];

        if (!ordersSheet || !orderItemsSheet) {
            throw new Error('Orders sheets not found');
        }

        // Fetch all orders and items
        const orderRows = await ordersSheet.getRows();
        const itemRows = await orderItemsSheet.getRows();

        // Filter orders by user - specifically using userId parameter
        const userOrders = orderRows.filter(row => {
            const customerEmail = row.get('customerEmail');
            const customerId = row.get('customerId');
            const orderUserId = row.get('userId');

            // Match against userId parameter in multiple ways
            return customerEmail === userId ||
                customerId === userId ||
                orderUserId === userId;
        });

        // Build orders with items
        const orders = userOrders.map(row => {
            const orderId = row.get('id');
            const orderItems = itemRows
                .filter(itemRow => itemRow.get('orderId') === orderId)
                .map(itemRow => ({
                    productId: itemRow.get('productId'),
                    name: itemRow.get('productName'),
                    quantity: parseInt(itemRow.get('quantity')),
                    price: parseFloat(itemRow.get('price')),
                    total: parseFloat(itemRow.get('total'))
                }));

            return {
                id: orderId,
                customerName: row.get('customerName'),
                customerEmail: row.get('customerEmail'),
                customerPhone: row.get('customerPhone'),
                shippingAddress: row.get('shippingAddress') ? JSON.parse(row.get('shippingAddress')) : null,
                total: parseFloat(row.get('total')),
                status: row.get('status'),
                createdAt: row.get('createdAt'),
                updatedAt: row.get('updatedAt'),
                items: orderItems
            };
        });

        // Sort by creation date (newest first)
        orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return orders;
    } catch (error) {
        console.error('Error fetching user orders:', error);
        throw error;
    }
}

// Update user's default payment method
async function updateDefaultPaymentMethod(userId, methodId, methodType) {
    try {
        const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
        await doc.loadInfo();

        const paymentMethodsSheet = doc.sheetsByTitle['PaymentMethods'];

        if (!paymentMethodsSheet) {
            throw new Error('PaymentMethods sheet not found');
        }

        const paymentRows = await paymentMethodsSheet.getRows();

        // Find all payment methods for this user
        const userPaymentRows = paymentRows.filter(row =>
            row.get('userId') === userId || row.get('customerEmail') === userId
        );

        if (userPaymentRows.length === 0) {
            throw new Error(`No payment methods found for user ${userId}`);
        }

        // Find the specific method to set as default
        const targetMethod = userPaymentRows.find(row => row.get('id') === methodId);
        if (!targetMethod) {
            throw new Error(`Payment method ${methodId} not found for user ${userId}`);
        }

        // Update all user's payment methods - set isDefault to false
        await Promise.all(userPaymentRows.map(async (row) => {
            if (row.get('id') === methodId) {
                row.set('isDefault', 'true');
                row.set('updatedAt', new Date().toISOString());
            } else {
                row.set('isDefault', 'false');
                row.set('updatedAt', new Date().toISOString());
            }
            await row.save();
        }));

        console.log(`Updated default payment method for user ${userId}: ${methodId} (${methodType})`);

        // Return updated payment methods for this specific user
        return await getUserPaymentMethods(userId);
    } catch (error) {
        console.error(`Error updating default payment method for user ${userId}:`, error);
        throw error;
    }
}

export default async function handler(req, res) {
    const { userId, resource } = req.query;

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        switch (req.method) {
            case 'GET':
                // Handle different resource types based on query parameter
                if (resource === 'payment-methods') {
                    // Fetch payment methods
                    const userPaymentData = await getUserPaymentMethods(userId);

                    const response = {
                        savedCards: userPaymentData.savedCards || [],
                        paymentMethods: userPaymentData.paymentMethods || [],
                        defaultMethodId: userPaymentData.defaultMethodId || null,
                        defaultMethodType: userPaymentData.defaultMethodType || null
                    };

                    return res.status(200).json(response);

                } else if (resource === 'orders') {
                    // Fetch user orders
                    const orders = await getUserOrders(userId);

                    return res.status(200).json({
                        success: true,
                        orders,
                        total: orders.length
                    });

                } else if (!resource) {
                    // Fetch both payment methods and orders
                    const [paymentMethods, orders] = await Promise.all([
                        getUserPaymentMethods(userId),
                        getUserOrders(userId)
                    ]);

                    return res.status(200).json({
                        success: true,
                        data: {
                            paymentMethods: {
                                savedCards: paymentMethods.savedCards || [],
                                paymentMethods: paymentMethods.paymentMethods || [],
                                defaultMethodId: paymentMethods.defaultMethodId || null,
                                defaultMethodType: paymentMethods.defaultMethodType || null
                            },
                            orders: {
                                orders,
                                total: orders.length
                            }
                        }
                    });

                } else {
                    return res.status(400).json({
                        message: 'Invalid resource. Use "payment-methods", "orders", or omit for both'
                    });
                }

            case 'PUT':
                // Handle updates (currently only for payment methods)
                if (resource === 'payment-methods') {
                    const { methodId, methodType } = req.body;

                    if (!methodId || !methodType) {
                        return res.status(400).json({
                            message: 'Method ID and type are required'
                        });
                    }

                    const updatedPaymentMethods = await updateDefaultPaymentMethod(userId, methodId, methodType);

                    return res.status(200).json({
                        success: true,
                        message: 'Default payment method updated',
                        data: {
                            savedCards: updatedPaymentMethods.savedCards || [],
                            paymentMethods: updatedPaymentMethods.paymentMethods || [],
                            defaultMethodId: updatedPaymentMethods.defaultMethodId || null,
                            defaultMethodType: updatedPaymentMethods.defaultMethodType || null
                        }
                    });

                } else {
                    return res.status(400).json({
                        message: 'PUT method only supported for payment-methods resource'
                    });
                }

            default:
                return res.status(405).json({ message: 'Method not allowed' });
        }

    } catch (error) {
        console.error('API Error:', error);

        // Return appropriate error response based on resource type
        if (resource === 'payment-methods') {
            return res.status(500).json({
                error: 'Failed to fetch payment methods',
                savedCards: [],
                paymentMethods: []
            });
        } else if (resource === 'orders') {
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch user orders',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        } else {
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}