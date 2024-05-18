import axios from 'axios';
import { notifyFeishu } from '../../lib/notify';

const tokens = ['cc06736ef1f11f2e5e739383f8979dd0c3aa6048a8e11ef28aaca83dd751e125', '0a44bf308754e4f61b9ff196bb2c2ff4392094aaeb96c347a6b4e1e320fa0cdf', '43d8345f27283b0b7a389354f55e60269a2d458f8ada529ac26d32f36dcfb002']; // 替换为你的实际 token
let currentTokenIndex = 0;

// 对外可以免费提供服务的模型
const modelListFree = {
    gemma_2b_it: 'google/gemma-2b-it',                          // $0.1/M token
    gemma_7b_it: 'google/gemma-7b-it',                          // $0.2/M token
    llama_3_8b: 'meta-llama/Llama-3-8b-chat-hf',                // $0.2/M token
    qwen_4b: 'Qwen/Qwen1.5-4B-Chat',                            // $0.1/M token
    qwen_7b: 'Qwen/Qwen1.5-7B-Chat',                            // $0.2/M token
    qwen_14b: 'Qwen/Qwen1.5-14B-Chat',                          // $0.3/M token
    mistral_7b_v1: 'mistralai/Mistral-7B-Instruct-v0.1',        // $0.1/M token
    mistral_7b_v2: 'mistralai/Mistral-7B-Instruct-v0.2'         // $0.2/M token
};

// 性价比还行的模型
const modelListPro = {
    llama_3_70b: 'meta-llama/Llama-3-70b-chat-hf',              // $0.9/M token
    qwen_32b: 'Qwen/Qwen1.5-32B-Chat',                          // $0.8/M token
    qwen_72b: 'Qwen/Qwen1.5-72B-Chat',                          // $0.9/M token
    mixtral_8x7b: 'mistralai/Mixtral-8x7B-Instruct-v0.1'        // $0.6/M token
};

// 太贵的模型
const modelListUltra = {
    mixtral_8x22b: 'mistralai/Mixtral-8x22B-Instruct-v0.1',     // $1.2/M token
    qwen_110b: 'Qwen/Qwen1.5-110B-Chat',                        // $1.8/M token
    snowflake_arctic: 'Snowflake/snowflake-arctic-instruct'     // $2.4/M token
};

const togetherAIRequest = axios.create({
    baseURL: 'https://api.together.xyz',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokens[currentTokenIndex]}`,
    },
    responseType: 'stream', // 重要：设置响应类型为流
});

async function handler(req, res) {
    try {
        await notifyFeishu(`Token ${tokens[currentTokenIndex]} 正在使用，使用详情如下：
            model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
            prompt: "{}<human>: " + ${req.query.prompt} + "\\n\\n<expert>:",
        `);

        // 向 TogetherAI 发送请求
        const response = await togetherAIRequest.post('/inference', {
            // TogetherAI API 请求体
            model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
            prompt: "{}<human>: " + req.query.prompt + "\n\n<expert>:",
            max_tokens: req.query.max_token ? +req.query.max_token : 2048,
            stop: '[/INST],</s>',
            temperature: 0.7,
            top_p: 0.7,
            top_k: 50,
            repetition_penalty: 1,
            stream: true,
        });

        // 设置头部以启用流式传输
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        });

        let buffer = '';
        let lastFlushTime = Date.now();
        const flushInterval = 100; // 设置为 100 毫秒

        // 监听流上的 'data' 事件
        response.data.on('data', (chunk) => {
            const chunkAsString = chunk.toString('utf-8');
            console.log('Received chunk: ', chunkAsString);

            // 将数据块添加到缓冲区
            buffer += chunkAsString;

            // 检查距离上次 flush 是否已过 100 毫秒
            if (Date.now() - lastFlushTime >= flushInterval) {
                console.log('Flushing buffer...');
                // 如果是，则 flush 缓冲区并重置计时器
                res.write(buffer);
                res.flush();  // 确保调用 flush 方法
                buffer = '';  // 清空缓冲区
                lastFlushTime = Date.now();  // 更新上次 flush 时间
            }
        });

        // 当流结束时，结束响应
        response.data.on('end', () => {
            if (buffer.length > 0) {
                console.log('Flushing buffer...');
                res.write(buffer);
                res.flush();  // 确保调用 flush 方法
            }
            console.log('Stream ended');
            res.end();
        });

    } catch (error) {
        console.error('Error communicating with TogetherAI:', error);

        // 检查是否是 token 用完的错误
        if (error.response && error.response.status === 429) {
            await notifyFeishu(`Token ${tokens[currentTokenIndex]} 已用完，切换到下一个 Token`);

            // 切换到下一个 token
            currentTokenIndex = (currentTokenIndex + 1) % tokens.length;
            togetherAIRequest.defaults.headers['Authorization'] = `Bearer ${tokens[currentTokenIndex]}`;

            // 重新调用 handler 函数，传递相同的请求和响应对象
            handler(req, res);
            return;
        }

        res.status(500).send('Internal Server Error');
    }
}

export default handler;
