import { useState } from 'react';
import { CreditCard, Plus, ChevronLeft } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const PaymentMethodsPage = () => {
    return (
        <>
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => window.history.back()}
                    className="inline-flex items-center text-primary-500 hover:text-primary-700 font-medium"
                >
                    <ChevronLeft className="h-5 w-5 mr-1" />
                    Back
                </button>

                <h1 className="text-3xl font-bold text-gray-800 text-right ml-auto">
                    Payment Methods
                </h1>
            </div>



            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium">Saved Payment Methods</h2>
                    <button className="flex items-center text-sm bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-700">
                        <Plus className="w-4 h-4 mr-1" /> Add New Card
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Empty state */}
                    <div className="bg-white rounded-lg p-8 text-center border border-dashed border-gray-300">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <CreditCard className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-700 mb-2">No payment methods yet</h3>
                        <p className="text-gray-500 mb-6">Add a payment method to make checkout easier</p>
                        <button className="inline-block px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-700">
                            Add Your First Card
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-medium mb-4">Payment History</h2>
                <div className="border border-gray-200 rounded-lg p-6 text-center">
                    <p className="text-gray-500">No payment history available</p>
                </div>
            </div>
        </div>
        <Footer />
        </>
    );
};

export default PaymentMethodsPage;