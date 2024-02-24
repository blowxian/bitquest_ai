import NextAuth from "next-auth"
import TwitterProviders from "next-auth/providers/twitter"
import GoogleProviders from "next-auth/providers/google"

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
})
