// pages/api/orders/update-status.js
import { sendOrderStatusEmail } from '../../../services/emailService';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { orderId, newStatus, orderDetails } = req.body;

        // Validate required fields
        if (!orderId || !newStatus) {
            return res.status(400).json({ error: 'Order ID and new status are required' });
        }

        // Here you would typically update the order in your database
        // const result = await db.collection('orders').updateOne(
        //   { orderId },
        //   { 
        //     $set: { 
        //       status: newStatus, 
        //       updatedAt: new Date().toISOString() 
        //     } 
        //   }
        // );

        // If order details are provided and status change warrants an email
        const emailStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];

        if (orderDetails && emailStatuses.includes(newStatus)) {
            try {
                const emailResult = await sendOrderStatusEmail(orderDetails, newStatus);

                if (emailResult.success) {
                    console.log('Order status email sent successfully');
                } else {
                    console.error('Failed to send status email:', emailResult.error);
                }
            } catch (emailError) {
                console.error('Status email service error:', emailError);
            }
        }

        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            orderId,
            newStatus
        });

    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({
            error: 'Failed to update order status',
            details: error.message
        });
    }
}