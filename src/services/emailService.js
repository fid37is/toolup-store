// utils/emailService.js
import nodemailer from 'nodemailer';
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL; // or process.env.BASE_URL
const logoUrl = `${baseUrl}/logo-2.png`;

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
    console.log('Creating email transporter with config:', {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER ? 'configured' : 'missing',
        pass: process.env.SMTP_PASS ? 'configured' : 'missing'
    });

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        throw new Error('Missing required email environment variables: SMTP_HOST, SMTP_USER, SMTP_PASS');
    }

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST, // e.g., 'smtp.gmail.com'
        port: parseInt(process.env.SMTP_PORT, 10) || 587,
        secure: parseInt(process.env.SMTP_PORT, 10) === 465, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER, // your email
            pass: process.env.SMTP_PASS, // your email password or app password
        },
        // Add debugging options
        debug: true,
        logger: true
    });
};

// Test transporter configuration
export const testEmailConnection = async () => {
    try {
        const transporter = createTransporter();
        console.log('Testing email connection...');

        const result = await transporter.verify();
        console.log('Email connection test result:', result);
        return { success: true, result };
    } catch (error) {
        console.error('Email connection test failed:', error);
        return { success: false, error: error.message };
    }
};

// Generate order confirmation email HTML (keeping your original implementation)
const generateOrderConfirmationHTML = (orderDetails) => {
    const {
        orderId,
        items,
        shippingDetails,
        paymentMethod,
        total,
        shippingFee,
        orderDate
    } = orderDetails;

    const subtotal = total - shippingFee;
    const formattedDate = new Date(orderDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const paymentMethodDisplay = {
        'pay_on_delivery': 'Pay on Delivery',
        'pay_at_pickup': 'Pay at Pickup',
        'bank_transfer': 'Bank Transfer',
        'card': 'Card Payment'
    };

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - ToolUp Store</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f8f9fa;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 800px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
            background: linear-gradient(135deg, #FFBE00 0%, #001D47 40%, #0B61DE 100%);

            color: white;
            padding: 30px 20px;
            display: flex;
            align-items: center;
            gap: 20px;
            text-align: center;
            }

            .header .logo {
            margin-bottom: 0;
            flex-shrink: 0;
            }

            .header .logo img {
            max-height: 80px;
            max-width: 200px;
            height: auto;
            width: auto;
            display: block;
            }

            .header-text h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 300;
            }

            .header-text p {
            margin: 5px 0 0;
            font-size: 16px;
            }
            .content {
                padding: 30px 20px;
            }
            .order-info {
                background-color: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 25px;
            }
            .order-info h2 {
                margin-top: 0;
                color: #495057;
                font-size: 20px;
            }
            .info-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                padding-bottom: 5px;
            }
            .info-label {
                font-weight: 600;
                color: #6c757d;
            }
            .info-value {
                color: #495057;
            }
            .items-section {
                margin-bottom: 25px;
            }
            .items-section h3 {
                color: #495057;
                border-bottom: 2px solid #e9ecef;
                padding-bottom: 10px;
                margin-bottom: 20px;
            }
            .item {
                display: flex;
                align-items: center;
                padding: 15px 0;
                border-bottom: 1px solid #e9ecef;
            }
            .item:last-child {
                border-bottom: none;
            }
            .item-image {
                width: 60px;
                height: 60px;
                background-color: #f8f9fa;
                border-radius: 8px;
                margin-right: 15px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                color: #6c757d;
            }
            .item-details {
                flex: 1;
            }
            .item-name {
                font-weight: 600;
                color: #495057;
                margin-bottom: 5px;
            }
            .item-price {
                color: #6c757d;
                font-size: 14px;
            }
            .item-quantity {
                color: #495057;
                font-weight: 500;
                margin-left: 15px;
            }
            .summary-section {
                background-color: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 25px;
            }
            .summary-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
            }
            .summary-row.total {
                border-top: 2px solid #dee2e6;
                padding-top: 15px;
                margin-top: 15px;
                font-weight: 700;
                font-size: 18px;
                color: #495057;
            }
            .shipping-section {
                background-color: #e3f2fd;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 25px;
            }
            .shipping-section h3 {
                margin-top: 0;
                color: #1565c0;
            }
            .address {
                color: #424242;
                line-height: 1.5;
            }
            .footer {
                background-color: #495057;
                color: white;
                padding: 20px;
                text-align: center;
            }
            .footer p {
                margin: 5px 0;
                font-size: 14px;
            }
            .success-badge {
                background-color: #d4edda;
                color: #155724;
                padding: 10px 15px;
                border-radius: 5px;
                margin-bottom: 20px;
                text-align: center;
                font-weight: 500;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">
                    <img src="${logoUrl}" alt="ToolUp Store Logo" style="max-width:150px;display:block;margin:0 auto;">
                </div>
                <div class="header-text">
                    <h1>Order Confirmation</h1>
                    <p>Thank you for your purchase!</p>
                </div>
            </div>
            
            <div class="content">
                <div class="success-badge">
                    ✅ Your order has been successfully placed!
                </div>
                
                <div class="order-info">
                    <h2>Order Details</h2>
                    <div class="info-row">
                        <span class="info-label">Order ID:</span>
                        <span class="info-value">${orderId}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Order Date:</span>
                        <span class="info-value">${formattedDate}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Payment Method:</span>
                        <span class="info-value">${paymentMethodDisplay[paymentMethod] || paymentMethod}</span>
                    </div>
                </div>

                <div class="items-section">
                    <h3>Order Items</h3>
                    ${items.map(item => `
                        <div class="item">
                            <div class="item-image">
                                ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">` : 'No Image'}
                            </div>
                            <div class="item-details">
                                <div class="item-name">${item.name}</div>
                                <div class="item-price">₦${item.price.toLocaleString()}</div>
                            </div>
                            <div class="item-quantity">Qty: ${item.quantity}</div>
                        </div>
                    `).join('')}
                </div>

                <div class="summary-section">
                    <div class="summary-row">
                        <span>Subtotal:</span>
                        <span>₦${subtotal.toLocaleString()}</span>
                    </div>
                    <div class="summary-row">
                        <span>Shipping Fee:</span>
                        <span>${shippingFee === 0 ? 'Free' : `₦${shippingFee.toLocaleString()}`}</span>
                    </div>
                    <div class="summary-row total">
                        <span>Total:</span>
                        <span>₦${total.toLocaleString()}</span>
                    </div>
                </div>

                ${paymentMethod !== 'pay_at_pickup' ? `
                <div class="shipping-section">
                    <h3>Shipping Address</h3>
                    <div class="address">
                        <strong>${shippingDetails.fullName}</strong><br>
                        ${shippingDetails.address}<br>
                        ${shippingDetails.city ? `${shippingDetails.city}, ` : ''}${shippingDetails.lga}<br>
                        ${shippingDetails.state}<br>
                        Phone: ${shippingDetails.phone}<br>
                        Email: ${shippingDetails.email}
                        ${shippingDetails.additionalInfo ? `<br><br><em>Additional Info: ${shippingDetails.additionalInfo}</em>` : ''}
                    </div>
                </div>
                ` : `
                <div class="shipping-section">
                    <h3>Pickup Information</h3>
                    <div class="address">
                        <strong>${shippingDetails.fullName}</strong><br>
                        Phone: ${shippingDetails.phone}<br>
                        Email: ${shippingDetails.email}<br><br>
                        <em>Please visit our store to collect your order. We'll contact you when it's ready for pickup.</em>
                    </div>
                </div>
                `}

                <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin-top: 20px;">
                    <h4 style="margin-top: 0; color: #856404;">What's Next?</h4>
                    <ul style="color: #856404; margin-bottom: 0;">
                        <li>You'll receive updates about your order status via email</li>
                        <li>Our team will process your order within 24 hours</li>
                        ${paymentMethod === 'bank_transfer' ? '<li>Please complete your bank transfer as instructed</li>' : ''}
                        ${paymentMethod === 'pay_at_pickup' ? '<li>We\'ll notify you when your order is ready for pickup</li>' : '<li>Your order will be shipped to the provided address</li>'}
                    </ul>
                </div>
            </div>
            
            <div class="footer">
                <p><strong>ToolUp Store</strong></p>
                <p>Thank you for choosing us!</p>
                <p>For any questions, contact us at support@toolupstore.com</p>
            </div>
        </div>
    </body>
    </html>
`;
};

// Send order confirmation email with enhanced error handling
export const sendOrderConfirmationEmail = async (orderDetails) => {
    console.log('Starting email send process for order:', orderDetails.orderId);

    try {
        // Test connection first
        const connectionTest = await testEmailConnection();
        if (!connectionTest.success) {
            console.error('Email connection test failed:', connectionTest.error);
            return { success: false, error: `Connection failed: ${connectionTest.error}` };
        }

        const transporter = createTransporter();

        const mailOptions = {
            from: `"ToolUp Store" <${process.env.SMTP_USER}>`,
            to: orderDetails.shippingDetails.email,
            subject: `Order Confirmation - #${orderDetails.orderId}`,
            html: generateOrderConfirmationHTML(orderDetails),
            // Optional: Add plain text version
            text: `
Order Confirmation - ToolUp Store

Thank you for your order!

Order ID: ${orderDetails.orderId}
Order Date: ${new Date(orderDetails.orderDate).toLocaleDateString()}
Total: ₦${orderDetails.total.toLocaleString()}

Items:
${orderDetails.items.map(item => `- ${item.name} (Qty: ${item.quantity}) - ₦${item.price.toLocaleString()}`).join('\n')}

Shipping Address:
${orderDetails.shippingDetails.fullName}
${orderDetails.shippingDetails.address}
${orderDetails.shippingDetails.city}, ${orderDetails.shippingDetails.lga}
${orderDetails.shippingDetails.state}

We'll send you updates about your order status. Thank you for choosing ToolUp Store!
    `
        };

        console.log('Sending email with options:', {
            from: mailOptions.from,
            to: mailOptions.to,
            subject: mailOptions.subject,
            hasHtml: !!mailOptions.html,
            hasText: !!mailOptions.text
        });

        const info = await transporter.sendMail(mailOptions);
        console.log('Order confirmation email sent successfully:', {
            messageId: info.messageId,
            response: info.response,
            accepted: info.accepted,
            rejected: info.rejected
        });

        return { success: true, messageId: info.messageId, response: info.response };
    } catch (error) {
        console.error('Detailed error sending order confirmation email:', {
            message: error.message,
            code: error.code,
            command: error.command,
            response: error.response,
            responseCode: error.responseCode,
            stack: error.stack
        });

        return {
            success: false,
            error: error.message,
            code: error.code,
            details: {
                command: error.command,
                response: error.response,
                responseCode: error.responseCode
            }
        };
    }
};

// Send order status update email with enhanced error handling
export const sendOrderStatusEmail = async (orderDetails, newStatus) => {
    console.log('Starting status update email for order:', orderDetails.orderId, 'Status:', newStatus);

    try {
        const transporter = createTransporter();

        const statusMessages = {
            'processing': 'Your order is being processed',
            'shipped': 'Your order has been shipped',
            'delivered': 'Your order has been delivered',
            'cancelled': 'Your order has been cancelled'
        };

        const mailOptions = {
            from: `"ToolUp Store" <${process.env.SMTP_USER}>`,
            to: orderDetails.shippingDetails.email,
            subject: `Order Update - #${orderDetails.orderId}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Order Status Update</h2>
            <p>Hello ${orderDetails.shippingDetails.fullName},</p>
            <p><strong>${statusMessages[newStatus] || `Order status updated to: ${newStatus}`}</strong></p>
            <p>Order ID: <strong>${orderDetails.orderId}</strong></p>
            <p>Thank you for choosing ToolUp Store!</p>
        </div>
    `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Order status email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending order status email:', error);
        return { success: false, error: error.message };
    }
};

// Utility function to validate email configuration
export const validateEmailConfig = () => {
    const requiredVars = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'];
    const missing = requiredVars.filter(varName => !process.env[varName]);

    if (missing.length > 0) {
        return {
            valid: false,
            missing,
            message: `Missing required environment variables: ${missing.join(', ')}`
        };
    }

    return { valid: true, message: 'Email configuration is valid' };
};