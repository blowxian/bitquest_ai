// pages/api/verify-payment.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const prisma = require('@prisma/client').PrismaClient;

const prismaClient = new prisma();

export default async function handler(req, res) {
    const { session_id } = req.query;

    try {
        const session = await stripe.checkout.sessions.retrieve(session_id);
        if (session.payment_status === 'paid') {
            // 从 session metadata 获取 userId，并确保它是整数
            const userId = parseInt(session.metadata.userId);

            // 验证 userId 是否有效，即它是一个正整数
            if (isNaN(userId)) {
                return res.status(400).json({ success: false, message: 'Invalid user ID.' });
            }

            // 检查用户是否已有订阅
            const existingSubscription = await prismaClient.subscription.findFirst({
                where: { userId: userId }
            });

            if (!existingSubscription) {
                // 创建新的订阅记录
                await prismaClient.subscription.create({
                    data: {
                        userId: userId,
                        status: 'active',
                        tier: 'Standard', // 假设订阅级别为 "Standard"
                        startDate: new Date(),
                        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 订阅期限为一个月
                    }
                });
            }

            res.status(200).json({ success: true, session });
        } else {
            res.status(400).json({ success: false, message: 'Payment not completed' });
        }
    } catch (error) {
        console.error('Error handling payment verification:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}

