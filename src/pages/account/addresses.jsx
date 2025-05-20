import { useState, useEffect } from 'react';
import { Map, Home, Building, Plus, Trash2, Check, ChevronLeft, X } from 'lucide-react';
import { getStates, getLGAs } from '../../utils/locationService';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const ShippingAddressesPage = () => {
    const [addresses, setAddresses] = useState([]);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [isEditing, setIsEditing] = useState(null);
    const [states, setStates] = useState([]);
    const [lgas, setLGAs] = useState([]);
    const [isLoadingStates, setIsLoadingStates] = useState(false);
    const [isLoadingLGAs, setIsLoadingLGAs] = useState(false);

    const [formData, setFormData] = useState({
        addressName: '',
        fullName: '',
        phoneNumber: '',
        address: '',
        state: '',
        lga: '',
        city: '',
        town: '',
        zip: '',
        additionalInfo: '',
        isDefault: false
    });

    // Fetch addresses from API/localStorage on mount
    useEffect(() => {
        const savedAddresses = localStorage.getItem('shippingAddresses');
        if (savedAddresses) {
            setAddresses(JSON.parse(savedAddresses));
        }
    }, []);

    // Save addresses to localStorage when they change
    useEffect(() => {
        if (addresses.length > 0) {
            localStorage.setItem('shippingAddresses', JSON.stringify(addresses));
        }
    }, [addresses]);

    // Fetch states on component mount
    useEffect(() => {
        const fetchStates = async () => {
            setIsLoadingStates(true);
            try {
                const statesData = await getStates();
                setStates(statesData);
            } catch (error) {
                console.error('Error fetching states:', error);
            } finally {
                setIsLoadingStates(false);
            }
        };

        fetchStates();
    }, []);

    // Fetch LGAs when state is selected
    useEffect(() => {
        const fetchLGAs = async () => {
            if (!formData.state) {
                setLGAs([]);
                return;
            }

            setIsLoadingLGAs(true);
            try {
                const lgasData = await getLGAs(formData.state);
                setLGAs(lgasData);
            } catch (error) {
                console.error(`Error fetching LGAs for ${formData.state}:`, error);
            } finally {
                setIsLoadingLGAs(false);
            }
        };

        fetchLGAs();
    }, [formData.state]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const resetForm = () => {
        setFormData({
            addressName: '',
            fullName: '',
            phoneNumber: '',
            address: '',
            state: '',
            lga: '',
            city: '',
            town: '',
            zip: '',
            additionalInfo: '',
            isDefault: false
        });
    };

    const handleAddAddress = () => {
        const newAddress = {
            id: Date.now().toString(),
            ...formData
        };

        // If this is the first address or it's marked as default
        if (addresses.length === 0 || formData.isDefault) {
            // Set all other addresses to non-default
            const updatedAddresses = addresses.map(addr => ({
                ...addr,
                isDefault: false
            }));
            setAddresses([...updatedAddresses, newAddress]);
        } else {
            setAddresses([...addresses, newAddress]);
        }

        setIsAddingNew(false);
        resetForm();
    };

    const handleEditAddress = (id) => {
        const addressToEdit = addresses.find(addr => addr.id === id);
        if (addressToEdit) {
            setFormData(addressToEdit);
            setIsEditing(id);
        }
    };

    const handleUpdateAddress = () => {
        const updatedAddresses = addresses.map(addr => {
            if (addr.id === isEditing) {
                return { ...formData, id: addr.id };
            }
            // If current address is set as default, make sure others are not
            if (formData.isDefault && addr.id !== isEditing) {
                return { ...addr, isDefault: false };
            }
            return addr;
        });

        setAddresses(updatedAddresses);
        setIsEditing(null);
        resetForm();
    };

    const handleRemoveAddress = (id) => {
        const filteredAddresses = addresses.filter(addr => addr.id !== id);

        // If we removed the default address and others exist, make the first one default
        if (addresses.find(addr => addr.id === id)?.isDefault && filteredAddresses.length > 0) {
            filteredAddresses[0].isDefault = true;
        }

        setAddresses(filteredAddresses);
    };

    const handleSetDefault = (id) => {
        const updatedAddresses = addresses.map(addr => ({
            ...addr,
            isDefault: addr.id === id
        }));
        setAddresses(updatedAddresses);
    };

    const cancelForm = () => {
        if (isEditing) {
            setIsEditing(null);
        } else {
            setIsAddingNew(false);
        }
        resetForm();
    };

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
                    Addresses Settings
                </h1>
            </div>


            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium">Your Shipping Addresses</h2>
                    {!isAddingNew && !isEditing && addresses.length < 5 && (
                        <button
                            onClick={() => setIsAddingNew(true)}
                            className="flex items-center text-sm bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-700"
                        >
                            <Plus className="w-4 h-4 mr-1" /> Add New Address
                        </button>
                    )}
                </div>

                {/* Form for adding or editing addresses */}
                {(isAddingNew || isEditing) && (
                    <div className="mb-6 border rounded-lg p-4 bg-gray-50">
                        <h3 className="text-lg font-medium mb-4">
                            {isEditing ? 'Edit Address' : 'Add New Address'}
                        </h3>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="addressName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Address Name
                                </label>
                                <input
                                    type="text"
                                    id="addressName"
                                    name="addressName"
                                    value={formData.addressName}
                                    onChange={handleInputChange}
                                    placeholder="Home, Work, etc."
                                    className="w-full rounded border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    id="fullName"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    className="w-full rounded border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                    className="w-full rounded border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                    Street Address
                                </label>
                                <input
                                    type="text"
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="w-full rounded border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                                    State
                                </label>
                                <select
                                    id="state"
                                    name="state"
                                    value={formData.state || ''}
                                    onChange={handleInputChange}
                                    required
                                    disabled={isLoadingStates}
                                    className="w-full rounded border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                >
                                    <option value="">Select a state</option>
                                    {states.map((state) => (
                                        <option key={state} value={state}>
                                            {state}
                                        </option>
                                    ))}
                                </select>
                                {isLoadingStates && (
                                    <p className="text-xs text-gray-500 mt-1">Loading states...</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="lga" className="block text-sm font-medium text-gray-700 mb-1">
                                    LGA (Local Government Area)
                                </label>
                                <select
                                    id="lga"
                                    name="lga"
                                    value={formData.lga || ''}
                                    onChange={handleInputChange}
                                    required
                                    disabled={!formData.state || isLoadingLGAs}
                                    className="w-full rounded border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                >
                                    <option value="">Select LGA</option>
                                    {lgas.map((lga) => (
                                        <option key={lga} value={lga}>
                                            {lga}
                                        </option>
                                    ))}
                                </select>
                                {isLoadingLGAs && (
                                    <p className="text-xs text-gray-500 mt-1">Loading LGAs...</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                                    City
                                </label>
                                <input
                                    type="text"
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    className="w-full rounded border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="town" className="block text-sm font-medium text-gray-700 mb-1">
                                    Town/Area
                                </label>
                                <input
                                    type="text"
                                    id="town"
                                    name="town"
                                    value={formData.town}
                                    onChange={handleInputChange}
                                    className="w-full rounded border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1">
                                    Postal/ZIP Code
                                </label>
                                <input
                                    type="text"
                                    id="zip"
                                    name="zip"
                                    value={formData.zip}
                                    onChange={handleInputChange}
                                    className="w-full rounded border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-1">
                                    Additional Information
                                </label>
                                <textarea
                                    id="additionalInfo"
                                    name="additionalInfo"
                                    value={formData.additionalInfo}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full rounded border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                    placeholder="Landmark, delivery instructions, etc."
                                ></textarea>
                            </div>

                            <div className="md:col-span-2">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="isDefault"
                                        name="isDefault"
                                        checked={formData.isDefault}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
                                        Set as default shipping address
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={isEditing ? handleUpdateAddress : handleAddAddress}
                                disabled={!formData.fullName || !formData.address || !formData.state || !formData.lga || !formData.city}
                                className="bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                {isEditing ? 'Update Address' : 'Save Address'}
                            </button>
                            <button
                                onClick={cancelForm}
                                className="border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                    {addresses.length > 0 ? (
                        addresses.map((address) => (
                            <div key={address.id} className="border border-gray-200 rounded-lg p-4 relative">
                                {address.isDefault && (
                                    <div className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded absolute top-3 right-3">
                                        Default
                                    </div>
                                )}
                                <div className="flex items-start mb-3">
                                    <Home className="w-5 h-5 text-gray-500 mr-2 mt-1" />
                                    <div>
                                        <h3 className="font-medium">{address.addressName || 'Address'}</h3>
                                        <p className="text-sm text-gray-600">
                                            {address.fullName}<br />
                                            {address.address}<br />
                                            {address.town && `${address.town}, `}{address.city}<br />
                                            {address.lga}, {address.state}{address.zip && `, ${address.zip}`}<br />
                                            Phone: {address.phoneNumber}
                                        </p>
                                        {address.additionalInfo && (
                                            <p className="text-sm text-gray-500 mt-2">
                                                Note: {address.additionalInfo}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {!address.isDefault && (
                                        <button
                                            onClick={() => handleSetDefault(address.id)}
                                            className="text-sm text-primary-600 border border-gray-300 px-3 py-1 rounded hover:bg-gray-50 flex items-center"
                                        >
                                            <Check className="w-3 h-3 mr-1" /> Set as Default
                                        </button>
                                    )}
                                    {!isEditing && !isAddingNew && (
                                        <>
                                            <button
                                                onClick={() => handleEditAddress(address.id)}
                                                className="text-sm text-gray-600 border border-gray-300 px-3 py-1 rounded hover:bg-gray-50"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleRemoveAddress(address.id)}
                                                className="text-sm text-red-600 border border-gray-300 px-3 py-1 rounded hover:bg-gray-50 flex items-center"
                                            >
                                                <Trash2 className="w-3 h-3 mr-1" /> Remove
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : !isAddingNew ? (
                        <div className="md:col-span-2 border border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center">
                            <Map className="w-10 h-10 text-gray-400 mb-2" />
                            <p className="text-gray-500 mb-3">You haven't added any shipping addresses yet</p>
                            <button
                                onClick={() => setIsAddingNew(true)}
                                className="text-sm bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-700"
                            >
                                Add Your First Address
                            </button>
                        </div>
                    ) : null}

                    {/* Empty Address Card (only show when adding is possible) */}
                    {addresses.length > 0 && addresses.length < 5 && !isAddingNew && !isEditing && (
                        <div className="border border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center">
                            <Map className="w-10 h-10 text-gray-400 mb-2" />
                            <p className="text-gray-500 mb-3">Add a new shipping address</p>
                            <button
                                onClick={() => setIsAddingNew(true)}
                                className="text-sm bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-700"
                            >
                                Add Address
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm font-medium mb-2">Need to know</h3>
                <p className="text-xs text-gray-600">
                    You can add up to 5 shipping addresses to your account. The default address will be
                    automatically selected during checkout, but you can change it during the ordering process.
                    Your shipping addresses are stored locally on this device.
                </p>
            </div>
        </div>
        <Footer />
        </>
    );
};

export default ShippingAddressesPage;