// src/utils/driveService.js - Updated with improved Google Drive image handling
/**
 * Generates a Google Drive public URL for an image based on its ID
 * @param {string} imageId - The Google Drive image ID
 * @returns {string} The public URL for the image
 */
export function getImageUrl(imageId) {
    if (!imageId) return '/placeholder-product.jpg';

    // Direct link format for Google Drive images
    // This format often works better than the uc?export=view format
    return `https://drive.google.com/thumbnail?id=${imageId}&sz=w1000`;
    
    // Alternative formats if the above doesn't work:
    // return `https://drive.google.com/uc?export=view&id=${imageId}`;
    // return `https://lh3.googleusercontent.com/d/${imageId}`;
}

/**
 * Configure Next.js Image component to allow Google Drive domains
 * Add this to your next.config.js file:
 * 
 * module.exports = {
 *   images: {
 *     domains: ['drive.google.com', 'lh3.googleusercontent.com'],
 *   },
 * };
 */