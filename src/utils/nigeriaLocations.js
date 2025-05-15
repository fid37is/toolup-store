// src/utils/nigeriaLocations.js

const STATES_API = 'https://nga-states-lga.onrender.com/fetch';
const LGAS_API_BASE = 'https://nga-states-lga.onrender.com/?state=';

// Fallback data (unchanged)
const FALLBACK_STATES = [
    { code: 'DE', name: 'Delta' },
    { code: 'LA', name: 'Lagos' },
    { code: 'AB', name: 'Abia' },
    { code: 'FC', name: 'FCT' },
    { code: 'OG', name: 'Ogun' },
    { code: 'ON', name: 'Ondo' },
    { code: 'RV', name: 'Rivers' }
];

const FALLBACK_LGAS = {
    DE: [
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
        { name: 'Ika South' }
    ]
};

const FALLBACK_TOWNS = {
    DE: [
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
        { name: 'Bomadi', lga: 'Bomadi' }
    ]
};

// State code mapping for all Nigeria states
const STATE_MAPPING = {
    'DE': 'Delta',
    'LA': 'Lagos',
    'AB': 'Abia',
    'FC': 'FCT',
    'OG': 'Ogun',
    'ON': 'Ondo',
    'RV': 'Rivers',
    'AD': 'Adamawa',
    'AK': 'Akwa Ibom',
    'AN': 'Anambra',
    'BA': 'Bauchi',
    'BY': 'Bayelsa',
    'BE': 'Benue',
    'BO': 'Borno',
    'CR': 'Cross River',
    'EB': 'Ebonyi',
    'ED': 'Edo',
    'EK': 'Ekiti',
    'EN': 'Enugu',
    'GO': 'Gombe',
    'IM': 'Imo',
    'JI': 'Jigawa',
    'KD': 'Kaduna',
    'KN': 'Kano',
    'KT': 'Katsina',
    'KE': 'Kebbi',
    'KO': 'Kogi',
    'KW': 'Kwara',
    'NA': 'Nasarawa',
    'NI': 'Niger',
    'OY': 'Oyo',
    'PL': 'Plateau',
    'SO': 'Sokoto',
    'TA': 'Taraba',
    'YO': 'Yobe',
    'ZA': 'Zamfara'
};

// Create reverse mapping
const STATE_REVERSE_MAPPING = Object.entries(STATE_MAPPING).reduce((acc, [code, name]) => {
    acc[name] = code;
    return acc;
}, {});

export const fetchAllStates = async () => {
    try {
        const response = await fetch(STATES_API);
        if (!response.ok) throw new Error('Failed to fetch states');

        const data = await response.json();

        // Check the actual structure of the response and handle it accordingly
        let statesList = [];

        if (data.states && Array.isArray(data.states)) {
            // Original expected format
            statesList = data.states;
        } else if (Array.isArray(data)) {
            // If the response is directly an array
            statesList = data;
        } else if (typeof data === 'object') {
            // If the response is an object with a different structure
            // Try to find an array property that might contain states
            const possibleArrays = Object.values(data).filter(val => Array.isArray(val));
            if (possibleArrays.length > 0) {
                // Use the first array found
                statesList = possibleArrays[0];
            }
        }

        if (statesList.length === 0) {
            throw new Error('No states data found in API response');
        }

        return statesList.map(state => {
            // Handle if state is already an object with code and name
            if (typeof state === 'object' && state.code && state.name) {
                return state;
            }

            // Handle if state is just a string (state name)
            const stateName = typeof state === 'string' ? state : String(state);
            return {
                code: getStateCodeFromName(stateName),
                name: stateName
            };
        });
    } catch (error) {
        console.warn('Error fetching states, using fallback data:', error);
        return FALLBACK_STATES;
    }
};

export const fetchLGAs = async (stateCode) => {
    if (!stateCode) return [];

    const stateName = convertStateCodeToName(stateCode);
    if (!stateName) return [];

    try {
        const response = await fetch(`${LGAS_API_BASE}${encodeURIComponent(stateName)}`);
        if (!response.ok) throw new Error('Failed to fetch LGAs');

        const data = await response.json();

        // Handle different response formats
        let lgaList = [];

        if (data.lga && Array.isArray(data.lga)) {
            lgaList = data.lga;
        } else if (Array.isArray(data)) {
            lgaList = data;
        } else if (typeof data === 'object') {
            const possibleArrays = Object.values(data).filter(val => Array.isArray(val));
            if (possibleArrays.length > 0) {
                lgaList = possibleArrays[0];
            }
        }

        if (lgaList.length === 0) {
            throw new Error('No LGA data found in API response');
        }

        return lgaList.map(lga => {
            // Handle if LGA is already an object with name
            if (typeof lga === 'object' && lga.name) {
                return lga;
            }

            // Handle if LGA is just a string
            return { name: typeof lga === 'string' ? lga : String(lga) };
        });
    } catch (error) {
        console.warn(`Error fetching LGAs for ${stateCode}, using fallback data:`, error);
        return FALLBACK_LGAS[stateCode] || [];
    }
};

export const fetchTowns = async (stateCode, lgaName = null) => {
    if (!stateCode) return [];

    try {
        throw new Error('Towns API not available');
    } catch (error) {
        console.warn(`Error fetching towns for state ${stateCode}, using fallback data:`, error);
        let fallbackTowns = FALLBACK_TOWNS[stateCode] || [];

        if (lgaName) {
            return filterTownsByLGA(fallbackTowns, lgaName);
        }

        return fallbackTowns;
    }
};

export const filterTownsByLGA = (towns, lgaName) => {
    if (!towns || !towns.length || !lgaName) return [];
    return towns.filter(town => {
        if (town.lga?.toLowerCase() === lgaName.toLowerCase()) return true;

        const townNameLower = town.name.toLowerCase();
        const lgaNameLower = lgaName.toLowerCase();
        return townNameLower.includes(lgaNameLower) || lgaNameLower.includes(townNameLower);
    });
};

const convertStateCodeToName = (stateCode) => {
    return STATE_MAPPING[stateCode] || null;
};

const getStateCodeFromName = (stateName) => {
    return STATE_REVERSE_MAPPING[stateName] ||
        (stateName && stateName.length >= 2 ? stateName.toUpperCase().slice(0, 2) : 'UN');
};

export const calculateShippingFee = (locationData) => {
    const { state, lga, town } = locationData;
    if (!state) return 3500;

    let fee = 3500;
    if (state === 'DE') {
        fee = 1000;
        if (['Warri South', 'Uvwie', 'Sapele', 'Udu'].includes(lga)) fee = 800;
        if (['Warri', 'Effurun'].includes(town)) fee = 500;
    }

    return fee;
};