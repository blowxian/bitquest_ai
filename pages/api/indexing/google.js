// pages/api/updateGoogleIndex.js
import {google} from 'googleapis';
import path from 'path';
import fs from 'fs';
import {notifyFeishu} from "../../../lib/feishu";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { url, type } = req.body;

    if (!url || !type) {
        return res.status(400).json({ message: 'URL and type are required' });
    }

    try {
        // Load the service account key JSON file.
        const keyFile = path.join(process.cwd(), 'google-credentials.json');
        const key = JSON.parse(fs.readFileSync(keyFile, 'utf8'));

        // Set up a JWT auth client
        const jwtClient = new google.auth.JWT(
            key.client_email,
            null,
            key.private_key,
            ['https://www.googleapis.com/auth/indexing'],
            null
        );

        // Authenticate request
        await jwtClient.authorize();

        // Initialize the Indexing API service
        const indexing = google.indexing({ version: 'v3', auth: jwtClient });

        // Make the API request
        const response = await indexing.urlNotifications.publish({
            requestBody: {
                url: url,
                type: type // 'URL_UPDATED' or 'URL_DELETED'
            }
        });
        notifyFeishu(`Google indexing successfully: ${JSON.stringify(response)}`);

        res.status(200).json({ message: 'Successfully updated Google Index', data: response.data });
    } catch (error) {
        notifyFeishu(`Google indexing failed!`);

        console.error('Error updating Google Index:', error);
        res.status(500).json({ message: 'Error updating Google Index', error: error.message });
    }
}