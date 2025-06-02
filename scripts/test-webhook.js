// test-webhook.js
import { createHmac } from 'crypto';

const SECRET = 'ae8a6bdd13ccd86ee36c0595e0d905ce49779a803359861650071cfab2281cc0';
const WEBHOOK_URL = 'http://localhost:3001/api/orders/receive-webhook';

const payload = {
    event: 'new_order',  // ✅ Change from 'test' to a real event
    timestamp: new Date().toISOString(),
    data: {
        orderId: 'ORD-TEST-123',
        items: [],
        customer: {},
        totalAmount: 0,
        status: 'pending'
    }
};

// Convert to JSON string
const payloadString = JSON.stringify(payload);

// Create proper signature
const signature = createHmac('sha256', SECRET)
    .update(payloadString, 'utf8')
    .digest('hex');

console.log('=== WEBHOOK TEST SETUP ===');
console.log('Payload:', payloadString);
console.log('Signature:', `sha256=${signature}`);
console.log('');

// Generate curl command
console.log('=== CURL COMMAND ===');
console.log(`curl -X POST ${WEBHOOK_URL} \\`);
console.log(`  -H "Content-Type: application/json" \\`);
console.log(`  -H "X-Webhook-Signature: sha256=${signature}" \\`);
console.log(`  -d '${payloadString}'`);
console.log('');

// Test with fetch automatically
async function testWebhook() {
    console.log('=== TESTING WEBHOOK WITH FETCH ===');
    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Webhook-Signature': `sha256=${signature}`
            },
            body: payloadString
        });

        const result = await response.text();
        console.log('Status:', response.status);
        console.log('Response:', result);
        
        if (response.ok) {
            console.log('✅ Webhook test PASSED!');
        } else {
            console.log('❌ Webhook test FAILED!');
        }
    } catch (error) {
        console.error('❌ Error testing webhook:', error.message);
    }
}

// Run the test immediately
testWebhook();