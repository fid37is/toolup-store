import React, { useState, useEffect } from 'react';
import { getStates, getLGAs } from '../utils/locationService';
import { getUserAddresses, addUserAddress, updateUserAddress, deleteUserAddress, setDefaultAddress } from '../services/addressService';
import { MapPin, Plus, Edit, Trash2, Check, X, Loader2 } from 'lucide-react';

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
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(null);
    const [errors, setErrors] = useState({});

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
        loadAddresses();
        loadStates();
    }, []);

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
    // Update shipping fee when state changes in checkout
    useEffect(() => {
        if (mode === 'checkout' && formData?.state && paymentMethod !== 'pay_on_pickup') {
            const fee = calculateShippingFee(formData.state);

            // Add safety checks before calling the functions
            if (typeof setShippingFee === 'function') {
                setShippingFee(fee);
            }

            if (typeof setBaseShippingFee === 'function') {
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

    // Validation function
    const validateForm = () => {
        const newErrors = {};

        if (!newAddressForm.addressName.trim()) {
            newErrors.addressName = 'Address name is required';
        }

        if (!newAddressForm.address.trim()) {
            newErrors.address = 'Street address is required';
        }

        if (!newAddressForm.state) {
            newErrors.state = 'State is required';
        }

        if (!newAddressForm.lga) {
            newErrors.lga = 'LGA is required';
        }

        if (!newAddressForm.city.trim()) {
            newErrors.city = 'City is required';
        }

        // Optional validation for ZIP code format (if provided)
        if (newAddressForm.zip && !/^\d{6}$/.test(newAddressForm.zip)) {
            newErrors.zip = 'ZIP code should be 6 digits';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNewAddressChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewAddressForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSaveAddress = async () => {
        if (!validateForm()) {
            return;
        }

        setIsSaving(true);
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
            setErrors({});

            loadAddresses();
        } catch (error) {
            console.error('Error saving address:', error);
            // You might want to show a toast or error message here
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditAddress = (address) => {
        setNewAddressForm(address);
        setIsEditing(address.id);
        setIsAddingNew(true);
        setErrors({});
    };

    const handleDeleteAddress = async (addressId) => {
        if (window.confirm('Are you sure you want to delete this address?')) {
            setIsDeleting(addressId);
            try {
                await deleteUserAddress(addressId);
                loadAddresses();
            } catch (error) {
                console.error('Error deleting address:', error);
            } finally {
                setIsDeleting(null);
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

    const handleCancelForm = () => {
        setIsAddingNew(false);
        setIsEditing(null);
        setNewAddressForm({
            addressName: '', address: '', state: '', lga: '', city: '',
            town: '', landmark: '', zip: '', additionalInfo: '', isDefault: false
        });
        setErrors({});
    };

    // Helper function to render input with error
    const renderInput = (name, label, placeholder, required = false, type = 'text') => (
        <div className={type === 'textarea' ? 'md:col-span-2' : ''}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {type === 'textarea' ? (
                <textarea
                    name={name}
                    placeholder={placeholder}
                    value={newAddressForm[name]}
                    onChange={handleNewAddressChange}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent ${errors[name] ? 'border-red-500' : 'border-gray-300'
                        }`}
                />
            ) : (
                <input
                    type={type}
                    name={name}
                    placeholder={placeholder}
                    value={newAddressForm[name]}
                    onChange={handleNewAddressChange}
                    className={`w-full px-3 py-2 border rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent ${errors[name] ? 'border-red-500' : 'border-gray-300'
                        }`}
                    required={required}
                />
            )}
            {errors[name] && (
                <p className="mt-1 text-sm text-red-600">{errors[name]}</p>
            )}
        </div>
    );

    // Helper function to render select with error
    const renderSelect = (name, label, options, required = false, disabled = false, loading = false) => (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <select
                name={name}
                value={newAddressForm[name]}
                onChange={handleNewAddressChange}
                disabled={disabled || loading}
                className={`w-full px-3 py-2 border rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent ${errors[name] ? 'border-red-500' : 'border-gray-300'
                    } ${disabled ? 'bg-gray-100' : ''}`}
                required={required}
            >
                <option value="">
                    {loading ? 'Loading...' : `Select ${label}`}
                </option>
                {options.map(option => (
                    <option key={option} value={option}>{option}</option>
                ))}
            </select>
            {errors[name] && (
                <p className="mt-1 text-sm text-red-600">{errors[name]}</p>
            )}
        </div>
    );

    // Settings Mode Render
    if (mode === 'settings') {
        return (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                {/* Header */}
                <div className="border-b border-gray-100 p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded">
                                <MapPin className="h-5 w-5 text-primary-700" />
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Shipping Addresses</h2>
                                <p className="text-sm text-gray-500">Manage your delivery addresses</p>
                            </div>
                        </div>
                        {!isAddingNew && !isEditing && (
                            <button
                                onClick={() => setIsAddingNew(true)}
                                className="flex items-center justify-center space-x-2 bg-primary-700 text-white px-4 py-2 rounded hover:bg-primary-500 transition-colors w-full sm:w-auto"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Add Address</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="p-4 sm:p-6">
                    {/* Add/Edit Form */}
                    {(isAddingNew || isEditing) && (
                        <div className="mb-8 border border-gray-200 rounded-xl p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-white">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                {isEditing ? 'Edit Address' : 'Add New Address'}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {renderInput('addressName', 'Address Name', 'Home, Work, etc.', true)}
                                {renderInput('address', 'Street Address', 'House number, street name', true)}
                                {renderSelect('state', 'State', states, true, false, isLoadingStates)}
                                {renderSelect('lga', 'LGA', lgas, true, !newAddressForm.state, isLoadingLGAs)}
                                {renderInput('city', 'City', 'City', true)}
                                {renderInput('town', 'Town/Area', 'Town or Area')}
                                {renderInput('landmark', 'Landmark', 'Nearest landmark')}
                                {renderInput('zip', 'ZIP Code', 'Postal code')}
                                {renderInput('additionalInfo', 'Additional Information', 'Any additional delivery instructions', false, 'textarea')}

                                <div className="md:col-span-2">
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            name="isDefault"
                                            checked={newAddressForm.isDefault}
                                            onChange={handleNewAddressChange}
                                            className="h-4 w-4 text-primary-700 rounded border-gray-300 focus:ring-primary-500"
                                        />
                                        <span className="text-sm text-gray-700">Set as default address</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 mt-6">
                                <button
                                    onClick={handleSaveAddress}
                                    disabled={isSaving}
                                    className="flex items-center justify-center space-x-2 bg-primary-700 text-white px-4 py-2 rounded hover:bg-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Check className="h-4 w-4" />
                                    )}
                                    <span>{isSaving ? 'Saving...' : (isEditing ? 'Update Address' : 'Save Address')}</span>
                                </button>
                                <button
                                    onClick={handleCancelForm}
                                    disabled={isSaving}
                                    className="flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <X className="h-4 w-4" />
                                    <span>Cancel</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Address List */}
                    <div className="space-y-4 sm:grid sm:grid-cols-1 md:grid-cols-2 sm:gap-4 sm:space-y-0">
                        {addresses.map(address => (
                            <div key={address.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                                        <h3 className="font-semibold text-gray-900 truncate">{address.addressName}</h3>
                                        {address.isDefault && (
                                            <span className="px-2 py-1 text-xs bg-blue-100 text-primary-700 rounded-full whitespace-nowrap">
                                                Default
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                                        <button
                                            onClick={() => handleEditAddress(address)}
                                            disabled={isSaving}
                                            className="p-2 text-gray-400 hover:text-primary-700 transition-colors rounded hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteAddress(address.id)}
                                            disabled={isDeleting === address.id}
                                            className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isDeleting === address.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="text-sm text-gray-600 space-y-1 mb-3">
                                    <p className="break-words">{address.address}</p>
                                    <p>{address.city}, {address.lga}</p>
                                    <p>{address.state}</p>
                                    {address.landmark && <p>Near: {address.landmark}</p>}
                                </div>

                                {!address.isDefault && (
                                    <button
                                        onClick={() => handleSetDefault(address.id)}
                                        className="text-xs text-primary-700 hover:text-primary-500 font-medium bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full transition-colors"
                                    >
                                        Set as Default
                                    </button>
                                )}
                            </div>
                        ))}

                        {addresses.length === 0 && !isAddingNew && (
                            <div className="sm:md:col-span-2 text-center py-8">
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
            <div className="border-b border-gray-100 p-4 sm:p-6">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded">
                        <MapPin className="h-5 w-5 text-primary-700" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Shipping Address</h2>
                        <p className="text-sm text-gray-500">Where should we deliver your order?</p>
                    </div>
                </div>
            </div>

            <div className="p-4 sm:p-6">
                {/* Saved Addresses */}
                {addresses.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Choose from saved addresses</h3>
                        <div className="space-y-3">
                            {addresses.map(address => (
                                <div
                                    key={address.id}
                                    className={`border rounded p-4 cursor-pointer transition-all ${selectedAddressId === address.id
                                            ? 'border-accent-500 bg-blue-50 shadow-sm'
                                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                        }`}
                                    onClick={() => handleSelectAddress(address)}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <p className="font-medium text-gray-900">{address.addressName}</p>
                                                {address.isDefault && (
                                                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full whitespace-nowrap">
                                                        Default
                                                    </span>
                                                )}
                                            </div>

                                            {/* Full Address Display */}
                                            <div className="text-sm text-gray-600 space-y-1">
                                                <p className="leading-relaxed">{address.address}</p>

                                                <div className="flex flex-wrap gap-1">
                                                    <span>{address.city}</span>
                                                    <span>•</span>
                                                    <span>{address.lga}</span>
                                                    <span>•</span>
                                                    <span>{address.state}</span>
                                                    {address.zip && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{address.zip}</span>
                                                        </>
                                                    )}
                                                </div>

                                                {address.town && (
                                                    <p className="text-gray-500">
                                                        <span className="font-medium">Area:</span> {address.town}
                                                    </p>
                                                )}

                                                {address.landmark && (
                                                    <p className="text-gray-500">
                                                        <span className="font-medium">Near:</span> {address.landmark}
                                                    </p>
                                                )}

                                                {address.additionalInfo && (
                                                    <p className="text-gray-500 italic">
                                                        <span className="font-medium">Note:</span> {address.additionalInfo}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Selection Indicator */}
                                        <div className="flex-shrink-0 mt-1">
                                            {selectedAddressId === address.id ? (
                                                <div className="p-1.5 bg-primary-500 rounded-full">
                                                    <Check className="h-3 w-3 text-white" />
                                                </div>
                                            ) : (
                                                <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                                            )}
                                        </div>
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
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-accent-500 focus:border-transparent"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-accent-500 focus:border-transparent disabled:bg-gray-100"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-accent-500 focus:border-transparent"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-accent-500 focus:border-transparent"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-accent-500 focus:border-transparent"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-accent-500 focus:border-transparent"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-accent-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Shipping Fee Info */}
                {formData?.state && paymentMethod !== 'pay_on_pickup' && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-medium text-gray-900">Shipping Fee</h4>
                                <p className="text-sm text-gray-500">
                                    To {formData.state}
                                    {formData.city && `, ${formData.city}`}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-semibold text-gray-900">
                                    ₦{calculateShippingFee(formData.state).toLocaleString()}
                                </p>
                                {formData.state.toLowerCase() === 'delta' && (
                                    <p className="text-xs text-green-600">Local delivery</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddressManager;