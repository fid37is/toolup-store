import React, { useState, useEffect } from 'react';
import { getStates, getLGAs } from '../utils/locationService';
import { getUserAddresses, addUserAddress, updateUserAddress, deleteUserAddress, setDefaultAddress } from '../services/addressService';
import { MapPin, Plus, Edit, Trash2, Check, X } from 'lucide-react';

const AddressManager = ({ 
    mode = 'settings', // 'settings' or 'checkout'
    onAddressSelect, // callback for checkout mode
    formData, // for checkout mode
    handleInputChange, // for checkout mode
    setShippingFee,
    baseShippingFee,
    setBaseShippingFee,
    paymentMethod
}) => {
    const [addresses, setAddresses] = useState([]);
    const [states, setStates] = useState([]);
    const [lgas, setLGAs] = useState([]);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [isEditing, setIsEditing] = useState(null);
    const [isLoadingStates, setIsLoadingStates] = useState(false);
    const [isLoadingLGAs, setIsLoadingLGAs] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState(null);

    const [newAddressForm, setNewAddressForm] = useState({
        addressName: '',
        address: '',
        state: '',
        lga: '',
        city: '',
        town: '',
        landmark: '',
        zip: '',
        additionalInfo: '',
        isDefault: false
    });

    // Load addresses and states
    useEffect(() => {
        if (mode === 'settings') {
            loadAddresses();
        }
        loadStates();
    }, [mode]);

    // Load LGAs when state changes in new address form
    useEffect(() => {
        if (newAddressForm.state) {
            loadLGAs(newAddressForm.state);
        }
    }, [newAddressForm.state]);

    // Load LGAs when state changes in checkout form
    useEffect(() => {
        if (formData?.state && mode === 'checkout') {
            loadLGAsForCheckout(formData.state);
        }
    }, [formData?.state, mode]);

    // Update shipping fee when state changes in checkout
    useEffect(() => {
        if (mode === 'checkout' && formData?.state && paymentMethod !== 'pay_on_pickup') {
            const fee = calculateShippingFee(formData.state);
            setShippingFee(fee);
            if (setBaseShippingFee) {
                setBaseShippingFee(fee);
            }
        }
    }, [formData?.state, paymentMethod, mode, setShippingFee, setBaseShippingFee]);

    const loadAddresses = async () => {
        try {
            const userAddresses = await getUserAddresses();
            setAddresses(userAddresses);
        } catch (error) {
            console.error('Error loading addresses:', error);
        }
    };

    const loadStates = async () => {
        setIsLoadingStates(true);
        try {
            const statesData = await getStates();
            const sortedStates = [...statesData].sort((a, b) => {
                if (a === 'Delta') return -1;
                if (b === 'Delta') return 1;
                return a.localeCompare(b);
            });
            setStates(sortedStates);
        } catch (error) {
            console.error('Error loading states:', error);
        } finally {
            setIsLoadingStates(false);
        }
    };

    const loadLGAs = async (state) => {
        setIsLoadingLGAs(true);
        try {
            const lgasData = await getLGAs(state);
            setLGAs(lgasData);
        } catch (error) {
            console.error('Error loading LGAs:', error);
        } finally {
            setIsLoadingLGAs(false);
        }
    };

    const loadLGAsForCheckout = async (state) => {
        try {
            const lgasData = await getLGAs(state);
            setLGAs(lgasData);
        } catch (error) {
            console.error('Error loading LGAs for checkout:', error);
        }
    };

    const handleNewAddressChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewAddressForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSaveAddress = async () => {
        try {
            if (isEditing) {
                await updateUserAddress(isEditing, newAddressForm);
            } else {
                await addUserAddress(newAddressForm);
            }
            
            setIsAddingNew(false);
            setIsEditing(null);
            setNewAddressForm({
                addressName: '', address: '', state: '', lga: '', city: '', 
                town: '', landmark: '', zip: '', additionalInfo: '', isDefault: false
            });
            
            if (mode === 'settings') {
                loadAddresses();
            }
        } catch (error) {
            console.error('Error saving address:', error);
        }
    };

    const handleEditAddress = (address) => {
        setNewAddressForm(address);
        setIsEditing(address.id);
        setIsAddingNew(true);
    };

    const handleDeleteAddress = async (addressId) => {
        if (window.confirm('Are you sure you want to delete this address?')) {
            try {
                await deleteUserAddress(addressId);
                loadAddresses();
            } catch (error) {
                console.error('Error deleting address:', error);
            }
        }
    };

    const handleSetDefault = async (addressId) => {
        try {
            await setDefaultAddress(addressId);
            loadAddresses();
        } catch (error) {
            console.error('Error setting default address:', error);
        }
    };

    const handleSelectAddress = (address) => {
        if (mode === 'checkout' && onAddressSelect) {
            setSelectedAddressId(address.id);
            onAddressSelect({
                address: address.address,
                state: address.state,
                lga: address.lga,
                city: address.city,
                town: address.town || '',
                landmark: address.landmark || '',
                zip: address.zip || '',
                additionalInfo: address.additionalInfo || ''
            });
        }
    };

    const calculateShippingFee = (state) => {
        if (!state) return 3500;
        if (state.toLowerCase() === 'delta') return 1000;
        if (state.toLowerCase() === 'abuja' || state.toLowerCase() === 'fct') return 4000;
        return 3500;
    };

    // Settings Mode Render
    if (mode === 'settings') {
        return (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                {/* Header */}
                <div className="border-b border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <MapPin className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Shipping Addresses</h2>
                                <p className="text-sm text-gray-500">Manage your delivery addresses</p>
                            </div>
                        </div>
                        {!isAddingNew && !isEditing && (
                            <button
                                onClick={() => setIsAddingNew(true)}
                                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Add Address</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="p-6">
                    {/* Add/Edit Form */}
                    {(isAddingNew || isEditing) && (
                        <div className="mb-8 border border-gray-200 rounded-xl p-6 bg-gradient-to-br from-gray-50 to-white">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                {isEditing ? 'Edit Address' : 'Add New Address'}
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Address Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="addressName"
                                        placeholder="Home, Work, etc."
                                        value={newAddressForm.addressName}
                                        onChange={handleNewAddressChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Street Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        placeholder="House number, street name"
                                        value={newAddressForm.address}
                                        onChange={handleNewAddressChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        State <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="state"
                                        value={newAddressForm.state}
                                        onChange={handleNewAddressChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">Select State</option>
                                        {states.map(state => (
                                            <option key={state} value={state}>{state}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        LGA <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="lga"
                                        value={newAddressForm.lga}
                                        onChange={handleNewAddressChange}
                                        disabled={!newAddressForm.state || isLoadingLGAs}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                                        required
                                    >
                                        <option value="">
                                            {isLoadingLGAs ? 'Loading...' : 'Select LGA'}
                                        </option>
                                        {lgas.map(lga => (
                                            <option key={lga} value={lga}>{lga}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        City <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        placeholder="City"
                                        value={newAddressForm.city}
                                        onChange={handleNewAddressChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Town/Area
                                    </label>
                                    <input
                                        type="text"
                                        name="town"
                                        placeholder="Town or Area"
                                        value={newAddressForm.town}
                                        onChange={handleNewAddressChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Landmark
                                    </label>
                                    <input
                                        type="text"
                                        name="landmark"
                                        placeholder="Nearest landmark"
                                        value={newAddressForm.landmark}
                                        onChange={handleNewAddressChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        ZIP Code
                                    </label>
                                    <input
                                        type="text"
                                        name="zip"
                                        placeholder="Postal code"
                                        value={newAddressForm.zip}
                                        onChange={handleNewAddressChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Additional Information
                                    </label>
                                    <textarea
                                        name="additionalInfo"
                                        placeholder="Any additional delivery instructions"
                                        value={newAddressForm.additionalInfo}
                                        onChange={handleNewAddressChange}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            name="isDefault"
                                            checked={newAddressForm.isDefault}
                                            onChange={handleNewAddressChange}
                                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">Set as default address</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={handleSaveAddress}
                                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Check className="h-4 w-4" />
                                    <span>{isEditing ? 'Update Address' : 'Save Address'}</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setIsAddingNew(false);
                                        setIsEditing(null);
                                        setNewAddressForm({
                                            addressName: '', address: '', state: '', lga: '', city: '', 
                                            town: '', landmark: '', zip: '', additionalInfo: '', isDefault: false
                                        });
                                    }}
                                    className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                    <span>Cancel</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Address List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {addresses.map(address => (
                            <div key={address.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center space-x-2">
                                        <h3 className="font-semibold text-gray-900">{address.addressName}</h3>
                                        {address.isDefault && (
                                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                                Default
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <button
                                            onClick={() => handleEditAddress(address)}
                                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteAddress(address.id)}
                                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p>{address.address}</p>
                                    <p>{address.city}, {address.lga}</p>
                                    <p>{address.state}</p>
                                    {address.landmark && <p>Near: {address.landmark}</p>}
                                </div>

                                {!address.isDefault && (
                                    <button
                                        onClick={() => handleSetDefault(address.id)}
                                        className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        Set as Default
                                    </button>
                                )}
                            </div>
                        ))}

                        {addresses.length === 0 && !isAddingNew && (
                            <div className="md:col-span-2 text-center py-8">
                                <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">No addresses saved yet</p>
                                <p className="text-sm text-gray-400">Add your first address to get started</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Checkout Mode Render
    return (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            {/* Header */}
            <div className="border-b border-gray-100 p-6">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <MapPin className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Shipping Address</h2>
                        <p className="text-sm text-gray-500">Where should we deliver your order?</p>
                    </div>
                </div>
            </div>

            <div className="p-6">
                {/* Saved Addresses */}
                {addresses.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Choose from saved addresses</h3>
                        <div className="space-y-3">
                            {addresses.map(address => (
                                <div 
                                    key={address.id}
                                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                        selectedAddressId === address.id 
                                            ? 'border-blue-500 bg-blue-50 shadow-sm' 
                                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                    }`}
                                    onClick={() => handleSelectAddress(address)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900">{address.addressName}</p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {address.address}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {address.city}, {address.lga}, {address.state}
                                            </p>
                                            {address.landmark && (
                                                <p className="text-xs text-gray-500 mt-1">Near: {address.landmark}</p>
                                            )}
                                        </div>
                                        {selectedAddressId === address.id && (
                                            <div className="p-1 bg-blue-500 rounded-full">
                                                <Check className="h-3 w-3 text-white" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 text-center">
                            <div className="flex items-center">
                                <div className="flex-1 border-t border-gray-200"></div>
                                <span className="px-3 text-sm text-gray-500">or enter address manually</span>
                                <div className="flex-1 border-t border-gray-200"></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Manual Address Form */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Street Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="address"
                            placeholder="House number, street name"
                            value={formData?.address || ''}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                State <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="state"
                                value={formData?.state || ''}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="">Select State</option>
                                {states.map(state => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                LGA <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="lga"
                                value={formData?.lga || ''}
                                onChange={handleInputChange}
                                disabled={!formData?.state}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                                required
                            >
                                <option value="">Select LGA</option>
                                {lgas.map(lga => (
                                    <option key={lga} value={lga}>{lga}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                City <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="city"
                                placeholder="City"
                                value={formData?.city || ''}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Town/Area
                            </label>
                            <input
                                type="text"
                                name="town"
                                placeholder="Town or Area"
                                value={formData?.town || ''}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Landmark
                            </label>
                            <input
                                type="text"
                                name="landmark"
                                placeholder="Nearest landmark"
                                value={formData?.landmark || ''}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                ZIP Code
                            </label>
                            <input
                                type="text"
                                name="zip"
                                placeholder="Postal code"
                                value={formData?.zip || ''}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Additional Information
                        </label>
                        <textarea
                            name="additionalInfo"
                            placeholder="Any special delivery instructions"
                            value={formData?.additionalInfo || ''}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Shipping Fee Info */}
                {formData?.state && paymentMethod !== 'pay_on_pickup' && (
                    <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                        <div className="flex items-center space-x-2">
                            <div className="p-1 bg-blue-500 rounded-full">
                                <Check className="h-3 w-3 text-white" />
                            </div>
                            <p className="text-sm font-medium text-blue-900">
                                Shipping to {formData.state}: ₦{calculateShippingFee(formData.state).toLocaleString()}
                            </p>
                        </div>
                        {formData.state.toLowerCase() === 'delta' && (
                            <p className="text-xs text-blue-700 mt-1 ml-5">
                                🎉 You're in our business location - enjoy reduced shipping!
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddressManager;