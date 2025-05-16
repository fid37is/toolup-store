// src/components/checkout/ContactInformation.jsx
export default function ContactInformation({ formData, handleInputChange }) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 pb-2 border-b text-xl font-semibold text-gray-800">Contact Information</h2>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-accent-500 focus:ring-accent-500 sm:text-sm"
                        placeholder="your.email@example.com"
                    />
                </div>

                <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                        First Name
                    </label>
                    <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-accent-500 focus:ring-accent-500 sm:text-sm"
                    />
                </div>

                <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                        Last Name
                    </label>
                    <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-accent-500 focus:ring-accent-500 sm:text-sm"
                    />
                </div>

                <div className="sm:col-span-2">
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-accent-500 focus:ring-accent-500 sm:text-sm"
                        placeholder="+234"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        For delivery coordination and order updates
                    </p>
                </div>
            </div>
        </div>
    );
}