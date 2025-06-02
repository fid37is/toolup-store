// src/components/checkout/CheckoutForm.jsx
import { useState, useEffect } from 'react';
import { MapPin, Plus, Edit } from 'lucide-react';
import ContactInformation from './ContactInformation';
import PaymentMethodSelector from './PaymentMethodSelector';
import AddressManager from '../AddressManager';
import TermsSection from './TermsSection';
import CheckoutActions from './CheckoutActions';

export default function CheckoutForm({
    formData,
    handleInputChange,
    isAuthenticated,
    paymentMethod,
    handlePaymentMethodChange,
    defaultAddress,
    checkoutData,
    setCheckoutData,
    setShippingFee,
    setBaseShippingFee,
    userId,
    onPaymentVerifiedChange,
    onOrderComplete,
    showBankTransferPopup,
    onCloseBankTransferPopup,
    orderTotal,
    pendingOrderId,
    termsAccepted,
    setTermsAccepted,
    formIsValid,
    isSubmitting,
    onSubmit,
    onCancel
}) {
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

    // Load user's saved addresses
    useEffect(() => {
        if (isAuthenticated && userId && userId !== '' && !userId.startsWith('guest-')) {
            loadSavedAddresses();
        } else {
            // For guests, always show the address form
            setShowAddressForm(true);
        }
    }, [isAuthenticated, userId]);

    // Set default address when addresses are loaded
    useEffect(() => {
        if (savedAddresses.length > 0) {
            const defaultAddr = savedAddresses.find(addr => addr.isDefault);
            if (defaultAddr) {
                setSelectedAddressId(defaultAddr.id);
                populateAddressData(defaultAddr);
            } else {
                // No default address, select the first one
                setSelectedAddressId(savedAddresses[0].id);
                populateAddressData(savedAddresses[0]);
            }
        }
    }, [savedAddresses]);

    const loadSavedAddresses = async () => {
        try {
            setIsLoadingAddresses(true);
            const response = await fetch(`/api/users/addresses/${userId}`);
            if (response.ok) {
                const data = await response.json();
                setSavedAddresses(data.addresses || []);
                
                // If no saved addresses, show form to add new one
                if (data.addresses.length === 0) {
                    setShowAddressForm(true);
                }
            }
        } catch (error) {
            console.error('Error loading saved addresses:', error);
            setShowAddressForm(true);
        } finally {
            setIsLoadingAddresses(false);
        }
    };

    const populateAddressData = (address) => {
        setCheckoutData(prev => ({
            ...prev,
            address: address.address || '',
            city: address.city || '',
            state: address.state || '',
            lga: address.lga || '',
            town: address.town || '',
            zip: address.zip || '',
            landmark: address.landmark || '',
            additionalInfo: address.additionalInfo || ''
        }));
    };

    const handleAddressChange = (addressId) => {
        setSelectedAddressId(addressId);
        if (addressId === 'new') {
            setShowAddressForm(true);
            // Clear form for new address
            setCheckoutData(prev => ({
                ...prev,
                address: '',
                city: '',
                state: '',
                lga: '',
                town: '',
                zip: '',
                landmark: '',
                additionalInfo: ''
            }));
        } else {
            const selectedAddress = savedAddresses.find(addr => addr.id === addressId);
            if (selectedAddress) {
                populateAddressData(selectedAddress);
                setShowAddressForm(false);
            }
        }
    };

    const handleAddressSelect = (addressData) => {
        setCheckoutData(prev => ({
            ...prev,
            ...addressData
        }));
        setShowAddressForm(false);
        
        // Refresh saved addresses to include the new one
        if (isAuthenticated && userId && !userId.startsWith('guest-')) {
            loadSavedAddresses();
        }
    };

    const handleManualAddressChange = (e) => {
        const { name, value } = e.target;
        setCheckoutData(prev => ({
            ...prev,
            [name]: value
        }));
        handleInputChange(e);
    };

    return (
        <div className="space-y-8">
            {/* Contact Information */}
            <ContactInformation
                formData={formData}
                handleInputChange={handleInputChange}
                isAuthenticated={isAuthenticated}
            />

            {/* Shipping Address Section - Skip for pickup */}
            {paymentMethod !== 'pay_at_pickup' && (
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="border-b border-gray-100 p-4 sm:p-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded">
                                <MapPin className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Shipping Address</h2>
                                <p className="text-sm text-gray-500">Where should we deliver your order?</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 sm:p-6">
                        {/* Address Selection for Authenticated Users */}
                        {isAuthenticated && !isLoadingAddresses && savedAddresses.length > 0 && (
                            <div className="mb-6">
                                <label htmlFor="address-select" className="block text-sm font-medium text-gray-700 mb-3">
                                    Select shipping address
                                </label>
                                <div className="space-y-3">
                                    {savedAddresses.map((address) => (
                                        <label key={address.id} className="flex items-start space-x-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="selectedAddress"
                                                value={address.id}
                                                checked={selectedAddressId === address.id}
                                                onChange={(e) => handleAddressChange(e.target.value)}
                                                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium text-gray-900">
                                                        {address.addressName || `Address ${address.id}`}
                                                    </span>
                                                    {address.isDefault && (
                                                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                                            Default
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    <p>{address.address}</p>
                                                    <p>{address.city}, {address.lga}, {address.state}</p>
                                                    {address.landmark && (
                                                        <p className="text-gray-500">Near: {address.landmark}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                    
                                    {/* Option to add new address */}
                                    <label className="flex items-start space-x-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="selectedAddress"
                                            value="new"
                                            checked={selectedAddressId === 'new'}
                                            onChange={(e) => handleAddressChange(e.target.value)}
                                            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                        />
                                        <div className="flex items-center space-x-2 text-blue-600">
                                            <Plus className="h-4 w-4" />
                                            <span className="font-medium">Add new address</span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Add New Address Button for users with no saved addresses */}
                        {isAuthenticated && !isLoadingAddresses && savedAddresses.length === 0 && !showAddressForm && (
                            <button
                                type="button"
                                onClick={() => setShowAddressForm(true)}
                                className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-gray-600 hover:text-gray-700"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Add Shipping Address
                            </button>
                        )}

                        {/* Loading state */}
                        {isLoadingAddresses && (
                            <div className="flex items-center justify-center p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <span className="ml-2 text-gray-600">Loading addresses...</span>
                            </div>
                        )}

                        {/* Address Form */}
                        {showAddressForm && (
                            <div className="border-t border-gray-200 pt-6 mt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        {selectedAddressId === 'new' ? 'Add New Address' : 'Enter Shipping Address'}
                                    </h3>
                                    {isAuthenticated && savedAddresses.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowAddressForm(false);
                                                // Reselect the first saved address
                                                if (savedAddresses.length > 0) {
                                                    const firstAddress = savedAddresses[0];
                                                    setSelectedAddressId(firstAddress.id);
                                                    populateAddressData(firstAddress);
                                                }
                                            }}
                                            className="text-sm text-gray-500 hover:text-gray-700"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                                
                                <AddressManager
                                    mode="checkout"
                                    onAddressSelect={handleAddressSelect}
                                    formData={checkoutData}
                                    handleInputChange={handleManualAddressChange}
                                    setShippingFee={setShippingFee}
                                    baseShippingFee={3500}
                                    setBaseShippingFee={setBaseShippingFee}
                                    paymentMethod={paymentMethod}
                                    userId={userId}
                                    isAuthenticated={isAuthenticated}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Payment Method */}
            <PaymentMethodSelector
                selectedMethod={paymentMethod}
                onMethodChange={handlePaymentMethodChange}
                onShippingFeeChange={(feeAdjustment) => {
                    if (feeAdjustment < 0) {
                        setShippingFee(0);
                    } else {
                        setShippingFee(prev => prev + feeAdjustment);
                    }
                }}
                onPaymentVerifiedChange={onPaymentVerifiedChange}
                userId={userId}
                isAuthenticated={isAuthenticated}
                onOrderComplete={onOrderComplete}
                showBankTransferPopup={showBankTransferPopup}
                onCloseBankTransferPopup={onCloseBankTransferPopup}
                orderTotal={orderTotal}
                orderId={pendingOrderId}
            />

            {/* Terms and Conditions */}
            <TermsSection
                termsAccepted={termsAccepted}
                setTermsAccepted={setTermsAccepted}
            />

            {/* Action Buttons */}
            <CheckoutActions
                formIsValid={formIsValid}
                isSubmitting={isSubmitting}
                onSubmit={onSubmit}
                onCancel={onCancel}
                termsAccepted={termsAccepted}
            />
        </div>
    );
}