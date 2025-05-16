// src/utils/locationService.js
import fallbackData from '../data/state-lga.json';

const STATES_API = 'https://nga-states-lga.onrender.com/fetch';
const LGAS_API = 'https://nga-states-lga.onrender.com/?state=';

export const getStates = async () => {
    try {
        const res = await fetch(STATES_API);
        const data = await res.json();

        if (Array.isArray(data.states)) {
            return data.states.map(s => (typeof s === 'object' ? s.name : s));
        } else if (Array.isArray(data)) {
            return data;
        } else {
            return Object.keys(data);
        }
    } catch (err) {
        console.warn('Using fallback states:', err.message);
        return Object.keys(fallbackData);
    }
};

export const getLGAs = async (stateName) => {
    if (!stateName) return [];

    try {
        const res = await fetch(`${LGAS_API}${encodeURIComponent(stateName)}`);
        const data = await res.json();

        if (Array.isArray(data.lga)) {
            return data.lga;
        } else if (Array.isArray(data)) {
            return data;
        } else if (typeof data === 'object') {
            const arr = Object.values(data).find(v => Array.isArray(v));
            return arr || [];
        }

        return [];
    } catch (err) {
        console.warn(`Using fallback LGAs for ${stateName}`, err.message);
        return fallbackData[stateName] || [];
    }
};
