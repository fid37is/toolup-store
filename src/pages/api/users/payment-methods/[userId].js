// src/pages/api/users/payment-methods/[userId].js
// Update your existing API endpoint to ensure it returns data in this format:

export default async function handler(req, res) {
    const { userId } = req.query;
    
    if (req.method === 'GET') {
        try {
            // Your existing logic to fetch user payment methods
            const userPaymentData = await getUserPaymentMethods(userId);
            
            // Ensure the response format matches what the component expects
            const response = {
                savedCards: userPaymentData.savedCards || [],
                paymentMethods: userPaymentData.paymentMethods || [],
                defaultMethodId: userPaymentData.defaultMethodId || null,
                defaultMethodType: userPaymentData.defaultMethodType || null
            };
            
            res.status(200).json(response);
        } catch (error) {
            console.error('Error fetching payment methods:', error);
            res.status(500).json({ 
                error: 'Failed to fetch payment methods',
                savedCards: [],
                paymentMethods: []
            });
        }
    }
    
    if (req.method === 'PUT') {
        // Your existing PUT logic for updating default payment method
        // ... existing code
    }
}

// Expected data structure for savedCards:
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const expectedSavedCardStructure = {
    id: 'card123',
    cardType: 'Visa', // or 'Mastercard'
    cardNumber: '****1234', // Last 4 digits
    expiryMonth: '12',
    expiryYear: '25',
    holderName: 'John Doe',
    isDefault: false,
    createdAt: '2024-01-01T00:00:00.000Z'
};