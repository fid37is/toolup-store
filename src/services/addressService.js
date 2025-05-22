// addressService.js - Fixed Firestore User Collection Only
import { doc, getDoc, updateDoc, getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Initialize Firestore - this is required for the new Firebase v9+ SDK
const db = getFirestore();

/**
 * Get all addresses for the current user from their user document
 * @returns {Promise<Array>} Array of address objects
 */
export const getUserAddresses = async () => {
    try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
            console.log('User not authenticated, falling back to localStorage');
            return getLocalAddresses();
        }

        const userRef = doc(db, 'users', user.uid); // FIXED: Added db parameter
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            const addresses = userData.addresses || [];
            
            // Sort addresses to put default address first
            addresses.sort((a, b) => (b.isDefault === true) - (a.isDefault === true));
            
            return addresses;
        }

        return [];
    } catch (error) {
        console.error('Error getting user addresses:', error);
        // Fall back to localStorage if Firestore fails
        return getLocalAddresses();
    }
};

/**
 * Add a new address to the user's document
 * @param {Object} addressData - The address data to save
 * @returns {Promise<Object>} The saved address with ID
 */
export const addUserAddress = async (addressData) => {
    try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
            console.log('User not authenticated, saving to localStorage');
            return addLocalAddress(addressData);
        }

        const userRef = doc(db, 'users', user.uid); // FIXED: Added db parameter
        const userDoc = await getDoc(userRef);

        let addresses = [];
        if (userDoc.exists()) {
            addresses = userDoc.data().addresses || [];
        }

        // If this is set as default or it's the first address, clear other defaults
        if (addressData.isDefault || addresses.length === 0) {
            addresses.forEach(addr => addr.isDefault = false);
            addressData.isDefault = true;
        }

        // Create new address with ID
        const newAddress = {
            id: Date.now().toString(),
            ...addressData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        addresses.push(newAddress);

        // Update user document
        await updateDoc(userRef, { addresses });

        return newAddress;
    } catch (error) {
        console.error('Error adding address:', error);
        // Fall back to local storage
        return addLocalAddress(addressData);
    }
};

/**
 * Update an existing address in the user's document
 * @param {string} addressId - The ID of the address to update
 * @param {Object} addressData - The new address data
 * @returns {Promise<Object>} The updated address
 */
export const updateUserAddress = async (addressId, addressData) => {
    try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
            console.log('User not authenticated, updating in localStorage');
            return updateLocalAddress(addressId, addressData);
        }

        const userRef = doc(db, 'users', user.uid); // FIXED: Added db parameter
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            throw new Error('User document not found');
        }

        let addresses = userDoc.data().addresses || [];

        // If this address is being set as default, clear other defaults
        if (addressData.isDefault) {
            addresses.forEach(addr => {
                if (addr.id !== addressId) {
                    addr.isDefault = false;
                }
            });
        }

        // Find and update the address
        addresses = addresses.map(addr => {
            if (addr.id === addressId) {
                return {
                    ...addr,
                    ...addressData,
                    updatedAt: new Date().toISOString()
                };
            }
            return addr;
        });

        // Update user document
        await updateDoc(userRef, { addresses });

        // Return the updated address
        return addresses.find(addr => addr.id === addressId);
    } catch (error) {
        console.error('Error updating address:', error);
        // Fall back to local storage
        return updateLocalAddress(addressId, addressData);
    }
};

/**
 * Delete an address from the user's document
 * @param {string} addressId - The ID of the address to delete
 * @returns {Promise<boolean>} Success status
 */
export const deleteUserAddress = async (addressId) => {
    try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
            console.log('User not authenticated, deleting from localStorage');
            return deleteLocalAddress(addressId);
        }

        const userRef = doc(db, 'users', user.uid); // FIXED: Added db parameter
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            throw new Error('User document not found');
        }

        let addresses = userDoc.data().addresses || [];

        // Find the address to delete
        const addressToDelete = addresses.find(addr => addr.id === addressId);
        if (!addressToDelete) {
            throw new Error('Address not found');
        }

        const wasDefault = addressToDelete.isDefault;

        // Remove the address
        addresses = addresses.filter(addr => addr.id !== addressId);

        // If this was the default address and we have others, set a new default
        if (wasDefault && addresses.length > 0) {
            addresses[0].isDefault = true;
            addresses[0].updatedAt = new Date().toISOString();
        }

        // Update user document
        await updateDoc(userRef, { addresses });

        return true;
    } catch (error) {
        console.error('Error deleting address:', error);
        // Fall back to local storage
        return deleteLocalAddress(addressId);
    }
};

/**
 * Set an address as the default in the user's document
 * @param {string} addressId - The ID of the address to set as default
 * @returns {Promise<boolean>} Success status
 */
export const setDefaultAddress = async (addressId) => {
    try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
            console.log('User not authenticated, setting default in localStorage');
            return setLocalDefaultAddress(addressId);
        }

        const userRef = doc(db, 'users', user.uid); // FIXED: Added db parameter
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            throw new Error('User document not found');
        }

        let addresses = userDoc.data().addresses || [];

        // Update default status
        addresses = addresses.map(addr => ({
            ...addr,
            isDefault: addr.id === addressId,
            updatedAt: addr.id === addressId ? new Date().toISOString() : addr.updatedAt
        }));

        // Update user document
        await updateDoc(userRef, { addresses });

        return true;
    } catch (error) {
        console.error('Error setting default address:', error);
        // Fall back to local storage
        return setLocalDefaultAddress(addressId);
    }
};

/**
 * Get the default address for the current user
 * @returns {Promise<Object|null>} The default address or null
 */
export const getDefaultAddress = async () => {
    try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
            console.log('User not authenticated, getting default from localStorage');
            return getLocalDefaultAddress();
        }

        const userRef = doc(db, 'users', user.uid); // FIXED: Added db parameter
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const addresses = userDoc.data().addresses || [];
            
            // First try to find address marked as default
            let defaultAddress = addresses.find(addr => addr.isDefault === true);
            
            // If no default found but we have addresses, return the first one
            if (!defaultAddress && addresses.length > 0) {
                defaultAddress = addresses[0];
            }
            
            return defaultAddress || null;
        }

        return null;
    } catch (error) {
        console.error('Error getting default address:', error);
        // Fall back to local storage
        return getLocalDefaultAddress();
    }
};

/**
 * Get user's default address formatted for checkout
 * This is the main function for pre-filling checkout forms
 * @returns {Promise<Object|null>} Address data formatted for checkout
 */
export const getCheckoutAddress = async () => {
    try {
        const defaultAddress = await getDefaultAddress();
        
        if (defaultAddress) {
            return {
                address: defaultAddress.address || '',
                state: defaultAddress.state || '',
                lga: defaultAddress.lga || '',
                city: defaultAddress.city || '',
                town: defaultAddress.town || '',
                zip: defaultAddress.zip || '',
                additionalInfo: defaultAddress.additionalInfo || ''
            };
        }
        return null;
    } catch (error) {
        console.error('Error getting checkout address:', error);
        return null;
    }
};

// ============================================================================
// LOCAL STORAGE FALLBACK FUNCTIONS
// These are used when the user is offline or not authenticated
// ============================================================================

function getLocalAddresses() {
    try {
        const savedAddresses = localStorage.getItem('shippingAddresses');
        const addresses = savedAddresses ? JSON.parse(savedAddresses) : [];
        
        // Sort addresses to put default address first
        addresses.sort((a, b) => (b.isDefault === true) - (a.isDefault === true));
        
        return addresses;
    } catch (e) {
        console.error('Error accessing localStorage:', e);
        return [];
    }
}

function saveLocalAddresses(addresses) {
    try {
        localStorage.setItem('shippingAddresses', JSON.stringify(addresses));
        return true;
    } catch (e) {
        console.error('Error saving to localStorage:', e);
        return false;
    }
}

function addLocalAddress(addressData) {
    try {
        const addresses = getLocalAddresses();

        // If this is set as default or it's the first address
        if (addressData.isDefault || addresses.length === 0) {
            // Clear defaults on other addresses
            addresses.forEach(addr => addr.isDefault = false);

            // Ensure this one is default if it's the first
            if (addresses.length === 0) {
                addressData.isDefault = true;
            }
        }

        const newAddress = {
            id: Date.now().toString(),
            ...addressData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        addresses.push(newAddress);
        saveLocalAddresses(addresses);

        return newAddress;
    } catch (e) {
        console.error('Error adding to localStorage:', e);
        return null;
    }
}

function updateLocalAddress(addressId, addressData) {
    try {
        const addresses = getLocalAddresses();

        // If this address is being set as default, clear other defaults
        if (addressData.isDefault) {
            addresses.forEach(addr => {
                if (addr.id !== addressId) {
                    addr.isDefault = false;
                }
            });
        }

        // Find and update the address
        const updatedAddresses = addresses.map(addr => {
            if (addr.id === addressId) {
                return {
                    ...addr,
                    ...addressData,
                    updatedAt: new Date().toISOString()
                };
            }
            return addr;
        });

        saveLocalAddresses(updatedAddresses);

        // Return the updated address
        return updatedAddresses.find(addr => addr.id === addressId);
    } catch (e) {
        console.error('Error updating in localStorage:', e);
        return null;
    }
}

function deleteLocalAddress(addressId) {
    try {
        const addresses = getLocalAddresses();

        // Find the address to delete
        const addressToDelete = addresses.find(addr => addr.id === addressId);
        if (!addressToDelete) return false;

        const wasDefault = addressToDelete.isDefault;

        // Remove the address
        const updatedAddresses = addresses.filter(addr => addr.id !== addressId);

        // If this was the default and we have others, set a new default
        if (wasDefault && updatedAddresses.length > 0) {
            updatedAddresses[0].isDefault = true;
        }

        saveLocalAddresses(updatedAddresses);
        return true;
    } catch (e) {
        console.error('Error deleting from localStorage:', e);
        return false;
    }
}

function setLocalDefaultAddress(addressId) {
    try {
        const addresses = getLocalAddresses();

        // Update default status
        const updatedAddresses = addresses.map(addr => ({
            ...addr,
            isDefault: addr.id === addressId,
            updatedAt: addr.id === addressId ? new Date().toISOString() : addr.updatedAt
        }));

        saveLocalAddresses(updatedAddresses);
        return true;
    } catch (e) {
        console.error('Error setting default in localStorage:', e);
        return false;
    }
}

function getLocalDefaultAddress() {
    try {
        const addresses = getLocalAddresses();

        // First try to find address marked as default
        let defaultAddress = addresses.find(addr => addr.isDefault === true);

        // If no default found but we have addresses, return the first one
        if (!defaultAddress && addresses.length > 0) {
            defaultAddress = addresses[0];
        }

        return defaultAddress || null;
    } catch (e) {
        console.error('Error getting default from localStorage:', e);
        return null;
    }
}