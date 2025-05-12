// src/utils/driveService.js
import { authorizeJwtClient, getDrive } from './sheetsService';

// Function to get image URL from Google Drive
export const getImageUrl = (fileId) => {
    if (!fileId) return null;

    // This format is more reliable for displaying images in browsers
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
};

// Function to extract fileId from Google Drive URL
export const extractFileId = (url) => {
    if (!url) return null;

    // Handle different URL formats
    if (url.includes('thumbnail?id=')) {
        return new URL(url).searchParams.get('id');
    } else if (url.includes('export=view&id=')) {
        return new URL(url).searchParams.get('id');
    } else if (url.includes('drive.google.com')) {
        const matches = url.match(/[-\w]{25,}/);
        return matches ? matches[0] : null;
    }

    return url; // Assume it's already an ID
};

// Function to check if a file exists in Google Drive
export const checkFileExists = async (fileId) => {
    try {
        await authorizeJwtClient();
        const drive = getDrive();

        await drive.files.get({
            fileId,
            fields: 'id'
        });

        return true;
    } catch (error) {
        if (error.code === 404) {
            return false;
        }
        console.error('Error checking file existence:', error);
        throw error;
    }
};

// Function to list all images in a folder
export const listImagesInFolder = async (folderId = process.env.GOOGLE_DRIVE_FOLDER_ID) => {
    try {
        await authorizeJwtClient();
        const drive = getDrive();

        const response = await drive.files.list({
            q: `'${folderId}' in parents and mimeType contains 'image/'`,
            fields: 'files(id, name, webContentLink, mimeType)',
            spaces: 'drive'
        });

        return response.data.files.map(file => ({
            id: file.id,
            name: file.name,
            mimeType: file.mimeType,
            thumbnail: getImageUrl(file.id)
        }));
    } catch (error) {
        console.error('Error listing images in folder:', error);
        throw error;
    }
};