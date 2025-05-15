// src/utils/sheetsService.js
import { google } from 'googleapis';

async function getAuthClient() {
    let clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (process.env.GOOGLE_CREDENTIALS_BASE64) {
        const credentialsJson = Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString();
        const credentials = JSON.parse(credentialsJson);
        clientEmail = credentials.client_email;
        privateKey = credentials.private_key;
    } else if (privateKey) {
        privateKey = privateKey.replace(/\\n/g, '\n');
    }

    const auth = new google.auth.GoogleAuth({
        credentials: { client_email: clientEmail, private_key: privateKey },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    return auth;
}

export async function getSheetsClient() {
    const auth = await getAuthClient();
    return google.sheets({ version: 'v4', auth });
}
