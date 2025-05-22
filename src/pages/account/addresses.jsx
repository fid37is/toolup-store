
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import AddressManager from '../../components/AddressManager';
import { useRouter } from 'next/router';

const ShippingAddressesPage = () => {
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
                                    Addresses
                                </h1>
                                <div className="flex items-center justify-center">
                                    <div className="h-1 w-16 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"></div>
                                </div>
                            </div>
                            
                            <div className="w-20"></div> {/* Spacer for centering */}
                        </div>
                <AddressManager mode="settings" />
            </main>
            <Footer />
        </>
    );
};

export default ShippingAddressesPage;