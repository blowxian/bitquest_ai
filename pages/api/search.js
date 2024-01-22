// pages/api/search.js
export default async function handler(req, res) {
    const apiKey = process.env.APIFY_TOKEN;
    const taskId = 'YOUR_TASK_ID';
    const query = req.query.q; // 获取查询参数

    // 构造Apify API URL
    const apiUrl = `https://api.apify.com/v2/actor-tasks/${taskId}/run-sync-get-dataset-items?token=${apiKey}&input=${JSON.stringify({ query })}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching data' });
    }
}
