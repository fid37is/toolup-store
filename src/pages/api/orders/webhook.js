import crypto from 'crypto';
import { WEBHOOK_CONFIG } from '../../../lib/websocket-config';

// Function to create webhook signature
const createSignature = (payload, secret) => {
    return crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex');
};

// Function to send webhook to inventory app
export const sendOrderWebhook = async (orderData) => {
    try {
        const payload = {
            event: 'new_order',
            timestamp: new Date().toISOString(),
            data: orderData
        };

        const signature = createSignature(payload, WEBHOOK_CONFIG.WEBHOOK_SECRET);

        const response = await fetch(WEBHOOK_CONFIG.INVENTORY_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Webhook-Signature': `sha256=${signature}`,
                'User-Agent': 'StoreFront-Webhook/1.0'
            },
            body: JSON.stringify(payload),
            timeout: 10000 // 10 second timeout
        });

        if (!response.ok) {
            throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Webhook sent successfully:', result);
        return { success: true, data: result };

    } catch (error) {
        console.error('Failed to send webhook:', error);
        return { success: false, error: error.message };
    }
};

// API handler for manual webhook testing
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { orderData } = req.body;

        if (!orderData) {
            return res.status(400).json({ error: 'Order data is required' });
        }

        const result = await sendOrderWebhook(orderData);

        if (result.success) {
            res.status(200).json({
                success: true,
                message: 'Webhook sent successfully',
                data: result.data
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }

    } catch (error) {
        console.error('Webhook API error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}