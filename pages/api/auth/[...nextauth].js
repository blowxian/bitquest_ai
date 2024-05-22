// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth"
import TwitterProviders from "next-auth/providers/twitter"
import GoogleProviders from "next-auth/providers/google"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default NextAuth({
    providers: [
        TwitterProviders({
            clientId: process.env.TWITTER_CLIENT_ID,
            clientSecret: process.env.TWITTER_CLIENT_SECRET,
            version: "2.0", // opt-in to Twitter OAuth 2.0
        }),
        GoogleProviders({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        // 可以添加更多的社交媒体登录提供者
    ],
    // 配置数据库来存储会话、用户等信息
    // database: process.env.DATABASE_URL,
    // 可以添加更多配置项
    callbacks: {
        async signIn({ user, account, profile }) {
            // Check if the user exists in your database
            let dbUser = await prisma.user.findUnique({
                where: { providerAccountId: account.providerAccountId },
                include: { subscriptions: true } // 确保同时获取订阅信息
            });

            if (!dbUser) {
                // If user doesn't exist, create a new record
                dbUser = await prisma.user.create({
                    data: {
                        email: user.email?? null,
                        name: user.name,
                        authProvider: account.provider.toUpperCase(), // GOOGLE or TWITTER
                        providerAccountId: account.providerAccountId,
                    },
                });
            }

            // Ensure the user object includes the database ID
            user.id = dbUser.id; // 添加这行代码来确保 user 对象包含数据库中的 user.id

            return true; // Return true to complete the sign-in
        },
        async jwt ({ token, user }) {
            // 在用户登录时添加 ID
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            // 检查 token 中是否存在 id
            if (token.id) {
                const dbUser = await prisma.user.findUnique({
                    where: { id: token.id },
                    include: { subscriptions: true }
                });

                // 如果数据库中找到了用户，更新 session
                if (dbUser) {
                    session.user.id = dbUser.id;  // 确保用户的 ID 被加入到 session 中
                    session.user.subscriptions = dbUser.subscriptions;  // 添加订阅信息
                }
            }

            return session;
        },
    },
})
