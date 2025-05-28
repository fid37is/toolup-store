// test-order-webhook.js
import { createHmac } from 'crypto';

const SECRET = 'ae8a6bdd13ccd86ee36c0595e0d905ce49779a803359861650071cfab2281cc0';
const WEBHOOK_URL = 'http://localhost:3001/api/orders/receive-webhook';

const mockOrderData = {
    orderId: 'ORD-TEST-12345',
    userId: 'user-123',
    customer: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phoneNumber: '+1234567890',
        address: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        additionalInfo: 'Test order'
    },
    items: [
        {
            productId: 'prod-1',
            name: 'Test Product',
            quantity: 2,
            price: 25.99,
            imageUrl: 'https://example.com/image.jpg',
            sku: 'TEST-SKU-001'
        }
    ],
    totalAmount: 51.98,
    shippingFee: 5.00,
    currency: 'NGN',
    paymentMethod: 'card',
    status: 'pending',
    isAuthenticated: true,
    isGuestCheckout: false,
    createdAt: new Date().toISOString()
};

const payload = {
    event: 'new_order',
    timestamp: new Date().toISOString(),
    data: mockOrderData
};

const payloadString = JSON.stringify(payload);
const signature = createHmac('sha256', SECRET)
    .update(payloadString, 'utf8')
    .digest('hex');

async function testOrderWebhook() {
    console.log('=== TESTING ORDER WEBHOOK ===');
    console.log('Order ID:', mockOrderData.orderId);
    console.log('Customer:', `${mockOrderData.customer.firstName} ${mockOrderData.customer.lastName}`);
    console.log('Total:', `${mockOrderData.currency} ${mockOrderData.totalAmount}`);
    console.log('');

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Webhook-Signature': `sha256=${signature}`,
                'User-Agent': 'StoreFront-Webhook/1.0'
            },
            body: payloadString
        });

        const result = await response.text();
        console.log('=== WEBHOOK RESPONSE ===');
        console.log('Status:', response.status);
        console.log('Response:', result);
        
        if (response.ok) {
            console.log('✅ Order webhook test PASSED!');
            console.log('Check your inventory app for the new order notification.');
        } else {
            console.log('❌ Order webhook test FAILED!');
        }
    } catch (error) {
        console.error('❌ Error testing order webhook:', error.message);
    }
}

// Run the test
testOrderWebhook();