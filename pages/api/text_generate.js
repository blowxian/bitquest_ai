import { VertexAI } from '@google-cloud/vertexai';
import { GoogleAuth } from 'google-auth-library';
import axios from 'axios';
import Cookie from 'cookie';
import { warnFeishu } from '@/lib/feishu';
import models from '@/lib/models';

// Google Gemini configuration
const keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const auth = new GoogleAuth({
    keyFilename: keyFilename,
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
});
const vertexAI = new VertexAI({
    project: process.env.GOOGLE_CLOUD_PROJECT,
    location: process.env.GOOGLE_CLOUD_LOCATION,
    auth: auth
});
const geminiModel = vertexAI.preview.getGenerativeModel({
    model: 'gemini-pro',
    generation_config: {
        max_output_tokens: 2048,
        temperature: 0.7,
        top_p: 0.7,
        top_k: 50,
    },
});

// Together AI configuration
const tokens = ['875c91af0779c94f5234a0c73b6646497baf3a9037cacfae9e74f75cc12e2e20', '0af3d5ea86a9bb0787539fd6691622031699e010aa9b3b6d979b4a6c1c5b1d64',
    '29a4bba251ee94a819ea9d307ff558df2c693034ed9e5ce4deec5f006b9fffd7', '3fcd9674bab86c47bf6a11a6d691ddfcf9caeb2045731ed07644a96ee6cf28d0', 'd3f660db7b62be207c29bc6d1b0ce29f574366b207ef6abab9e3f216377a38f8',
    '853ec4a27189e991dd7c7ee0aa6e45839c088e7a932de0209518cf446b496605'
];
let currentTokenIndex = 0;

const togetherAIRequest = axios.create({
    baseURL: 'https://api.together.xyz',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokens[currentTokenIndex]}`,
    },
    responseType: 'stream',
});

async function handler(req, res) {
    try {
        const cookies = Cookie.parse(req.headers.cookie || '');
        const selectedModelKey = cookies.selectedModel;
        const selectedModel = models[selectedModelKey] || models.mistral_7b_v2;

        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        });

        const messages = [
            { role: 'user', content: req.query.system_prompt },
            { role: 'user', content: req.query.query }
        ];

        try {
            // Try Gemini first
            const client = await auth.getClient();
            await client.getAccessToken();

            const streamingResp = await geminiModel.generateContentStream({
                contents: [{ role: 'user', parts: [{ text: messages.map(m => m.content).join('\n') }] }],
            });

            for await (const item of streamingResp.stream) {
                if (item.candidates && item.candidates[0] && item.candidates[0].content) {
                    const content = item.candidates[0].content.parts[0].text;
                    res.write(`data: ${JSON.stringify({ content })}\n\n`);
                    res.flush();
                }
            }
        } catch (geminiError) {
            console.error('Gemini API error:', geminiError);
            await warnFeishu(`Gemini API error: ${geminiError.message || 'Unknown error'}`);

            // Fallback to Together AI
            const response = await togetherAIRequest.post('/inference', {
                model: selectedModel.identifier,
                messages: messages,
                max_tokens: req.query.max_token ? +req.query.max_token : 1024,
                stop: '[/INST],</s>,<|im_end|>,[End],[end],\nReferences:\n,\nSources:\n,End.',
                temperature: 0.7,
                top_p: 0.7,
                top_k: 50,
                repetition_penalty: 1,
                stream: true,
            });

            let buffer = '';
            let lastFlushTime = Date.now();
            const flushInterval = 100;

            response.data.on('data', (chunk) => {
                buffer += chunk.toString('utf-8');
                if (Date.now() - lastFlushTime >= flushInterval) {
                    res.write(buffer);
                    res.flush();
                    buffer = '';
                    lastFlushTime = Date.now();
                }
            });

            response.data.on('end', () => {
                if (buffer.length > 0) {
                    res.write(buffer);
                    res.flush();
                }
            });
        }

        res.write('data: [DONE]\n\n');
        res.end();

    } catch (error) {
        console.error('API error:', error);
        await warnFeishu(`API error: ${error.message || 'Unknown error'}`);
        res.status(500).json({ error: error.message || 'Unknown error' });
    }
}

export default handler;
