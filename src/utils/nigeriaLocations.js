// src/utils/nigeriaLocations.js

/**
 * Utility functions for fetching Nigeria location data (states, LGAs, towns)
 * with fallback data for when the API is unreachable
 */

const DEFAULT_API_DOMAIN = 'state-lga-api.ordutech.com';
const API_PROTOCOL = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'https' : 'http';
const API_BASE_URL = process.env.NEXT_PUBLIC_LGA_API_URL || `${API_PROTOCOL}://${DEFAULT_API_DOMAIN}/api`;

// Fallback data (Delta state only)
const FALLBACK_STATES = [
    { code: 'DE', name: 'Delta' }
];

// Fallback LGAs for Delta State only
const FALLBACK_LGAS = {
    'DE': [
        { name: 'Warri South' },
        { name: 'Ughelli North' },
        { name: 'Uvwie' },
        { name: 'Sapele' },
        { name: 'Ethiope East' },
        { name: 'Ethiope West' },
        { name: 'Isoko North' },
        { name: 'Isoko South' },
        { name: 'Ndokwa East' },
        { name: 'Ndokwa West' },
        { name: 'Okpe' },
        { name: 'Oshimili North' },
        { name: 'Oshimili South' },
        { name: 'Patani' },
        { name: 'Udu' },
        { name: 'Ukwuani' },
        { name: 'Warri North' },
        { name: 'Warri South West' },
        { name: 'Bomadi' },
        { name: 'Burutu' },
        { name: 'Aniocha North' },
        { name: 'Aniocha South' },
        { name: 'Ika North East' },
        { name: 'Ika South' },
    ]
};

// Fallback towns for Delta State only
const FALLBACK_TOWNS = {
    'DE': [
        { name: 'Warri', lga: 'Warri South' },
        { name: 'Effurun', lga: 'Uvwie' },
        { name: 'Sapele', lga: 'Sapele' },
        { name: 'Ughelli', lga: 'Ughelli North' },
        { name: 'Asaba', lga: 'Oshimili South' },
        { name: 'Agbor', lga: 'Ika South' },
        { name: 'Abraka', lga: 'Ethiope East' },
        { name: 'Oleh', lga: 'Isoko South' },
        { name: 'Ozoro', lga: 'Isoko North' },
        { name: 'Kwale', lga: 'Ndokwa West' },
        { name: 'Obiaruku', lga: 'Ukwuani' },
        { name: 'Oghara', lga: 'Ethiope West' },
        { name: 'Orerokpe', lga: 'Okpe' },
        { name: 'Patani', lga: 'Patani' },
        { name: 'Burutu', lga: 'Burutu' },
        { name: 'Otu-Jeremi', lga: 'Ughelli South' },
        { name: 'Ogwashi-Uku', lga: 'Aniocha South' },
        { name: 'Issele-Uku', lga: 'Aniocha North' },
        { name: 'Owa-Oyibu', lga: 'Ika North East' },
        { name: 'Bomadi', lga: 'Bomadi' },
    ]
};

/**
 * Fetches all Nigerian states with fallback functionality
 * @returns {Promise<Array>} Array of state objects
 */
export const fetchAllStates = async () => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${API_BASE_URL}/`, {
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) throw new Error('Failed to fetch states');

        return await response.json();
    } catch (error) {
        console.warn('Error fetching states, using fallback data:', error);
        return FALLBACK_STATES;
    }
};

// Fetch LGAs by state with fallback
export const fetchLGAs = async (stateCode) => {
    if (!stateCode) return [];

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const stateName = convertStateCodeToName(stateCode);
        if (!stateName) throw new Error(`Invalid state code: ${stateCode}`);

        const response = await fetch(`${API_BASE_URL}/${stateName.toLowerCase()}/`, {
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(`Failed to fetch LGAs for state: ${stateCode}`);

        return await response.json();
    } catch (error) {
        console.warn(`Error fetching LGAs for state ${stateCode}, using fallback data:`, error);
        return FALLBACK_LGAS[stateCode] || [];
    }
};

// Fetch towns by state/LGA with fallback
export const fetchTowns = async (stateCode, lgaName = null) => {
    if (!stateCode) return [];

    try {
        throw new Error('Towns API not available');
    } catch (error) {
        console.warn(`Error fetching towns for state ${stateCode}, using fallback data:`, error);
        let fallbackTowns = FALLBACK_TOWNS[stateCode] || [];
        if (lgaName) return filterTownsByLGA(fallbackTowns, lgaName);
        return fallbackTowns;
    }
};

export const filterTownsByLGA = (towns, lgaName) => {
    if (!towns?.length || !lgaName) return [];
    return towns.filter(town => {
        if (town.lga?.toLowerCase() === lgaName.toLowerCase()) return true;
        const townNameLower = town.name.toLowerCase();
        const lgaNameLower = lgaName.toLowerCase();
        return townNameLower.includes(lgaNameLower) || lgaNameLower.includes(townNameLower);
    });
};

const convertStateCodeToName = (stateCode) => {
    const stateMapping = { 'DE': 'Delta' };
    return stateMapping[stateCode] || null;
};

export const calculateShippingFee = (locationData) => {
    const { state, lga, town } = locationData;
    if (!state) return 3500;

    let shippingFee = 3500;

    if (state === 'DE') {
        shippingFee = 1000;

        if (['Warri South', 'Uvwie', 'Sapele', 'Udu'].includes(lga)) {
            shippingFee = 800;
        }

        if (['Warri', 'Effurun'].includes(town)) {
            shippingFee = 500;
        }
    }

    return shippingFee;
};