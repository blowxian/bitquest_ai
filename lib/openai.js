import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


export async function generateResponse(prompt) {
    try {
        const stream = await openai.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'gpt-3.5-turbo',
            stream: true,
        });
        for await (const chunk of stream) {
            process.stdout.write(chunk.choices[0]?.delta?.content || '');
        }

        // return response.data.choices[0].text.trim();
    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        throw error;
    }
}