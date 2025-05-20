// src/components/checkout/ShippingAddress.jsx
import { useState, useEffect } from 'react';
import { getStates, getLGAs } from '../../utils/locationService';

export default function ShippingAddress({ formData, handleInputChange, setShippingFee }) {
    const [states, setStates] = useState([]);
    const [lgas, setLGAs] = useState([]);
    const [isLoadingStates, setIsLoadingStates] = useState(false);
    const [isLoadingLGAs, setIsLoadingLGAs] = useState(false);
    
    // Fetch states from API on component mount
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
    
    // Update shipping fee based on selected state
    useEffect(() => {
        if (formData.state) {
            // Example shipping fee calculation based on state
            const baseShippingFee = 3500; // Default shipping fee
            
            // Delta State (business location) has lowest shipping
            if (formData.state === 'Delta') {
                setShippingFee(1500);
            }
            // Lagos has lower shipping
            else if (formData.state === 'Lagos') {
                setShippingFee(2500);
            } 
            // FCT/Abuja has standard shipping
            else if (formData.state === 'FCT (Abuja)') {
                setShippingFee(3500);
            }
            // Other states have higher shipping
            else {
                setShippingFee(4500);
            }
        }
    }, [formData.state, setShippingFee]);

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 pb-2 border-b text-xl font-semibold text-gray-800">Shipping Address</h2>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                        Street Address
                    </label>
                    <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-accent-500 focus:ring-accent-500 sm:text-sm"
                        placeholder="123 Main St"
                    />
                </div>
                
                <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                        State
                    </label>
                    <select
                        id="state"
                        name="state"
                        value={formData.state || ''}
                        onChange={handleInputChange}
                        required
                        disabled={isLoadingStates}
                        className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-accent-500 focus:ring-accent-500 sm:text-sm"
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
                    <label htmlFor="lga" className="block text-sm font-medium text-gray-700">
                        LGA (Local Government Area)
                    </label>
                    <select
                        id="lga"
                        name="lga"
                        value={formData.lga || ''}
                        onChange={handleInputChange}
                        required
                        disabled={!formData.state || isLoadingLGAs}
                        className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-accent-500 focus:ring-accent-500 sm:text-sm"
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
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                        City
                    </label>
                    <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-accent-500 focus:ring-accent-500 sm:text-sm"
                    />
                </div>
                
                <div>
                    <label htmlFor="town" className="block text-sm font-medium text-gray-700">
                        Town/Area
                    </label>
                    <input
                        type="text"
                        id="town"
                        name="town"
                        value={formData.town}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-accent-500 focus:ring-accent-500 sm:text-sm"
                    />
                </div>
                
                <div>
                    <label htmlFor="zip" className="block text-sm font-medium text-gray-700">
                        Postal/ZIP Code
                    </label>
                    <input
                        type="text"
                        id="zip"
                        name="zip"
                        value={formData.zip}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-accent-500 focus:ring-accent-500 sm:text-sm"
                    />
                </div>
                
                <div className="sm:col-span-2">
                    <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700">
                        Additional Information
                    </label>
                    <textarea
                        id="additionalInfo"
                        name="additionalInfo"
                        value={formData.additionalInfo}
                        onChange={handleInputChange}
                        rows="3"
                        className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-accent-500 focus:ring-accent-500 sm:text-sm"
                        placeholder="Landmark, delivery instructions, etc."
                    ></textarea>
                </div>
                
                <div className="sm:col-span-2 mt-2">
                    <div className="rounded-md bg-blue-50 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3 flex-1 md:flex md:justify-between">
                                <p className="text-sm text-blue-700">
                                    Shipping fee is calculated based on your state selection.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}