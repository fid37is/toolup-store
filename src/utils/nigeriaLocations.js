// src/utils/nigeriaLocations.js

const STATES_API = 'https://nga-states-lga.onrender.com/fetch';
const LGAS_API_BASE = 'https://nga-states-lga.onrender.com/?state=';

// Fallback data (unchanged)
const FALLBACK_STATES = [
    { code: 'DE', name: 'Delta' }
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

export const fetchAllStates = async () => {
    try {
        const response = await fetch(STATES_API);
        if (!response.ok) throw new Error('Failed to fetch states');

        const data = await response.json();
        return data.states.map(name => ({
            code: getStateCodeFromName(name),
            name
        }));
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
        return data.lga.map(name => ({ name }));
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
    const stateMapping = {
        DE: 'Delta'
        // Add more as needed
    };
    return stateMapping[stateCode] || null;
};

const getStateCodeFromName = (stateName) => {
    const stateReverseMapping = {
        'Delta': 'DE'
        // Add more as needed
    };
    return stateReverseMapping[stateName] || stateName.toUpperCase().slice(0, 2);
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
