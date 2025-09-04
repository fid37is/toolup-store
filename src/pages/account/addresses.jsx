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
                {/* Mobile Layout - Stack vertically */}
                <div className="block md:hidden mb-6">
                    {/* Back button */}
                    <div className="mb-4">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center text-primary-700 hover:text-primary-500 transition-all duration-200 font-medium bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md border border-gray-200"
                        >
                            <span className="mr-2 text-lg">←</span> Back
                        </button>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-4">
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">
                            Addresses
                        </h1>
                    </div>
                </div>

                {/* Desktop Layout - Grid */}
                <div className="hidden md:grid grid-cols-3 items-center mb-6">
                    {/* Left column - Back button */}
                    <div className="justify-self-start">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center text-primary-700 hover:text-primary-500 transition-all duration-200 font-medium bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md border border-gray-200"
                        >
                            <span className="mr-2 text-lg">←</span> Back
                        </button>
                    </div>

                    {/* Center column - Title */}
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-800 mb-2">
                            Addresses
                        </h1>
                    </div>

                    {/* Right column - Spacer */}
                    <div className="justify-self-end">
                        {/* Empty for balance */}
                    </div>
                </div>

                <AddressManager mode="settings" />
            </main>
            <Footer />
        </>
    );
};

export default ShippingAddressesPage;