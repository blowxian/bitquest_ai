import { useEffect } from 'react';
import axios from 'axios';

const FEISHU_NOTIFY_WEBHOOK_URL = 'https://open.feishu.cn/open-apis/bot/v2/hook/a39ace48-16f5-4a08-9aac-511ee2758987';

async function notifyFeishu(message: string) {
    try {
        await axios.post(FEISHU_NOTIFY_WEBHOOK_URL, {
            msg_type: 'text',
            content: {
                text: message,
            },
        });
    } catch (error) {
        console.error('飞书通知发送失败', error);
    }
}

async function getIPLocation(ip: string) {
    try {
        const response = await axios.get(`https://ipapi.co/${ip}/json/`);
        return response.data;
    } catch (error) {
        console.error('获取IP位置信息失败:', error);
        return null;
    }
}

export default function VisitorTracker() {
    useEffect(() => {
        const trackVisitor = async () => {
            try {
                const ipResponse = await axios.get('https://api.ipify.org?format=json');
                const ip = ipResponse.data.ip;
                const date = new Date();
                const options = { timeZone: 'Asia/Shanghai', hour12: false };
                const formattedDate = date.toLocaleString('zh-CN', options as Intl.DateTimeFormatOptions);
                const currentUrl = window.location.href;
                const referrer = document.referrer;

                const location = await getIPLocation(ip);
                let message = `[${currentUrl}] [${formattedDate}] IP: ${ip}`;

                if (location) {
                    message += ` [${location.city}, ${location.region}, ${location.country_name}]`;
                }

                message += `, 用户访问着陆页, 来源: ${referrer || '直接访问'}`;

                await notifyFeishu(message);
            } catch (error) {
                console.error('访问者追踪失败:', error);
            }
        };

        trackVisitor();
    }, []);

    return null; // 这个组件不渲染任何内容
}