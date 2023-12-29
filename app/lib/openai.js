import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export async function generateResponse(prompt) {
    try {
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: prompt,
            max_tokens: 150,
        });
        return response.data.choices[0].text.trim();
    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        throw error;
    }
}