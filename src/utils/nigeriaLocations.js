// src/utils/nigeriaLocations.js

/**
 * Utility functions for fetching Nigeria location data (states, LGAs, towns)
 * with fallback data for when the API is unreachable
 */

const API_BASE_URL = 'http://state-lga-api.ordutech.com/api';

// Fallback data in case the API is unreachable - only Delta state
const FALLBACK_STATES = [
    { code: 'DE', name: 'Delta' } // Prioritize Delta State (business location)
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
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch(`${API_BASE_URL}/`, {
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error('Failed to fetch states');
        }

        return await response.json();
    } catch (error) {
        console.warn('Error fetching states, using fallback data:', error);
        return FALLBACK_STATES;
    }
};

/**
 * Fetches all LGAs for a specific state with fallback functionality
 * @param {string} stateCode - The state code
 * @returns {Promise<Array>} Array of LGA objects
 */
export const fetchLGAs = async (stateCode) => {
    if (!stateCode) return [];

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        // Convert state code to state name for API compatibility
        const stateName = convertStateCodeToName(stateCode);
        if (!stateName) throw new Error(`Invalid state code: ${stateCode}`);

        const response = await fetch(`${API_BASE_URL}/${stateName.toLowerCase()}/`, {
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Failed to fetch LGAs for state: ${stateCode}`);
        }

        return await response.json();
    } catch (error) {
        console.warn(`Error fetching LGAs for state ${stateCode}, using fallback data:`, error);
        return FALLBACK_LGAS[stateCode] || [];
    }
};

/**
 * Fetches all towns for a specific state with fallback functionality
 * @param {string} stateCode - The state code
 * @param {string} lgaName - Optional LGA name to filter towns
 * @returns {Promise<Array>} Array of town objects
 */
export const fetchTowns = async (stateCode, lgaName = null) => {
    if (!stateCode) return [];

    try {
        // For now, the API doesn't provide towns directly
        // This could be updated if the API adds town endpoints in the future
        throw new Error('Towns API not available');
    } catch (error) {
        console.warn(`Error fetching towns for state ${stateCode}, using fallback data:`, error);
        let fallbackTowns = FALLBACK_TOWNS[stateCode] || [];

        // Filter by LGA if provided
        if (lgaName) {
            return filterTownsByLGA(fallbackTowns, lgaName);
        }

        return fallbackTowns;
    }
};

/**
 * Helper function to filter towns by LGA
 * @param {Array} towns - Array of town objects
 * @param {string} lgaName - LGA name to filter by
 * @returns {Array} Filtered array of town objects
 */
export const filterTownsByLGA = (towns, lgaName) => {
    if (!towns || !towns.length || !lgaName) return [];

    return towns.filter(town => {
        // Check if the town has an explicit LGA property
        if (town.lga && town.lga.toLowerCase() === lgaName.toLowerCase()) {
            return true;
        }

        // Check if the town name contains the LGA name or vice versa
        const townNameLower = town.name.toLowerCase();
        const lgaNameLower = lgaName.toLowerCase();

        return townNameLower.includes(lgaNameLower) ||
            lgaNameLower.includes(townNameLower);
    });
};

/**
 * Helper function to convert state code to state name
 * @param {string} stateCode - The state code
 * @returns {string|null} The state name or null if not found
 */
const convertStateCodeToName = (stateCode) => {
    // This is a simplified mapping - in a real implementation you would need
    // a comprehensive mapping of state codes to state names
    const stateMapping = {
        'DE': 'Delta',
        // Add more states as needed
    };
    
    return stateMapping[stateCode] || null;
};

/**
 * Helper function to determine shipping fee based on location
 * @param {object} locationData - Object containing selected location data
 * @returns {number} Shipping fee in Naira
 */
export const calculateShippingFee = (locationData) => {
    const { state, lga, town } = locationData;

    if (!state) return 3500; // Default shipping fee

    // Default shipping fee for locations outside specific areas
    let shippingFee = 3500;

    // If Delta state is selected (business location)
    if (state === 'DE') {
        // Reduced fee for Delta
        shippingFee = 1000;

        // Further reduction for specific areas in Delta
        if (lga && ['Warri South', 'Uvwie', 'Sapele', 'Udu'].includes(lga)) {
            shippingFee = 800;
        }

        // Special rates for specific towns in Delta
        if (town === 'Warri' || town === 'Effurun') {
            shippingFee = 500; // Lowest fee for business headquarters area
        }
    }

    return shippingFee;
};