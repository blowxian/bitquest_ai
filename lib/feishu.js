// lib/notify.js
import axios from 'axios';

// Replace with your Feishu Webhook URLs
const FEISHU_NOTIFY_WEBHOOK_URL = 'https://open.feishu.cn/open-apis/bot/v2/hook/a39ace48-16f5-4a08-9aac-511ee2758987';
const FEISHU_WARN_WEBHOOK_URL = 'https://open.feishu.cn/open-apis/bot/v2/hook/23543247-e9e8-4d2b-8b1d-549bae869707';

export async function notifyFeishu(message) {
    try {
        await axios.post(FEISHU_NOTIFY_WEBHOOK_URL, {
            msg_type: 'text',
            content: {
                text: message,
            },
        });
    } catch (error) {
        console.error('Failed to send Feishu notification', error);
    }
}

export async function warnFeishu(message) {
    try {
        await axios.post(FEISHU_WARN_WEBHOOK_URL, {
            msg_type: 'text',
            content: {
                text: message,
            },
        });
    } catch (error) {
        console.error('Failed to send Feishu warning', error);
    }
}

export async function recordToFeishu(appToken, tableId, recordId, recordData) {
    try {
        // 添加记录到飞书多维表格
        const recordResponse = await axios.post('/api/record', {
            app_id: process.env.FEISHU_BITABLE_APP_ID,
            app_secret: process.env.FEISHU_BITABLE_APP_SECRET,
            "appToken": appToken,
            "tableId": tableId,
            "recordId": recordId,
            "recordData": recordData
        });

        return recordResponse.data;
    } catch (error) {
        console.error('Failed to add record to Feishu Bitable', error);
    }
}