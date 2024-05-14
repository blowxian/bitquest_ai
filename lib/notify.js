// lib/notify.js

import axios from 'axios';

// 替换为你的飞书 Webhook URL
const FEISHU_WEBHOOK_URL = 'https://open.feishu.cn/open-apis/bot/v2/hook/d48d7db6-ff6c-43c8-acae-1dbac5aa9fd9';

export async function notifyFeishu(message) {
    try {
        await axios.post(FEISHU_WEBHOOK_URL, {
            msg_type: 'text',
            content: {
                text: message,
            },
        });
    } catch (error) {
        console.error('发送飞书通知失败', error);
    }
}