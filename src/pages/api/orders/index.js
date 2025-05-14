import { getGoogleSheetsClient } from '@/lib/googleSheets';

const SHEET_ID = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_ID;
const ORDERS_SHEET_NAME = 'Orders';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const sheets = await getGoogleSheetsClient();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: ORDERS_SHEET_NAME,
        });

        const [header, ...rows] = response.data.values || [];
        const orders = rows.map(row => {
            const obj = {};
            header.forEach((key, index) => {
                obj[key] = row[index] || '';
            });
            return obj;
        });

        // Optional filtering by ?email=
        const { email } = req.query;
        const filtered = email
            ? orders.filter(order => order.userEmail === email)
            : orders;

        res.status(200).json({ orders: filtered });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Failed to fetch orders' });
    }
}
