// src/components/checkout/ShippingAddress.jsx - Fixed Version
import React, { useState, useEffect } from 'react';
import { getStates, getLGAs } from '../../utils/locationService';

export default function ShippingAddress({
    formData,
    handleInputChange,
    setShippingFee,
    baseShippingFee,
    setBaseShippingFee,
    paymentMethod
}) {
    const [states, setStates] = useState([]);
    const [lgas, setLGAs] = useState([]);
    const [isLoadingStates, setIsLoadingStates] = useState(false);
    const [isLoadingLGAs, setIsLoadingLGAs] = useState(false);

    // Fetch states from API on component mount only once
    useEffect(() => {
        const fetchStates = async () => {
            setIsLoadingStates(true);
            try {
                const statesData = await getStates();
                
                // Sort states to make Delta appear first in the dropdown
                const sortedStates = [...statesData].sort((a, b) => {
                    if (a === 'Delta') return -1;
                    if (b === 'Delta') return 1;
                    return a.localeCompare(b);
                });
                
                setStates(sortedStates);
            } catch (error) {
                console.error('Error fetching states:', error);
            } finally {
                setIsLoadingStates(false);
            }
        };

        fetchStates();
    }, []); // Empty dependency array so it only runs once on mount

    // Fetch LGAs when state is selected - either manually or from pre-filled data
    useEffect(() => {
        const fetchLGAs = async () => {
            if (!formData.state) {
                setLGAs([]);
                return;
            }

            console.log("Fetching LGAs for state:", formData.state);
            setIsLoadingLGAs(true);
            try {
                const lgasData = await getLGAs(formData.state);
                setLGAs(lgasData);
                
                // If we have an LGA value but it's not in the fetched list, handle it
                if (formData.lga && !lgasData.includes(formData.lga)) {
                    console.log(`Pre-filled LGA "${formData.lga}" not found in fetched LGAs for ${formData.state}`);
                    
                    // Only reset if the state was manually changed by the user
                    // Don't reset during initial load from user profile
                    if (document.activeElement && document.activeElement.id === "state") {
                        const lgaResetEvent = {
                            target: { name: 'lga', value: '' }
                        };
                        handleInputChange(lgaResetEvent);
                    }
                }
            } catch (error) {
                console.error(`Error fetching LGAs for ${formData.state}:`, error);
            } finally {
                setIsLoadingLGAs(false);
            }
        };

        fetchLGAs();

        // Only calculate and set shipping fee if payment method is not 'pay_on_pickup'
        if (formData.state && paymentMethod !== 'pay_on_pickup') {
            const newShippingFee = calculateShippingFee(formData.state);
            setBaseShippingFee(newShippingFee);
            setShippingFee(newShippingFee);
        }
    }, [formData.state, paymentMethod]); // Only depends on state and payment method changes

    // Calculate shipping fee based on selected state
    const calculateShippingFee = (state) => {
        // Simple shipping fee structure based on business requirements
        if (state === 'Delta') {
            return 1000; // Business location - lowest shipping fee
        } else if (state === 'Abuja') {
            return 4000; // Higher shipping fee for Abuja
        } else {
            return 3500; // Standard shipping fee for all other states
        }
    };

    // Handle LGA change
    const handleLGAChange = (e) => {
        handleInputChange(e);
    };

    // Handle state change
    const handleStateChange = (e) => {
        console.log("State selection changed to:", e.target.value);
        
        // Update the state first
        handleInputChange(e);
        
        // Clear LGA
        const lgaResetEvent = {
            target: { name: 'lga', value: '' }
        };
        handleInputChange(lgaResetEvent);
    };

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="border-b border-gray-200 pb-4 mb-6">
                <h2 className="text-lg font-medium text-gray-900">Shipping Address</h2>
                <p className="mt-1 text-sm text-gray-500">
                    Enter the address where you want your items delivered
                </p>
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                {/* Address Line */}
                <div className="sm:col-span-6">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                        Street Address <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                        <input
                            type="text"
                            name="address"
                            id="address"
                            value={formData.address || ''}
                            onChange={handleInputChange}
                            required
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="123 Main St"
                        />
                    </div>
                </div>

                {/* State */}
                <div className="sm:col-span-3">
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                        State <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                        <select
                            id="state"
                            name="state"
                            value={formData.state || ''}
                            onChange={handleStateChange}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            required
                            disabled={isLoadingStates}
                        >
                            <option value="">Select State</option>
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
                </div>

                {/* LGA (Local Government Area) */}
                <div className="sm:col-span-3">
                    <label htmlFor="lga" className="block text-sm font-medium text-gray-700">
                        LGA (Local Government Area) <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                        <select
                            id="lga"
                            name="lga"
                            value={formData.lga || ''}
                            onChange={handleLGAChange}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            disabled={!formData.state || isLoadingLGAs}
                            required
                        >
                            <option value="">Select LGA</option>
                            {lgas.map((lga) => (
                                <option key={lga} value={lga}>{lga}</option>
                            ))}
                        </select>
                        {isLoadingLGAs && (
                            <p className="text-xs text-gray-500 mt-1">Loading LGAs...</p>
                        )}
                        {formData.state && !isLoadingLGAs && lgas.length === 0 && (
                            <p className="text-xs text-red-500 mt-1">Failed to load LGAs. Please try selecting the state again.</p>
                        )}
                    </div>
                </div>

                {/* Town/Area - Manual Text Input */}
                <div className="sm:col-span-3">
                    <label htmlFor="town" className="block text-sm font-medium text-gray-700">
                        Town/Area
                    </label>
                    <div className="mt-1">
                        <input
                            type="text"
                            id="town"
                            name="town"
                            value={formData.town || ''}
                            onChange={handleInputChange}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="Enter your town or area"
                        />
                    </div>
                </div>

                {/* City - Required for address validation */}
                <div className="sm:col-span-3">
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                        City <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                        <input
                            type="text"
                            id="city"
                            name="city"
                            value={formData.city || ''}
                            onChange={handleInputChange}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="Enter your city"
                            required
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            If your city is the same as your town or LGA, please enter it again here.
                        </p>
                    </div>
                </div>

                {/* ZIP/Postal Code */}
                <div className="sm:col-span-3">
                    <label htmlFor="zip" className="block text-sm font-medium text-gray-700">
                        ZIP / Postal Code
                    </label>
                    <div className="mt-1">
                        <input
                            type="text"
                            name="zip"
                            id="zip"
                            value={formData.zip || ''}
                            onChange={handleInputChange}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                    </div>
                </div>

                {/* Additional Information / Landmark */}
                <div className="sm:col-span-6">
                    <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700">
                        Additional Information / Landmark
                    </label>
                    <div className="mt-1">
                        <textarea
                            id="additionalInfo"
                            name="additionalInfo"
                            rows={3}
                            value={formData.additionalInfo || ''}
                            onChange={handleInputChange}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="Landmarks, special delivery instructions, etc."
                        />
                    </div>
                </div>
            </div>

            {/* Shipping Fee Information */}
            {formData.state && (
                <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">Shipping Information</h3>
                            {paymentMethod === 'pay_on_pickup' ? (
                                <p className="mt-1 text-sm text-blue-700">
                                    You've selected "Pay on Pickup". No shipping fee will be charged.
                                </p>
                            ) : (
                                <p className="mt-1 text-sm text-blue-700">
                                    Shipping to {formData.state}: ₦{calculateShippingFee(formData.state).toLocaleString()}
                                </p>
                            )}
                            {paymentMethod !== 'pay_on_pickup' && (
                                <p className="mt-1 text-xs text-blue-600">
                                    {formData.state === 'Delta' ? 
                                        'Delivery in Delta State takes less than 24 hours.' : 
                                        'Delivery usually takes 2-5 business days depending on your location.'}
                                </p>
                            )}
                            {paymentMethod === 'pay_on_pickup' && (
                                <p className="mt-1 text-xs text-blue-600">
                                    Our staff will contact you when your order is ready for pickup.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}