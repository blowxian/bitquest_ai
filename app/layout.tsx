import type {Metadata} from 'next'
import './globals.css'
import {Pathway_Extreme} from 'next/font/google'

const pathway_extreme = Pathway_Extreme({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-pathway-extreme',
})


export const metadata: Metadata = {
    title: 'Coogle.ai, The Final Search Engine for Programmers, Powered by AI.',
    description: 'Coogle.ai–The Final Search Engine for Programming Queries. Powered by cutting-edge AI like GPT4, Gemini,Claude2 and Mistral AI, this is not just a search engine, but a complete AI solution for programmers. ',
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
        <body className={pathway_extreme.className}>
        {children}
        </body>
        </html>
    )
}
