import type {Metadata} from 'next'
import {Inter} from 'next/font/google'
import Script from "next/script";
import './globals.css'

const inter = Inter({subsets: ['latin']})

export const metadata: Metadata = {
    title: 'Coogle.ai, The Final Search Engine for Programmers, Powered by AI.',
    description: 'Coogle.ai–The Final Search Engine for Programming Queries. Powered by cutting-edge AI like GPT4, Gemini,Claude2 and Mistral AI, this is not just a search engine, but a complete AI solution for programmers. ',
    /*'google-site-verification': 'XlVgQsgr-59VgeJdUJ6u_DkzHTdT144bB7PJGWIMhDM',*/
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    // 假设 NEXT_PUBLIC_GA_ID 是逗号分隔的字符串
    const gaIds = process.env.NEXT_PUBLIC_GA_IDS?.split(',') || [];

    // 组装 Google Analytics 配置脚本
    const gaConfigScript = gaIds.map(id =>
        `gtag('config', '${id}', { page_path: window.location.pathname });`
    ).join('');

    return (
        <html lang="en">
        <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaIds[0]}`}
            strategy="afterInteractive"
        />
        <Script
            id="gtag-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
                __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            ${gaConfigScript}
          `,
            }}
        />
        <body className={inter.className}>{children}</body>
        </html>
    )
}
