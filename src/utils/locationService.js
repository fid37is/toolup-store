// src/utils/locationService.js
import fallbackData from '../data/state-lga.json';

const STATES_API = 'https://nga-states-lga.onrender.com/fetch';
const LGAS_API = 'https://nga-states-lga.onrender.com/?state=';

/**
 * Fetch the list of states from the API or fallback data
 * @returns {Promise<string[]>} Array of state names
 */
export const getStates = async () => {
    try {
        console.log('Fetching states from API...');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5-second timeout
        
        const res = await fetch(STATES_API, { 
            signal: controller.signal,
            headers: {
                'Accept': 'application/json'
            }
        });
        clearTimeout(timeoutId);
        
        if (!res.ok) {
            throw new Error(`API responded with status ${res.status}`);
        }
        
        const data = await res.json();
        console.log('API response for states:', data);
        
        // Handle different response formats from the API
        if (Array.isArray(data.states)) {
            return data.states.map(s => (typeof s === 'object' && s.name ? s.name : s));
        } else if (Array.isArray(data)) {
            return data;
        } else if (data && typeof data === 'object') {
            return Object.keys(data);
        }
        
        throw new Error('Invalid data format from API');
    } catch (err) {
        console.warn('Using fallback states data:', err.message);
        // Return fallback data
        const states = Object.keys(fallbackData);
        console.log('Fallback states:', states);
        return states;
    }
};

/**
 * Fetch the list of LGAs for a specific state
 * @param {string} stateName The name of the state
 * @returns {Promise<string[]>} Array of LGA names
 */
export const getLGAs = async (stateName) => {
    if (!stateName) return [];

    try {
        console.log(`Fetching LGAs for state: ${stateName}`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5-second timeout
        
        const res = await fetch(`${LGAS_API}${encodeURIComponent(stateName)}`, { 
            signal: controller.signal,
            headers: {
                'Accept': 'application/json'
            }
        });
        clearTimeout(timeoutId);
        
        if (!res.ok) {
            throw new Error(`API responded with status ${res.status}`);
        }
        
        const data = await res.json();
        console.log(`API response for LGAs (${stateName}):`, data);
        
        // Handle different response formats
        if (Array.isArray(data.lga)) {
            return data.lga;
        } else if (Array.isArray(data)) {
            return data;
        } else if (data && typeof data === 'object') {
            // Try to extract an array from the response
            for (const key in data) {
                if (Array.isArray(data[key])) {
                    return data[key];
                }
            }
        }
        
        throw new Error('Invalid data format from API');
    } catch (err) {
        console.warn(`Using fallback LGAs for ${stateName}:`, err.message);
        // Return fallback data for this state
        const lgas = fallbackData[stateName] || [];
        console.log(`Fallback LGAs for ${stateName}:`, lgas);
        return lgas;
    }
};

/**
 * Mock function to get towns for a given state and LGA
 * In a real application, this would fetch from an API
 */
export const getTowns = async (stateName, lgaName) => {
    try {
        console.log(`Fetching towns for ${stateName}, ${lgaName}`);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data for common areas
        const mockTownsData = {
            "Delta": {
                "Warri South": ["Warri", "Effurun", "Ekpan", "Enerhen"],
                "Ughelli North": ["Ughelli", "Agbarho", "Evwreni", "Orogun"],
                "Ethiope East": ["Isiokolo", "Okpara", "Abraka", "Eku"],
                "Ethiope West": ["Oghara", "Mosogar", "Jesse", "Ogharefe"],
                "Sapele": ["Sapele", "Amukpe", "Okirigwre", "Ugborhen"]
            },
            "Lagos": {
                "Ikeja": ["Oregun", "Opebi", "Allen", "GRA"],
                "Eti-Osa": ["Lekki", "Victoria Island", "Ikoyi", "Ajah"],
                "Alimosho": ["Ikotun", "Egbeda", "Idimu", "Ipaja"],
                "Surulere": ["Ojuelegba", "Aguda", "Ijeshatedo", "Adeniran Ogunsanya"],
                "Kosofe": ["Ogudu", "Ojota", "Ketu", "Mile 12"]
            },
            "Abuja": {
                "Abuja Municipal": ["Garki", "Wuse", "Maitama", "Asokoro"],
                "Bwari": ["Bwari", "Kubwa", "Ushafa", "Dutse"],
                "Gwagwalada": ["Gwagwalada", "Zuba", "Dobi", "Paikon"],
                "Kuje": ["Kuje", "Gwargwada", "Rubochi", "Chibiri"],
                "Kwali": ["Kwali", "Yangoji", "Pai", "Dafa"]
            }
        };
        
        if (stateName && lgaName && 
            mockTownsData[stateName] && 
            mockTownsData[stateName][lgaName]) {
            return mockTownsData[stateName][lgaName];
        }
        
        // Generate random towns for any state/LGA not in our mock data
        if (stateName && lgaName) {
            const genericTowns = [
                `${lgaName} Central`, 
                `${lgaName} North`, 
                `${lgaName} South`, 
                `New ${lgaName}`,
                `${lgaName} Town`
            ];
            return genericTowns;
        }
        
        return [];
    } catch (err) {
        console.warn(`Error fetching towns for ${stateName}, ${lgaName}:`, err.message);
        return [];
    }
};