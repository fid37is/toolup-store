import { db } from './firebase';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

/**
 * Creates or updates a user document in Firestore
 * @param {Object} user - Firebase Auth user object
 * @param {Object} additionalData - Any additional user data to store
 * @returns {Promise<Object>} - The created/updated user document data
 */
export const createUserDocument = async (user, additionalData = {}) => {
    if (!user) return null;

    try {
        // Reference to the user document
        const userRef = doc(db, 'users', user.uid);

        // Check if the user document exists
        const userSnapshot = await getDoc(userRef);

        if (!userSnapshot.exists()) {
            // If it doesn't exist, create a new user document
            const { displayName, email, photoURL, phoneNumber } = user;
            const createdAt = new Date().toISOString();

            // Extract first and last name from display name if available
            let firstName = '', lastName = '';
            if (additionalData.firstName && additionalData.lastName) {
                firstName = additionalData.firstName;
                lastName = additionalData.lastName;
            } else if (displayName) {
                const nameParts = displayName.split(' ');
                firstName = nameParts[0] || '';
                lastName = nameParts.slice(1).join(' ') || '';
            }

            // Prepare user data
            const userData = {
                uid: user.uid,
                firstName,
                lastName,
                email: email || additionalData.email || '',
                phone: phoneNumber || additionalData.phone || '',
                photoURL: photoURL || '',
                dob: additionalData.dob || '',
                joinDate: createdAt,
                lastLogin: createdAt,
                acceptedTerms: additionalData.acceptedTerms || false,
                acceptedTermsDate: additionalData.acceptedTermsDate || null,
                authProvider: additionalData.authProvider || 'email',
                lastUpdated: createdAt,
                createdAt
            };

            // Create the user document
            await setDoc(userRef, userData);
            return userData;
        } else {
            // If user document exists, just update lastLogin
            const updateData = {
                lastLogin: new Date().toISOString()
            };

            await updateDoc(userRef, updateData);
            return { ...userSnapshot.data(), ...updateData };
        }
    } catch (error) {
        console.error('Error creating user document:', error);
        throw error;
    }
};

/**
 * Updates user profile data in Firestore
 * @param {string} userId - The user ID
 * @param {Object} profileData - The profile data to update
 * @returns {Promise<void>}
 */
export const updateUserProfile = async (userId, profileData) => {
    if (!userId) throw new Error('User ID is required');

    try {
        const userRef = doc(db, 'users', userId);

        // Add timestamp for when the profile was last updated
        const updatedData = {
            ...profileData,
            lastUpdated: new Date().toISOString()
        };

        await updateDoc(userRef, updatedData);
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
};

/**
 * Gets a user document by ID
 * @param {string} userId - The user ID
 * @returns {Promise<Object|null>} - The user document data or null
 */
export const getUserById = async (userId) => {
    if (!userId) return null;

    try {
        const userRef = doc(db, 'users', userId);
        const userSnapshot = await getDoc(userRef);

        if (userSnapshot.exists()) {
            return { id: userSnapshot.id, ...userSnapshot.data() };
        }

        return null;
    } catch (error) {
        console.error('Error getting user:', error);
        throw error;
    }
};

/**
 * Gets a user document by email
 * @param {string} email - The user's email
 * @returns {Promise<Object|null>} - The user document data or null
 */
export const getUserByEmail = async (email) => {
    if (!email) return null;

    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            return { id: userDoc.id, ...userDoc.data() };
        }

        return null;
    } catch (error) {
        console.error('Error getting user by email:', error);
        throw error;
    }
};

/**
 * Checks if a user has accepted the terms and conditions
 * @param {string} userId - The user ID
 * @returns {Promise<boolean>} - Whether the user has accepted terms
 */
export const hasUserAcceptedTerms = async (userId) => {
    if (!userId) return false;

    try {
        const userData = await getUserById(userId);
        return userData?.acceptedTerms === true;
    } catch (error) {
        console.error('Error checking terms acceptance:', error);
        return false;
    }
};

/**
 * Updates the user's terms acceptance status
 * @param {string} userId - The user ID
 * @param {boolean} accepted - Whether terms are accepted
 * @returns {Promise<void>}
 */
export const updateUserTermsAcceptance = async (userId, accepted = true) => {
    if (!userId) throw new Error('User ID is required');

    try {
        const userRef = doc(db, 'users', userId);

        await updateDoc(userRef, {
            acceptedTerms: accepted,
            acceptedTermsDate: accepted ? new Date().toISOString() : null,
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error updating terms acceptance:', error);
        throw error;
    }
};