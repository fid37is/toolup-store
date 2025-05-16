// src/components/checkout/ShippingAddress.jsx
import React, { useEffect, useState } from 'react';
import { getStates, getLGAs } from '../../utils/locationService';

export default function ShippingAddress({ formData, handleInputChange, setShippingFee }) {
    const [states, setStates] = useState([]);
    const [lgas, setLgas] = useState([]);

    // Load states on mount
    useEffect(() => {
        getStates().then(setStates).catch(() => setStates([]));
    }, []);

    // Load LGAs when state changes
    useEffect(() => {
        if (formData.state) {
            getLGAs(formData.state).then(setLgas).catch(() => setLgas([]));
        } else {
            setLgas([]);
        }
    }, [formData.state]);

    // Optional: Calculate shipping fee when address changes
    useEffect(() => {
        const fee = calculateShippingFee({
            state: formData.state,
            lga: formData.lga,
        });
        setShippingFee(fee);
    }, [formData.state, formData.lga, setShippingFee]);

    return (
        <fieldset>
            <legend className="mb-2 text-lg font-semibold">Shipping Address</legend>

            {/* State Select */}
            <label className="block mb-2">
                State
                <select
                    name="state"
                    value={formData.state || ''}
                    onChange={handleInputChange}
                    className="block w-full rounded border p-2"
                    required
                >
                    <option value="" disabled>Select a state</option>
                    {states.map((state) => (
                        // If states are objects with name property, adjust accordingly
                        typeof state === 'string' ? (
                            <option key={state} value={state}>{state}</option>
                        ) : (
                            <option key={state.name} value={state.name}>{state.name}</option>
                        )
                    ))}
                </select>
            </label>

            {/* LGA Select */}
            <label className="block mb-2">
                Local Government Area (LGA)
                <select
                    name="lga"
                    value={formData.lga || ''}
                    onChange={handleInputChange}
                    className="block w-full rounded border p-2"
                    required
                    disabled={!formData.state}
                >
                    <option value="" disabled>Select an LGA</option>
                    {lgas.map((lga) => (
                        typeof lga === 'string' ? (
                            <option key={lga} value={lga}>{lga}</option>
                        ) : (
                            <option key={lga.name} value={lga.name}>{lga.name}</option>
                        )
                    ))}
                </select>
            </label>

            {/* Street Address */}
            <label className="block mb-2">
                Street Address
                <input
                    type="text"
                    name="address"
                    value={formData.address || ''}
                    onChange={handleInputChange}
                    placeholder="Enter your street address"
                    className="block w-full rounded border p-2"
                    required
                />
            </label>

            {/* Additional Info */}
            <label className="block mb-2">
                Additional Information (optional)
                <textarea
                    name="additionalInfo"
                    value={formData.additionalInfo || ''}
                    onChange={handleInputChange}
                    placeholder="Apartment, suite, unit, building, floor, etc."
                    className="block w-full rounded border p-2"
                    rows={3}
                />
            </label>
        </fieldset>
    );
}

// Shipping fee calculator — example (adjust as needed)
function calculateShippingFee({ state, lga }) {
    if (!state) return 3500;
    if (state === 'Delta') {
        if (['Warri South', 'Uvwie', 'Sapele', 'Udu'].includes(lga)) return 800;
        if (['Warri', 'Effurun'].includes(lga)) return 500;
        return 1000;
    }
    return 3500;
}
