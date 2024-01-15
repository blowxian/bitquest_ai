// pages/api/stream.js
import axios from 'axios';

export default async function handler(req, res) {
    // 配置 OpenAI 请求
    const togetherAIRequest = axios.create({
        baseURL: 'https://api.together.xyz',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.API_BEARER_TOKEN}`
        },
        responseType: 'stream' // 重要：设置响应类型为流
    });

    try {
        // 向 TogetherAI 发送请求
        const response = await togetherAIRequest.post('/inference', {
            // TogetherAI API 请求体
            model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
            prompt: "{HISTORY}{user_id}: {" + req.body.prompt + "。50中文字数内}\n{bot_id}:",
            max_tokens: 512,
            stop: '[/INST],</s>',
            temperature: 0.7,
            top_p: 0.7,
            top_k: 50,
            repetition_penalty: 1,
            stream: true,
        });

        // 设置头部以启用流式传输
        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Transfer-Encoding': 'chunked'
        });


        // 监听流上的 'data' 事件
        response.data.on('data', (chunk) => {
            const chunkAsString = chunk.toString('utf-8');
            console.log('Received chunk: ', chunkAsString);
            // 也可以将数据块直接传输给客户端
            res.write(chunk);
        });

        // 当流结束时，结束响应
        response.data.on('end', () => {
            console.log('Stream ended');
            res.end();
        });

        // 将 TogetherAI 响应的数据流直接传输给客户端
        // response.data.pipe(res);
    } catch (error) {
        console.error('Error communicating with TogetherAI:', error);
        res.status(500).send('Internal Server Error');
    }
}
