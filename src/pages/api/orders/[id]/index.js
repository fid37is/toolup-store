import { getGoogleSheetsClient } from '@/lib/googleSheets';

const SHEET_ID = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_ID;
const ORDERS_SHEET_NAME = 'Orders';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { id } = req.query;

    try {
        const sheets = await getGoogleSheetsClient();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: ORDERS_SHEET_NAME,
        });

        const [header, ...rows] = response.data.values || [];
        const orders = rows.map((row, index) => {
            const obj = {};
            header.forEach((key, i) => {
                obj[key] = row[i] || '';
            });
            obj._rowIndex = index + 2; // Google Sheets rows are 1-indexed, row 1 is header
            return obj;
        });

        const order = orders.find(order => order.orderId === id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({ order });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: 'Failed to fetch order' });
    }
}
