// /pages/api/checkout_sessions.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { userId, plan } = req.body;  // 获取 POST 请求体中的 userId 和 plan

        // 根据 plan 动态设置 price ID
        let priceId;
        switch(plan) {
            case 'monthly':
                priceId = 'price_1PM8gPRsqc5wnJW19I8I00Yx';  // 月度订阅的 price_id
                break;
            case 'yearly':
                priceId = 'price_1PM8hJRsqc5wnJW14qXQsU2w';  // 年度订阅的 price_id
                break;
            default:
                res.status(400).json({ error: 'Invalid plan specified' });
                return;
        }

        try {
            // Create Checkout Sessions from body params.
            const session = await stripe.checkout.sessions.create({
                line_items: [
                    {
                        price: priceId,
                        quantity: 1,
                    },
                ],
                mode: 'subscription',
                success_url: `${req.headers.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${req.headers.origin}/checkout/canceled`,
                automatic_tax: {enabled: true},
                metadata: {
                    userId: userId,  // 将 userId 添加到 metadata 中
                    plan: plan  // Optional: 将 plan 添加到 metadata 中以跟踪
                }
            });
            res.redirect(303, session.url);
        } catch (err) {
            res.status(err.statusCode || 500).json(err.message);
        }
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
}
