// /pages/api/search_service.js
import axios from 'axios';

// 归一化函数
function normalizeResults(data, source) {
    if (source === 'GOOGLE') {
        return {
            items: data.items.map(item => ({
                title: item.title,
                snippet: item.snippet,
                link: item.link
            })),
            nextPageToken: data.queries.nextPage[0]?.startIndex,
        };
    } else if (source === 'SEARXNG') {
        return {
            items: data.results.slice(0, 8).map(result => ({
                domain: result.parsed_url.slice(1,2),
                title: result.title,
                snippet: result.content,
                link: result.url
            })),
            nextPageToken: null, // Assuming SearXNG does not support pagination
        };
    }
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({error: 'Method not allowed'});
    }

    const {keywords} = req.body;
    if (!keywords) {
        return res.status(400).json({error: 'Query parameter is required'});
    }

    const apiProvider = process.env.SEARCH_API_PROVIDER;
    const apiUrl = apiProvider === 'GOOGLE' ? 'https://www.googleapis.com/customsearch/v1' : 'https://search.coogle.ai/search';
    const params = apiProvider === 'GOOGLE' ? {
        key: process.env.GOOGLE_API_TOKEN,
        cx: process.env.GOOGLE_CS_ID,
        safe: 'active',
        excludeTerms: 'Google My Maps',
        q: keywords,
        num: 5,
    } : {
        format: 'json',
        q: keywords,
    };

    try {
        const response = await axios.get(apiUrl, {params});
        if (response.status === 200) {
            const normalizedData = normalizeResults(response.data, apiProvider);
            res.status(200).json(normalizedData);
        } else {
            res.status(response.status).send('Request failed with status code: ' + response.status);
        }
    } catch (error) {
        res.status(500).send('Error making the request: ' + error.message);
    }
}