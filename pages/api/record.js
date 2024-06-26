// pages/api/add_record.js

import axios from 'axios';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { appToken, tableId, recordId, recordData } = req.body;

        try {
            // 获取访问令牌
            const tokenResponse = await axios.post('https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal', {
                app_id: process.env.FEISHU_BITABLE_APP_ID,
                app_secret: process.env.FEISHU_BITABLE_APP_SECRET,
            });
            const accessToken = tokenResponse.data.app_access_token;

            let recordResponse;

            // 添加记录到飞书多维表格
            if(!recordId){
                recordResponse = await axios.post(
                    `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records`,
                    { fields: recordData },
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }
                );
            } else {
                recordResponse = await axios.put(
                    `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records${recordId ? '/' + recordId : ''}`,
                    { fields: recordData },
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }
                );
            }

            res.status(200).json(recordResponse.data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}