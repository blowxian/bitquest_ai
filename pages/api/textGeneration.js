// pages/api/textGeneration.js
import api from 'api';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const sdk = api('@togetherdocs/v0.2#1o8o1qlr1bamlq');
        sdk.auth(`${process.env.API_BEARER_TOKEN}`);

        try {
            const response = await sdk.inference({
                model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
                prompt: req.body.prompt,
                max_tokens: 128,
                stop: '.',
                temperature: 0.7,
                top_p: 0.7,
                top_k: 50,
                repetition_penalty: 1,
                stream: true,
            })
            // res.status(200).json({ data: response });

            res.status(200).json(response.data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else {
        res.status(405).end(`Method Not Allowed`);
    }
}
