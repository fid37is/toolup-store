// src/utils/nigeriaLocations.js

// This is a simplified version - in production, you might use a database or API for this data
const nigerianStates = [
    { code: 'AB', name: 'Abia' },
    { code: 'AD', name: 'Adamawa' },
    { code: 'AK', name: 'Akwa Ibom' },
    { code: 'AN', name: 'Anambra' },
    { code: 'BA', name: 'Bauchi' },
    { code: 'BY', name: 'Bayelsa' },
    { code: 'BE', name: 'Benue' },
    { code: 'BO', name: 'Borno' },
    { code: 'CR', name: 'Cross River' },
    { code: 'DE', name: 'Delta' },
    { code: 'EB', name: 'Ebonyi' },
    { code: 'ED', name: 'Edo' },
    { code: 'EK', name: 'Ekiti' },
    { code: 'EN', name: 'Enugu' },
    { code: 'FC', name: 'FCT' },
    { code: 'GO', name: 'Gombe' },
    { code: 'IM', name: 'Imo' },
    { code: 'JI', name: 'Jigawa' },
    { code: 'KD', name: 'Kaduna' },
    { code: 'KN', name: 'Kano' },
    { code: 'KT', name: 'Katsina' },
    { code: 'KE', name: 'Kebbi' },
    { code: 'KO', name: 'Kogi' },
    { code: 'KW', name: 'Kwara' },
    { code: 'LA', name: 'Lagos' },
    { code: 'NA', name: 'Nasarawa' },
    { code: 'NI', name: 'Niger' },
    { code: 'OG', name: 'Ogun' },
    { code: 'ON', name: 'Ondo' },
    { code: 'OS', name: 'Osun' },
    { code: 'OY', name: 'Oyo' },
    { code: 'PL', name: 'Plateau' },
    { code: 'RI', name: 'Rivers' },
    { code: 'SO', name: 'Sokoto' },
    { code: 'TA', name: 'Taraba' },
    { code: 'YO', name: 'Yobe' },
    { code: 'ZA', name: 'Zamfara' }
];

// Example LGA data (simplified for Delta State)
const lgasByState = {
    'DE': [
        { name: 'Warri South' },
        { name: 'Uvwie' },
        { name: 'Sapele' },
        { name: 'Udu' },
        { name: 'Warri North' },
        { name: 'Warri South West' },
        { name: 'Isoko North' },
        { name: 'Isoko South' },
        { name: 'Ughelli North' },
        { name: 'Ughelli South' },
        { name: 'Ethiope East' },
        { name: 'Ethiope West' },
        { name: 'Okpe' },
        { name: 'Ndokwa East' },
        { name: 'Ndokwa West' },
        { name: 'Bomadi' },
        { name: 'Burutu' },
        { name: 'Patani' },
        { name: 'Aniocha North' },
        { name: 'Aniocha South' },
        { name: 'Oshimili North' },
        { name: 'Oshimili South' },
        { name: 'Ika North East' },
        { name: 'Ika South' },
        { name: 'Ukwuani' }
    ],
    // Add other states as needed or implement API-based fetching
};

// Example towns data (simplified for some Delta LGAs)
const townsByStateAndLGA = {
    'DE': {
        'Warri South': [
            { name: 'Warri' },
            { name: 'Ugborikoko' },
            { name: 'Ubeji' },
            { name: 'Aladja' }
        ],
        'Uvwie': [
            { name: 'Effurun' },
            { name: 'Ekpan' },
            { name: 'Enerhen' }
        ],
        'Sapele': [
            { name: 'Sapele' },
            { name: 'Amukpe' }
        ],
        'Udu': [
            { name: 'Ovwian' },
            { name: 'Aladja' },
            { name: 'Orhuwhorun' }
        ],
        // Add other LGAs as needed
    }
    // Add other states as needed
};

// Fetch all Nigerian states
export const fetchAllStates = async () => {
    try {
        // In a real app, this might be an API call
        return nigerianStates;
    } catch (error) {
        console.error('Error fetching states:', error);
        return [];
    }
};

// Fetch LGAs for a specific state
export const fetchLGAs = async (stateCode) => {
    try {
        // In a real app, this might be an API call
        return lgasByState[stateCode] || [];
    } catch (error) {
        console.error(`Error fetching LGAs for state ${stateCode}:`, error);
        return [];
    }
};

// Fetch towns for a specific state
export const fetchTowns = async (stateCode) => {
    try {
        // In a real app, this might be an API call
        const allTowns = [];
        const stateData = townsByStateAndLGA[stateCode];

        if (stateData) {
            Object.keys(stateData).forEach(lga => {
                const lgaTowns = stateData[lga].map(town => ({
                    ...town,
                    lga
                }));
                allTowns.push(...lgaTowns);
            });
        }

        return allTowns;
    } catch (error) {
        console.error(`Error fetching towns for state ${stateCode}:`, error);
        return [];
    }
};

// Filter towns by LGA
export const filterTownsByLGA = (towns, lga) => {
    return towns.filter(town => town.lga === lga);
};

// Calculate shipping fee based on location
export const calculateShippingFee = (location) => {
    const { state, lga, town } = location;

    // Base shipping fee
    let fee = 3500;

    // Premium locations (higher shipping fee)
    if (state === 'LA') { // Lagos
        fee = 4000;
    }

    // Discounted locations
    if (state === 'DE') { // Delta State
        fee = 3000;

        // Special LGAs in Delta State
        if (['Warri South', 'Uvwie', 'Sapele', 'Udu'].includes(lga)) {
            fee = 2500;

            // Specific towns with lowest rate
            if (town === 'Warri' || town === 'Effurun') {
                fee = 2000;
            }
        }
    }

    return fee;
};

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    fetchAllStates,
    fetchLGAs,
    fetchTowns,
    filterTownsByLGA,
    calculateShippingFee
};