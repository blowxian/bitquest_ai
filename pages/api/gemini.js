import { VertexAI } from '@google-cloud/vertexai';
import { GoogleAuth } from 'google-auth-library';
import Cookie from 'cookie';
import { warnFeishu } from '@/lib/feishu';

// 使用凭证文件路径
const keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;

// 初始化 Google Auth
const auth = new GoogleAuth({
    keyFilename: keyFilename,
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
});

// 初始化 Vertex AI
const vertexAI = new VertexAI({
    project: process.env.GOOGLE_CLOUD_PROJECT,
    location: process.env.GOOGLE_CLOUD_LOCATION,
    auth: auth
});

// 获取 Gemini Pro 模型
const model = 'gemini-pro';
const generativeModel = vertexAI.preview.getGenerativeModel({
    model: model,
    generation_config: {
        max_output_tokens: 2048,
        temperature: 0.7,
        top_p: 0.7,
        top_k: 50,
    },
});

async function handler(req, res) {
    try {
        // 在每次请求时获取新的访问令牌
        const client = await auth.getClient();
        await client.getAccessToken();

        // 从请求中读取 cookie
        const cookies = Cookie.parse(req.headers.cookie || '');
        const selectedModelKey = cookies.selectedModel;

        // 设置头部以启用流式传输
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        });

        // 准备请求内容
        const messages = [
            { role: 'user', content: req.query.system_prompt },
            { role: 'user', content: req.query.query }
        ];

        // 发送流式请求到 Gemini
        const streamingResp = await generativeModel.generateContentStream({
            contents: [{ role: 'user', parts: [{ text: messages.map(m => m.content).join('\n') }] }],
        });

        // 处理流式响应
        for await (const item of streamingResp.stream) {
            if (item.candidates && item.candidates[0].content) {
                const content = item.candidates[0].content.parts[0].text;
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
                res.flush();
            }
        }

        res.write('data: [DONE]\n\n');
        res.end();

    } catch (error) {
        console.error('Gemini API 错误:', error);
        let errorMessage = error.message || '未知错误';
        if (error.response && error.response.data) {
            errorMessage += ` - ${JSON.stringify(error.response.data)}`;
        }
        await warnFeishu(`Gemini API 错误: ${errorMessage}`);
        res.status(500).json({ error: errorMessage });
    }
}

export default handler;