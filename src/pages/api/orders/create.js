/* eslint-disable @typescript-eslint/no-unused-vars */
// src/pages/api/orders/create.js - OPTIMIZED VERSION
import { google } from 'googleapis';
import { sendOrderConfirmationEmail } from '../../../services/emailService';
import crypto from 'crypto';

let jwtClient = null;
let nodemailer = null;

// Dynamically import nodemailer only when needed (server-side only)
const getNodemailer = async () => {
    if (!nodemailer) {
        nodemailer = await import('nodemailer');
    }
    return nodemailer.default;
};

const createJwtClient = () => {
    if (process.env.GOOGLE_CREDENTIALS_B64) {
        const decoded = Buffer.from(process.env.GOOGLE_CREDENTIALS_B64, 'base64').toString('utf-8');
        const credentials = JSON.parse(decoded);
        return new google.auth.JWT(
            credentials.client_email,
            null,
            credentials.private_key,
            ['https://www.googleapis.com/auth/spreadsheets']
        );
    } else {
        return new google.auth.JWT(
            process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.GOOGLE_CLIENT_EMAIL,
            null,
            (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
            ['https://www.googleapis.com/auth/spreadsheets']
        );
    }
};

const authorizeJwtClient = async () => {
    if (!jwtClient) jwtClient = createJwtClient();
    return new Promise((resolve, reject) => {
        jwtClient.authorize((err) => {
            if (err) {
                console.error('JWT Authorization failed:', err);
                reject(err);
            } else {
                resolve(jwtClient);
            }
        });
    });
};

const getSheets = () => google.sheets({ version: 'v4', auth: jwtClient });

// Generate a unique order ID
const generateOrderId = () => {
    const timestamp = new Date().getTime().toString().substr(-6);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD-${timestamp}-${random}`;
};

// Create email transporter (fallback for direct email sending)
const createEmailTransporter = async () => {
    const nodemailerModule = await getNodemailer();
    return nodemailerModule.createTransporter({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN'
    }).format(amount);
};

const generateWebhookSignature = (payload, secret) => {
    const signature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

    return `sha256=${signature}`;
};

// FIXED: Notify inventory app about new order
const notifyInventoryApp = async (orderData) => {
    try {
        const inventoryWebhookUrl = process.env.INVENTORY_WEBHOOK_URL || 'http://localhost:3001/api/orders/receive-webhook';
        const webhookSecret = process.env.WEBHOOK_SECRET || 'your-webhook-secret';

        // FIXED: Create proper webhook payload format
        const webhookPayload = {
            event: 'new_order', // Changed from 'type' to 'event'
            data: orderData,     // This contains your order data
            timestamp: new Date().toISOString()
        };

        const payloadString = JSON.stringify(webhookPayload);
        const signature = generateWebhookSignature(payloadString, webhookSecret);

        console.log('Sending webhook to:', inventoryWebhookUrl);
        console.log('Webhook payload:', webhookPayload);

        const response = await fetch(inventoryWebhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Webhook-Signature': signature, // FIXED: Proper header name
                'User-Agent': 'StoreFont-Webhook/1.0'
            },
            body: payloadString,
            timeout: 10000
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to notify inventory app:', response.status, errorText);
            return false;
        }

        const result = await response.json();
        console.log('Successfully notified inventory app:', result);
        return true;

    } catch (error) {
        console.error('Error notifying inventory app:', error);
        return false;
    }
};

// ASYNC: Fallback email function
const sendGuestOrderEmailFallback = async (orderData) => {
    try {
        const transporter = await createEmailTransporter();

        const { customer, items, totalAmount, shippingFee, orderId, paymentMethod } = orderData;
        const subtotal = totalAmount - shippingFee;

        const itemsHtml = items.map(item => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(item.price)}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(item.price * item.quantity)}</td>
            </tr>
        `).join('');

        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2D5016; text-align: center;">Order Confirmation</h1>
                <p>Dear ${customer.firstName} ${customer.lastName},</p>
                <p>Thank you for your order! Here are your order details:</p>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h2 style="color: #2D5016; margin-top: 0;">Order #${orderId}</h2>
                    <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
                    <p><strong>Payment Method:</strong> ${paymentMethod === 'pay_on_pickup' ? 'Pay on Pickup' : paymentMethod}</p>
                </div>

                <h3>Items Ordered:</h3>
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                    <thead>
                        <tr style="background-color: #f8f9fa;">
                            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
                            <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
                            <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
                            <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>

                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span>Subtotal:</span>
                        <span>${formatCurrency(subtotal)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span>Shipping:</span>
                        <span>${formatCurrency(shippingFee)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; border-top: 2px solid #ddd; padding-top: 10px;">
                        <span>Total:</span>
                        <span>${formatCurrency(totalAmount)}</span>
                    </div>
                </div>

                <h3>Shipping Address:</h3>
                <p>
                    ${customer.firstName} ${customer.lastName}<br>
                    ${customer.address}<br>
                    ${customer.city}, ${customer.lga}<br>
                    ${customer.state} ${customer.zip}<br>
                    Phone: ${customer.phoneNumber}
                </p>

                <div style="margin: 30px 0; padding: 20px; background-color: #e8f5e9; border-radius: 8px;">
                    <h3 style="color: #2D5016; margin-top: 0;">What's Next?</h3>
                    <ul>
                        <li>We'll process your order within 1-2 business days</li>
                        <li>You'll receive tracking information once your order ships</li>
                        <li>If you have any questions, contact us at support@toolupstore.com</li>
                    </ul>
                </div>

                <p style="text-align: center; color: #666; margin-top: 30px;">
                    Thank you for shopping with ToolUp Store!
                </p>
            </div>
        `;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: customer.email,
            subject: `Order Confirmation - ${orderId}`,
            html: emailHtml
        };

        await transporter.sendMail(mailOptions);
        console.log('Fallback order confirmation email sent to:', customer.email);
        return true;
    } catch (error) {
        console.error('Error sending fallback email:', error);
        return false;
    }
};

// ASYNC: Process order data to Google Sheets
const processOrderToSheets = async (orderData, itemsData) => {
    try {
        await authorizeJwtClient();
        const sheets = getSheets();
        const sheetId = process.env.GOOGLE_SHEET_ID;

        if (!sheetId) {
            throw new Error('GOOGLE_SHEET_ID environment variable is not set');
        }

        // Step 1: Handle Orders sheet
        let orderHeaders = [];
        try {
            const headersResponse = await sheets.spreadsheets.values.get({
                spreadsheetId: sheetId,
                range: 'Orders!1:1',
            });

            if (headersResponse.data.values && headersResponse.data.values.length > 0) {
                orderHeaders = headersResponse.data.values[0];
            } else {
                orderHeaders = [
                    'orderId', 'userId', 'orderDate', 'status', 'totalAmount', 'shippingFee',
                    'paymentMethod', 'currency', 'isAuthenticated', 'isGuestCheckout',
                    'customerFirstName', 'customerLastName', 'customerEmail', 'customerPhone',
                    'shippingAddress', 'city', 'state', 'lga', 'town', 'zip', 'additionalInfo',
                    'createdAt', 'updatedAt'
                ];

                await sheets.spreadsheets.values.update({
                    spreadsheetId: sheetId,
                    range: 'Orders!A1',
                    valueInputOption: 'RAW',
                    resource: {
                        values: [orderHeaders]
                    }
                });
            }
        } catch (error) {
            try {
                await sheets.spreadsheets.batchUpdate({
                    spreadsheetId: sheetId,
                    resource: {
                        requests: [{
                            addSheet: {
                                properties: {
                                    title: 'Orders'
                                }
                            }
                        }]
                    }
                });

                orderHeaders = [
                    'orderId', 'userId', 'orderDate', 'status', 'totalAmount', 'shippingFee',
                    'paymentMethod', 'currency', 'isAuthenticated', 'isGuestCheckout',
                    'customerFirstName', 'customerLastName', 'customerEmail', 'customerPhone',
                    'shippingAddress', 'city', 'state', 'lga', 'town', 'zip', 'additionalInfo',
                    'createdAt', 'updatedAt'
                ];

                await sheets.spreadsheets.values.update({
                    spreadsheetId: sheetId,
                    range: 'Orders!A1',
                    valueInputOption: 'RAW',
                    resource: {
                        values: [orderHeaders]
                    }
                });
            } catch (createError) {
                if (!createError.message.includes('already exists')) {
                    throw createError;
                }
            }
        }

        // Create order row
        const orderRow = Array(orderHeaders.length).fill('');
        orderHeaders.forEach((header, index) => {
            const lowerHeader = header.toLowerCase();
            switch (lowerHeader) {
                case 'orderid':
                    orderRow[index] = orderData.orderId;
                    break;
                case 'userid':
                case 'user_id':
                    orderRow[index] = orderData.userId;
                    break;
                case 'orderdate':
                case 'date':
                    orderRow[index] = orderData.orderDate;
                    break;
                case 'status':
                    orderRow[index] = orderData.status;
                    break;
                case 'totalamount':
                case 'total':
                    orderRow[index] = orderData.totalAmount.toString();
                    break;
                case 'shippingfee':
                case 'shipping':
                    orderRow[index] = orderData.shippingFee?.toString() || '0';
                    break;
                case 'paymentmethod':
                    orderRow[index] = orderData.paymentMethod;
                    break;
                case 'currency':
                    orderRow[index] = orderData.currency || 'NGN';
                    break;
                case 'isauthenticated':
                    orderRow[index] = orderData.isAuthenticated ? 'true' : 'false';
                    break;
                case 'isguestcheckout':
                    orderRow[index] = orderData.isGuestCheckout ? 'true' : 'false';
                    break;
                case 'customerfirstname':
                case 'firstname':
                    orderRow[index] = orderData.customer.firstName || '';
                    break;
                case 'customerlastname':
                case 'lastname':
                    orderRow[index] = orderData.customer.lastName || '';
                    break;
                case 'customeremail':
                case 'email':
                    orderRow[index] = orderData.customer.email || '';
                    break;
                case 'customerphone':
                case 'phone':
                    orderRow[index] = orderData.customer.phoneNumber || '';
                    break;
                case 'shippingaddress':
                case 'address':
                    orderRow[index] = orderData.customer.address || '';
                    break;
                case 'city':
                    orderRow[index] = orderData.customer.city || '';
                    break;
                case 'state':
                    orderRow[index] = orderData.customer.state || '';
                    break;
                case 'lga':
                    orderRow[index] = orderData.customer.lga || '';
                    break;
                case 'town':
                    orderRow[index] = orderData.customer.town || '';
                    break;
                case 'zip':
                    orderRow[index] = orderData.customer.zip || '';
                    break;
                case 'additionalinfo':
                    orderRow[index] = orderData.customer.additionalInfo || '';
                    break;
                case 'createdat':
                    orderRow[index] = orderData.createdAt;
                    break;
                case 'updatedat':
                    orderRow[index] = orderData.createdAt;
                    break;
                default:
                    break;
            }
        });

        // Insert order
        await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: 'Orders!A:Z',
            valueInputOption: 'RAW',
            resource: {
                values: [orderRow]
            }
        });

        // Step 2: Handle OrderItems sheet
        let itemHeaders = [];
        try {
            const itemsHeaderResponse = await sheets.spreadsheets.values.get({
                spreadsheetId: sheetId,
                range: 'OrderItems!1:1',
            });

            if (itemsHeaderResponse.data.values && itemsHeaderResponse.data.values.length > 0) {
                itemHeaders = itemsHeaderResponse.data.values[0];
            } else {
                itemHeaders = ['orderId', 'productId', 'productName', 'quantity', 'price', 'imageUrl'];

                await sheets.spreadsheets.values.update({
                    spreadsheetId: sheetId,
                    range: 'OrderItems!A1',
                    valueInputOption: 'RAW',
                    resource: {
                        values: [itemHeaders]
                    }
                });
            }
        } catch (error) {
            try {
                await sheets.spreadsheets.batchUpdate({
                    spreadsheetId: sheetId,
                    resource: {
                        requests: [{
                            addSheet: {
                                properties: {
                                    title: 'OrderItems'
                                }
                            }
                        }]
                    }
                });

                itemHeaders = ['orderId', 'productId', 'productName', 'quantity', 'price', 'imageUrl'];

                await sheets.spreadsheets.values.update({
                    spreadsheetId: sheetId,
                    range: 'OrderItems!A1',
                    valueInputOption: 'RAW',
                    resource: {
                        values: [itemHeaders]
                    }
                });
            } catch (createError) {
                if (!createError.message.includes('already exists')) {
                    throw createError;
                }
            }
        }

        // Prepare and insert order items
        const itemRows = itemsData.map(item => {
            const row = Array(itemHeaders.length).fill('');

            itemHeaders.forEach((header, index) => {
                const lowerHeader = header.toLowerCase();
                switch (lowerHeader) {
                    case 'orderid':
                        row[index] = orderData.orderId;
                        break;
                    case 'productid':
                        row[index] = item.productId || '';
                        break;
                    case 'productname':
                    case 'name':
                        row[index] = item.name || '';
                        break;
                    case 'quantity':
                    case 'qty':
                        row[index] = item.quantity?.toString() || '1';
                        break;
                    case 'price':
                        row[index] = item.price?.toString() || '0';
                        break;
                    case 'imageurl':
                        row[index] = item.imageUrl || '';
                        break;
                    default:
                        break;
                }
            });

            return row;
        });

        if (itemRows.length > 0) {
            await sheets.spreadsheets.values.append({
                spreadsheetId: sheetId,
                range: 'OrderItems!A:Z',
                valueInputOption: 'RAW',
                resource: {
                    values: itemRows
                }
            });
        }

        console.log('Successfully saved order to Google Sheets:', orderData.orderId);
        return true;
    } catch (error) {
        console.error('Error saving to Google Sheets:', error);
        return false;
    }
};

// ASYNC: Send email confirmation
const processEmailConfirmation = async (orderDetails, sendGuestEmail) => {
    let emailSent = false;
    let emailError = null;

    try {
        const emailResult = await sendOrderConfirmationEmail(orderDetails);

        if (emailResult && emailResult.success) {
            console.log('Order confirmation email sent successfully via email service');
            emailSent = true;
        } else {
            console.log('Email service failed, trying fallback method');
            if (sendGuestEmail !== false) {
                emailSent = await sendGuestOrderEmailFallback({
                    orderId: orderDetails.orderId,
                    customer: orderDetails.shippingDetails,
                    items: orderDetails.items,
                    totalAmount: orderDetails.total,
                    shippingFee: orderDetails.shippingFee || 0,
                    paymentMethod: orderDetails.paymentMethod,
                    currency: 'NGN'
                });
            }
        }
    } catch (emailServiceError) {
        console.error('Email service error:', emailServiceError);
        emailError = emailServiceError.message;

        if (sendGuestEmail !== false) {
            console.log('Attempting fallback email method');
            emailSent = await sendGuestOrderEmailFallback({
                orderId: orderDetails.orderId,
                customer: orderDetails.shippingDetails,
                items: orderDetails.items,
                totalAmount: orderDetails.total,
                shippingFee: orderDetails.shippingFee || 0,
                paymentMethod: orderDetails.paymentMethod,
                currency: 'NGN'
            });
        }
    }

    return { emailSent, emailError };
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const {
            userId,
            items,
            customer,
            isAuthenticated,
            isGuestCheckout,
            shippingFee,
            paymentMethod,
            totalAmount,
            currency,
            orderDate,
            sendGuestEmail
        } = req.body;

        // Basic validation
        if (!userId || !items || !items.length || !totalAmount || !paymentMethod) {
            return res.status(400).json({
                error: 'Missing required fields',
                requiredFields: 'userId, items (array), totalAmount, paymentMethod'
            });
        }

        // Validate customer information
        if (!customer || !customer.email || !customer.firstName || !customer.lastName) {
            return res.status(400).json({
                error: 'Missing customer information',
                requiredFields: 'customer.email, customer.firstName, customer.lastName'
            });
        }

        // Generate order data
        const orderId = generateOrderId();
        const orderDateFormatted = new Date().toISOString().split('T')[0];
        const status = 'pending';
        const createdAt = new Date().toISOString();

        // Prepare order data for sheets
        const orderForSheets = {
            orderId,
            userId,
            orderDate: orderDateFormatted,
            status,
            totalAmount,
            shippingFee: shippingFee || 0,
            paymentMethod,
            currency: currency || 'NGN',
            isAuthenticated,
            isGuestCheckout,
            createdAt,
            customer: {
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email,
                phoneNumber: customer.phoneNumber,
                address: customer.address || '',
                city: customer.city || '',
                state: customer.state || '',
                lga: customer.lga || '',
                town: customer.town || '',
                zip: customer.zip || '',
                additionalInfo: customer.additionalInfo || ''
            }
        };

        // Prepare items data
        const itemsForSheets = items.map(item => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            imageUrl: item.imageUrl
        }));

        // Prepare order details for email
        const orderDetails = {
            orderId,
            items: items.map(item => ({
                name: item.name,
                price: parseFloat(item.price),
                quantity: parseInt(item.quantity),
                imageUrl: item.imageUrl || ''
            })),
            shippingDetails: {
                fullName: `${customer.firstName} ${customer.lastName}`,
                phone: customer.phoneNumber,
                email: customer.email,
                address: customer.address || '',
                city: customer.city || '',
                state: customer.state || '',
                lga: customer.lga || '',
                additionalInfo: customer.additionalInfo || ''
            },
            paymentMethod,
            total: totalAmount,
            shippingFee: shippingFee || 0,
            status: 'pending',
            orderDate: createdAt
        };

        // Prepare order for notification
        const orderForNotification = {
            ...orderForSheets,
            items: itemsForSheets
        };

        // **IMMEDIATELY RESPOND TO CLIENT**
        const response = {
            success: true,
            orderId,
            message: 'Order created successfully',
            order: orderForNotification
        };

        // Send immediate response
        res.status(201).json(response);

        // **PROCESS EVERYTHING ELSE ASYNCHRONOUSLY**
        // Don't await these - let them run in the background
        setImmediate(async () => {
            console.log('Starting async processing for order:', orderId);

            // Process sheets in background
            const sheetsResult = await processOrderToSheets(orderForSheets, itemsForSheets);
            console.log('Sheets processing completed:', sheetsResult);

            // Process email in background
            const emailResult = await processEmailConfirmation(orderDetails, sendGuestEmail);
            console.log('Email processing completed:', emailResult);

            // Process inventory notification in background
            const notificationResult = await notifyInventoryApp(orderForNotification);
            console.log('Inventory notification completed:', notificationResult);

            console.log('All async processing completed for order:', orderId);
        });

    } catch (error) {
        console.error('Error creating order:', error);
        return res.status(500).json({
            error: 'Failed to create order',
            message: error.message
        });
    }
}