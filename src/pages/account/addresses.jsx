import { Map, Home, Building, Plus, Trash2 } from 'lucide-react';

const ShippingAddressesPage = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <button
                onClick={() => window.history.back()}
                className="sticky top-4 z-10 mb-4 inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
            >
                <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back
            </button>
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Settings</h1>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium">Your Addresses</h2>
                    <button className="flex items-center text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-1" /> Add New Address
                    </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    {/* Address Card */}
                    <div className="border border-gray-200 rounded-lg p-4 relative">
                        <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded absolute top-3 right-3">
                            Default
                        </div>
                        <div className="flex items-start mb-3">
                            <Home className="w-5 h-5 text-gray-500 mr-2 mt-1" />
                            <div>
                                <h3 className="font-medium">Home</h3>
                                <p className="text-sm text-gray-600">
                                    John Doe<br />
                                    123 Main Street<br />
                                    Apt 4B<br />
                                    New York, NY 10001<br />
                                    United States<br />
                                    Phone: (555) 123-4567
                                </p>
                            </div>
                        </div>
                        <div className="flex space-x-2 mt-4">
                            <button className="text-sm text-gray-600 border border-gray-300 px-3 py-1 rounded hover:bg-gray-50">
                                Edit
                            </button>
                            <button className="text-sm text-red-600 border border-gray-300 px-3 py-1 rounded hover:bg-gray-50 flex items-center">
                                <Trash2 className="w-3 h-3 mr-1" /> Remove
                            </button>
                        </div>
                    </div>

                    {/* Empty Address Card */}
                    <div className="border border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center">
                        <Map className="w-10 h-10 text-gray-400 mb-2" />
                        <p className="text-gray-500 mb-3">Add a new shipping address</p>
                        <button className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                            Add Address
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm font-medium mb-2">Need to know</h3>
                <p className="text-xs text-gray-600">
                    You can add up to 5 shipping addresses to your account. The default address will be
                    automatically selected during checkout, but you can change it during the ordering process.
                </p>
            </div>
        </div>
    );
};

export default ShippingAddressesPage;