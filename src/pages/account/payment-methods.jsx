
import { CreditCard, Plus, ChevronLeft } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useRouter } from 'next/router';

const PaymentMethodsPage = () => {
    const router = useRouter();
    return (
        <>
            <Header />
            <main className="container max-w-6xl mx-auto px-4 py-8 bg-gray-50 min-h-screen">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-primary-700 hover:text-primary-500 transition-all duration-200 font-medium bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md border border-gray-200"
                    >
                        <span className="mr-2 text-lg">←</span> Back
                    </button>

                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-800 mb-2">
                            Payment Methods
                        </h1>
                        <div className="flex items-center justify-center">
                            <div className="h-1 w-16 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"></div>
                        </div>
                    </div>

                    <div className="w-20"></div> {/* Spacer for centering */}
                </div>



                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-medium">Saved Payment Methods</h2>
                        <button className="flex items-center text-sm bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-700">
                            <Plus className="w-4 h-4 mr-1" /> New Card
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
            </main>
            <Footer />
        </>
    );
};

export default PaymentMethodsPage;