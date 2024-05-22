// /pages/api/payment_success.js
import { PrismaClient } from '@prisma/client';
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const session = await stripe.checkout.sessions.retrieve(req.query.session_id, {
                expand: ['line_items'],
            });
            const userId = session.metadata.userId;
            const priceId = session.line_items.data[0].price.id;

            // 通过 priceId 判断订阅的类型（按月或按年）
            const tier = priceId === process.env.MONTHLY_PRICE_ID ? 'Monthly' : 'Annual';

            const subscription = await prisma.subscription.create({
                data: {
                    userId: parseInt(userId),
                    status: 'active',
                    tier,
                    startDate: new Date(),
                    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + (tier === 'Annual' ? 1 : 0))),  // 按年订阅时增加一年
                }
            });

            res.redirect(303, `/checkout/success?subscriptionId=${subscription.id}`);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        res.setHeader('Allow', 'GET');
        res.status(405).end('Method Not Allowed');
    }
}
