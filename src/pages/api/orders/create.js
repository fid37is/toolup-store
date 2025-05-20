/* eslint-disable @typescript-eslint/no-unused-vars */
// src/pages/api/orders/create.js
import { google } from 'googleapis';

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

// Create email transporter
const createEmailTransporter = async () => {
    const nodemailerModule = await getNodemailer();
    return nodemailerModule.createTransporter({
        service: 'gmail', // or your preferred email service
        auth: {
            user: process.env.EMAIL_USER, // Your email
            pass: process.env.EMAIL_PASS  // Your email password or app password
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

// Send order confirmation email to guest
const sendGuestOrderEmail = async (orderData) => {
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
        console.log('Order confirmation email sent to:', customer.email);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
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

        await authorizeJwtClient();
        const sheets = getSheets();
        const sheetId = process.env.GOOGLE_SHEET_ID;

        if (!sheetId) {
            console.error('GOOGLE_SHEET_ID environment variable is not set');
            return res.status(500).json({ error: 'Sheet ID not configured' });
        }

        // Generate a new order ID
        const orderId = generateOrderId();
        const orderDateFormatted = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        const status = 'pending'; // Initial status

        // Step 1: Get the headers from the Orders sheet to ensure we insert data in the right order
        let orderHeaders = [];
        try {
            const headersResponse = await sheets.spreadsheets.values.get({
                spreadsheetId: sheetId,
                range: 'Orders!1:1', // First row only (headers)
            });
            
            if (headersResponse.data.values && headersResponse.data.values.length > 0) {
                orderHeaders = headersResponse.data.values[0];
            } else {
                // If no headers exist, define the default structure
                orderHeaders = [
                    'orderId', 'userId', 'orderDate', 'status', 'totalAmount', 'shippingFee', 
                    'paymentMethod', 'currency', 'isAuthenticated', 'isGuestCheckout',
                    'customerFirstName', 'customerLastName', 'customerEmail', 'customerPhone', 
                    'shippingAddress', 'city', 'state', 'lga', 'town', 'zip', 'additionalInfo'
                ];
                
                // Create the headers if they don't exist
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
            // If the sheet doesn't exist, create it with our headers
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
                    'shippingAddress', 'city', 'state', 'lga', 'town', 'zip', 'additionalInfo'
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
                if (createError.message.includes('already exists')) {
                    // Sheet exists but something else went wrong with getting headers
                    return res.status(500).json({
                        error: 'Failed to read Orders sheet structure',
                        details: createError.message
                    });
                } else {
                    return res.status(500).json({
                        error: 'Failed to create Orders sheet',
                        details: createError.message
                    });
                }
            }
        }

        // Create a row for the Orders sheet with values in the correct order
        const orderRow = Array(orderHeaders.length).fill(''); // Initialize with empty strings
        
        // Map values to the correct positions based on headers
        orderHeaders.forEach((header, index) => {
            const lowerHeader = header.toLowerCase();
            switch (lowerHeader) {
                case 'orderid':
                    orderRow[index] = orderId;
                    break;
                case 'userid':
                case 'user_id':
                    orderRow[index] = userId;
                    break;
                case 'orderdate':
                case 'date':
                    orderRow[index] = orderDateFormatted;
                    break;
                case 'status':
                    orderRow[index] = status;
                    break;
                case 'totalamount':
                case 'total':
                    orderRow[index] = totalAmount.toString();
                    break;
                case 'shippingfee':
                case 'shipping':
                    orderRow[index] = shippingFee?.toString() || '0';
                    break;
                case 'paymentmethod':
                    orderRow[index] = paymentMethod;
                    break;
                case 'currency':
                    orderRow[index] = currency || 'NGN';
                    break;
                case 'isauthenticated':
                    orderRow[index] = isAuthenticated ? 'true' : 'false';
                    break;
                case 'isguestcheckout':
                    orderRow[index] = isGuestCheckout ? 'true' : 'false';
                    break;
                case 'customerfirstname':
                case 'firstname':
                    orderRow[index] = customer.firstName || '';
                    break;
                case 'customerlastname':
                case 'lastname':
                    orderRow[index] = customer.lastName || '';
                    break;
                case 'customeremail':
                case 'email':
                    orderRow[index] = customer.email || '';
                    break;
                case 'customerphone':
                case 'phone':
                    orderRow[index] = customer.phoneNumber || '';
                    break;
                case 'shippingaddress':
                case 'address':
                    orderRow[index] = customer.address || '';
                    break;
                case 'city':
                    orderRow[index] = customer.city || '';
                    break;
                case 'state':
                    orderRow[index] = customer.state || '';
                    break;
                case 'lga':
                    orderRow[index] = customer.lga || '';
                    break;
                case 'town':
                    orderRow[index] = customer.town || '';
                    break;
                case 'zip':
                    orderRow[index] = customer.zip || '';
                    break;
                case 'additionalinfo':
                    orderRow[index] = customer.additionalInfo || '';
                    break;
                default:
                    // Keep empty string for unknown headers
                    break;
            }
        });

        // Step 2: Add the new order to the Orders sheet
        await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: 'Orders!A:Z', // Wide range to ensure we capture all headers
            valueInputOption: 'RAW',
            resource: {
                values: [orderRow]
            }
        });

        // Step 3: Now handle the OrderItems sheet
        let itemHeaders = [];
        try {
            const itemsHeaderResponse = await sheets.spreadsheets.values.get({
                spreadsheetId: sheetId,
                range: 'OrderItems!1:1', // First row only (headers)
            });
            
            if (itemsHeaderResponse.data.values && itemsHeaderResponse.data.values.length > 0) {
                itemHeaders = itemsHeaderResponse.data.values[0];
            } else {
                // If no headers exist, define the default structure
                itemHeaders = ['orderId', 'productId', 'productName', 'quantity', 'price'];
                
                // Create the headers if they don't exist
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
            // If the sheet doesn't exist, create it with our headers
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
                
                itemHeaders = ['orderId', 'productId', 'productName', 'quantity', 'price'];
                
                await sheets.spreadsheets.values.update({
                    spreadsheetId: sheetId,
                    range: 'OrderItems!A1',
                    valueInputOption: 'RAW',
                    resource: {
                        values: [itemHeaders]
                    }
                });
            } catch (createError) {
                if (createError.message.includes('already exists')) {
                    // Sheet exists but something else went wrong with getting headers
                    return res.status(500).json({
                        error: 'Failed to read OrderItems sheet structure',
                        details: createError.message
                    });
                } else {
                    return res.status(500).json({
                        error: 'Failed to create OrderItems sheet',
                        details: createError.message
                    });
                }
            }
        }

        // Step 4: Prepare and insert order items
        const itemRows = items.map(item => {
            const row = Array(itemHeaders.length).fill(''); // Initialize with empty strings
            
            // Map values to the correct positions based on headers
            itemHeaders.forEach((header, index) => {
                const lowerHeader = header.toLowerCase();
                switch (lowerHeader) {
                    case 'orderid':
                        row[index] = orderId;
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
                    default:
                        // Keep empty string for unknown headers
                        break;
                }
            });
            
            return row;
        });

        // Add items to the OrderItems sheet
        if (itemRows.length > 0) {
            await sheets.spreadsheets.values.append({
                spreadsheetId: sheetId,
                range: 'OrderItems!A:Z', // Wide range to ensure we capture all headers
                valueInputOption: 'RAW',
                resource: {
                    values: itemRows
                }
            });
        }

        // Step 5: Send email to guest users if requested
        let emailSent = false;
        if (sendGuestEmail && !isAuthenticated) {
            emailSent = await sendGuestOrderEmail({
                orderId,
                customer,
                items,
                totalAmount,
                shippingFee: shippingFee || 0,
                paymentMethod,
                currency: currency || 'NGN'
            });
        }

        // Return success with order information
        return res.status(201).json({
            success: true,
            orderId,
            message: 'Order created successfully',
            emailSent: emailSent,
            order: {
                orderId,
                userId,
                orderDate: orderDateFormatted,
                status,
                totalAmount,
                shippingFee: shippingFee || 0,
                paymentMethod,
                customer: {
                    firstName: customer.firstName,
                    lastName: customer.lastName,
                    email: customer.email,
                    phone: customer.phoneNumber
                },
                items: items.map(item => ({
                    productId: item.productId,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                }))
            }
        });

    } catch (error) {
        console.error('Error creating order:', error);
        return res.status(500).json({
            error: 'Failed to create order',
            message: error.message
        });
    }
}