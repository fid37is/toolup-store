import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useState } from 'react';

const AddCardForm = ({ onClose }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setLoading(true);
        const card = elements.getElement(CardElement);
        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card,
        });

        if (error) {
            alert(error.message);
        } else {
            // Send paymentMethod.id to backend here
            alert(`Card added: ${paymentMethod.card.brand} •••• ${paymentMethod.card.last4}`);
            onClose();
        }

        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="border p-4 rounded mt-4 bg-gray-50">
            <CardElement className="p-2 border rounded bg-white" />
            <div className="mt-4 flex justify-end space-x-2">
                <button
                    type="button"
                    onClick={onClose}
                    className="text-sm text-gray-500 hover:text-gray-700"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={!stripe || loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    {loading ? 'Saving...' : 'Save Card'}
                </button>
            </div>
        </form>
    );
};

export default AddCardForm;
