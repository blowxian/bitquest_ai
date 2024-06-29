import { google } from 'googleapis';
import path from 'path';
import axios from 'axios';

const SCOPES = ['https://www.googleapis.com/auth/indexing'];
const CREDENTIALS_PATH = path.join(process.cwd(), 'google-credentials.json');

console.log('Current working directory:', process.cwd());
console.log('Credentials path:', path.join(process.cwd(), 'credentials.json'));

async function getAuthenticatedClient() {
    const auth = new google.auth.GoogleAuth({
        keyFile: CREDENTIALS_PATH,
        scopes: SCOPES,
    });

    const authClient = await auth.getClient();
    return authClient;
}

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        const authClient = await getAuthenticatedClient();

        const endpoint = 'https://indexing.googleapis.com/v3/urlNotifications:publish';
        const requestBody = {
            url: url,
            type: 'URL_UPDATED',
        };

        try {
            const response = await axios.post(endpoint, requestBody, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authClient.credentials.access_token}`,
                },
            });

            console.log('Google Indexing API response:', response.data);

            res.status(200).json(response.data);
        } catch (error) {
            res.status(500).json({ error: error });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}