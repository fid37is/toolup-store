// src/pages/api/orders/create.js
import { google } from 'googleapis';
import { generateId } from '../../../utils/helpers';

const getAuthClient = () => {
    const creds = process.env.GOOGLE_CREDENTIALS_B64
        ? JSON.parse(Buffer.from(process.env.GOOGLE_CREDENTIALS_B64, 'base64').toString('utf-8'))
        : {
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        };

    return new google.auth.JWT(
        creds.client_email,
        null,
        creds.private_key,
        ['https://www.googleapis.com/auth/spreadsheets']
    );
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const auth = getAuthClient();
        await auth.authorize();
        const sheets = google.sheets({ version: 'v4', auth });

        const {
            items,
            customer,
            shippingFee,
            paymentMethod,
            totalAmount,
            currency,
        } = req.body;

        const orderId = generateId(); // ✅ Now used
        const timestamp = new Date().toISOString();

        const row = [
            orderId,
            customer?.name || '',
            customer?.email || '',
            JSON.stringify(items),
            totalAmount,
            shippingFee,
            paymentMethod,
            currency,
            'Processing', // initial status
            timestamp,
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.NEXT_PUBLIC_GOOGLE_SHEETS_ID,
            range: 'Orders!A:J',
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [row] },
        });

        res.status(200).json({ success: true, orderId });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ success: false, message: 'Failed to create order' });
    }
}
