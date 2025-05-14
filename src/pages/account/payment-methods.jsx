import { CreditCard, Plus } from 'lucide-react';

const PaymentMethodsPage = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Payment Methods</h1>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium">Saved Payment Methods</h2>
                    <button className="flex items-center text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-1" /> Add New Card
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Empty state */}
                    <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <CreditCard className="mx-auto w-12 h-12 text-gray-400 mb-2" />
                        <p className="text-gray-500 mb-4">You don't have any saved payment methods yet</p>
                        <button className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                            Add Your First Card
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium mb-4">Payment History</h2>
                <div className="border border-gray-200 rounded-lg p-6 text-center">
                    <p className="text-gray-500">No payment history available</p>
                </div>
            </div>
        </div>
    );
};

export default PaymentMethodsPage;