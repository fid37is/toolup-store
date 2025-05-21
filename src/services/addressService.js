import { doc, collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

/**
 * Get all addresses for the current user
 * @returns {Promise<Array>} Array of address objects
 */
export const getUserAddresses = async () => {
    try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
            throw new Error('User not authenticated');
        }

        const addressesRef = collection(db, 'addresses');
        const q = query(addressesRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);

        const addresses = [];
        querySnapshot.forEach((doc) => {
            addresses.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Sort addresses to put default address first
        addresses.sort((a, b) => (b.isDefault === true) - (a.isDefault === true));

        return addresses;
    } catch (error) {
        console.error('Error getting user addresses:', error);
        // Fall back to localStorage if Firestore fails
        return getLocalAddresses();
    }
};

/**
 * Add a new address for the current user
 * @param {Object} addressData - The address data to save
 * @returns {Promise<Object>} The saved address with ID
 */
export const addUserAddress = async (addressData) => {
    try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
            throw new Error('User not authenticated');
        }

        // If this is set as default or it's the first address, handle default logic
        if (addressData.isDefault) {
            await clearDefaultAddresses(user.uid);
        }

        // Add userId to the address data
        const fullAddressData = {
            ...addressData,
            userId: user.uid,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const addressesRef = collection(db, 'addresses');
        const docRef = await addDoc(addressesRef, fullAddressData);

        // Return the complete address with ID
        return {
            id: docRef.id,
            ...fullAddressData
        };
    } catch (error) {
        console.error('Error adding address:', error);
        // Fall back to local storage
        return addLocalAddress(addressData);
    }
};

/**
 * Update an existing address
 * @param {string} addressId - The ID of the address to update
 * @param {Object} addressData - The new address data
 * @returns {Promise<Object>} The updated address
 */
export const updateUserAddress = async (addressId, addressData) => {
    try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
            throw new Error('User not authenticated');
        }

        // If this address is being set as default, clear other defaults
        if (addressData.isDefault) {
            await clearDefaultAddresses(user.uid);
        }

        const addressRef = doc(db, 'addresses', addressId);

        // Update the document with new data
        const updateData = {
            ...addressData,
            updatedAt: new Date().toISOString()
        };

        await updateDoc(addressRef, updateData);

        // Return the updated address
        return {
            id: addressId,
            ...updateData,
            userId: user.uid
        };
    } catch (error) {
        console.error('Error updating address:', error);
        // Fall back to local storage
        return updateLocalAddress(addressId, addressData);
    }
};

/**
 * Delete an address
 * @param {string} addressId - The ID of the address to delete
 * @returns {Promise<boolean>} Success status
 */
export const deleteUserAddress = async (addressId) => {
    try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
            throw new Error('User not authenticated');
        }

        // First check if this is the default address
        const addressRef = doc(db, 'addresses', addressId);
        const addressDoc = await getDoc(addressRef);

        if (!addressDoc.exists()) {
            throw new Error('Address not found');
        }

        const addressData = addressDoc.data();
        const wasDefault = addressData.isDefault;

        // Delete the address
        await deleteDoc(addressRef);

        // If this was the default address, set a new default
        if (wasDefault) {
            const addresses = await getUserAddresses();
            if (addresses.length > 0) {
                await updateUserAddress(addresses[0].id, { isDefault: true });
            }
        }

        return true;
    } catch (error) {
        console.error('Error deleting address:', error);
        // Fall back to local storage
        return deleteLocalAddress(addressId);
    }
};

/**
 * Set an address as the default
 * @param {string} addressId - The ID of the address to set as default
 * @returns {Promise<boolean>} Success status
 */
export const setDefaultAddress = async (addressId) => {
    try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
            throw new Error('User not authenticated');
        }

        // Clear existing default addresses
        await clearDefaultAddresses(user.uid);

        // Set the new default
        const addressRef = doc(db, 'addresses', addressId);
        await updateDoc(addressRef, {
            isDefault: true,
            updatedAt: new Date().toISOString()
        });

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
            throw new Error('User not authenticated');
        }

        const addressesRef = collection(db, 'addresses');
        const q = query(
            addressesRef,
            where('userId', '==', user.uid),
            where('isDefault', '==', true)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return {
                id: doc.id,
                ...doc.data()
            };
        }

        // If no default found, try to get any address
        const allAddresses = await getUserAddresses();
        if (allAddresses.length > 0) {
            return allAddresses[0];
        }

        return null;
    } catch (error) {
        console.error('Error getting default address:', error);
        // Fall back to local storage
        return getLocalDefaultAddress();
    }
};

// Helper function to clear default flag from all addresses
async function clearDefaultAddresses(userId) {
    const addressesRef = collection(db, 'addresses');
    const q = query(
        addressesRef,
        where('userId', '==', userId),
        where('isDefault', '==', true)
    );

    const querySnapshot = await getDocs(q);

    const updatePromises = [];
    querySnapshot.forEach((document) => {
        updatePromises.push(
            updateDoc(doc(db, 'addresses', document.id), {
                isDefault: false,
                updatedAt: new Date().toISOString()
            })
        );
    });

    await Promise.all(updatePromises);
}

// Local storage fallback functions
// These are used when the user is offline or Firestore operations fail

function getLocalAddresses() {
    try {
        const savedAddresses = localStorage.getItem('shippingAddresses');
        return savedAddresses ? JSON.parse(savedAddresses) : [];
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