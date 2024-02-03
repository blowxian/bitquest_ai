import type {Metadata} from 'next'
import Script from "next/script";
import './globals.css'
import {Pathway_Extreme} from 'next/font/google'

const pathway_extreme = Pathway_Extreme({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-pathway-extreme',
})


export const metadata: Metadata = {
    title: 'Coogle.ai, Make AI Search Affordable For Everyone,Everywhere',
    description: 'Coogle.ai is the leading platform for affordable AI search solutions, its affordable  and easy to use compared with perplexity alternative',
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
        <body className={pathway_extreme.className}>{children}</body>
        </html>
    )
}
