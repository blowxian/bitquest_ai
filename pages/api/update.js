// /pages/api/update.js
import axios from 'axios';
import Cookie from 'cookie';
import models from '../../lib/models'; // 确保正确引入 models
import {notifyFeishu, warnFeishu} from '../../lib/notify';

const tokens = ['caa739ec6eff69a35a92a3480fb75211dcd536f38ddf461d37f988ddfcaebea5', '8a1fd0bb0a7cb217a3593e46ac3e7433df409196910e738ddc99d8dfe5673772',
'b3fccfe123c9c8579c0f02aac21800726fdc2a2e1b8def105e6feeed2068f32d','fe8475870ee898afcf4c5ec02d60b9306129d655f3d0e81575f427773d2f5de1','f03e5aff63a0bdf5c3e1be4239bbd14d20105d2812e31cd6b41e4e2a78117e0e']; // 替换为你的实际 token
let currentTokenIndex = 0;

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
        // 从请求中读取 cookie
        const cookies = Cookie.parse(req.headers.cookie || '');
        const selectedModelKey = cookies.selectedModel;

        // 根据 cookie 中的模型信息或默认模型选择模型
        const selectedModel = models[selectedModelKey] || models.mistral_7b_v2; // 使用默认模型，如果 cookie 中没有有效的模型信息

        // 向 TogetherAI 发送请求
        const response = await togetherAIRequest.post('/inference', {
            // TogetherAI API 请求体
            model: selectedModel.identifier,
            messages: [
                {"role": "system", "content": req.query.system_prompt},
                {"role": "user", "content": req.query.query}
            ],
            max_tokens: req.query.max_token ? +req.query.max_token : 1024,
            stop: '[/INST],</s>,<|im_end|>,[End],[end],\nReferences:\n,\nSources:\n,End.',
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
            // console.log('Received chunk: ', chunkAsString);

            // 将数据块添加到缓冲区
            buffer += chunkAsString;

            // 检查距离上次 flush 是否已过 100 毫秒
            if (Date.now() - lastFlushTime >= flushInterval) {
                console.log('Flushing buffer...');
                console.log(`Current token is: ${tokens[currentTokenIndex]}`);
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
        // console.error('Error communicating with TogetherAI:', error);
        await warnFeishu(`错误详情: ${error.message || '未知错误'} - Token ${tokens[currentTokenIndex]} 发生错误`);


        // 检查是否是 token 用完的错误
        if (error.response && error.response.status === 429) {
            // 切换到下一个 token
            currentTokenIndex = (currentTokenIndex + 1) % tokens.length;
            togetherAIRequest.defaults.headers['Authorization'] = `Bearer ${tokens[currentTokenIndex]}`;

            // 重新调用 handler 函数，传递相同的请求和响应对象
            await handler(req, res);
            return;
        }

        res.status(500).send('Internal Server Error');
    }
}

export default handler;
