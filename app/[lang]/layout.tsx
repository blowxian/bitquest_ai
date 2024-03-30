import type {Metadata} from 'next'
import Script from "next/script";
import './globals.css'
import {Pathway_Extreme} from 'next/font/google'
import {config} from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css'; // Import the CSS
config.autoAddCss = false; // Tell Font Awesome to skip adding the CSS automatically

const pathway_extreme = Pathway_Extreme({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-pathway-extreme',
})


export const metadata: Metadata = {
    title: 'Phind AI cheap alternative',
    description: 'phind alternative, ai search engine affordable for everyone',
    keywords: ['ai search', 'phind ai','phind alternative', 'cheapest ai search', 'perplexity alternative', 'phind', 'ai', 'search', 'engine', 'cheap', 'affordable', 'everyone'],
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
