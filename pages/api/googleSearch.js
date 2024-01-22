import axios from 'axios';

export default async function getServerSideProps(req, res) {
    if (req.method === 'POST') {
        // 获取 POST 请求中的 query 参数
        const {query} = req.body;

        // 确保 query 参数存在
        if (!query) {
            return res.status(400).json({error: 'Query parameter is required'});
        }

        try {
            const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
                params: {
                    key: process.env.GOOGLE_API_TOKEN,
                    cx: process.env.GOOGLE_CS_ID,
                    q: query,
                },
            });

            if (response.status === 200) {
                res.status(200).json(response.data);
            } else {
                res.status(response.status).send('Request failed with status code: ' + response.status);
            }
        } catch (error) {
            res.status(500).send('Error making the request: ' + error.message);
        }
    } else {
        // 如果不是 POST 请求，返回错误
        res.status(405).json({error: 'Method not allowed'});
    }
}
