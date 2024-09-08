import { Metadata } from 'next'
import { getDictionary } from "@/app/[lang]/dictionaries";

export const generateMetadata = async ({ params }: { params: { lang: string } }): Promise<Metadata> => {
    const dict = await getDictionary(params.lang)
    return {
        title: `${dict.header.slogan} | Blog`,
        description: "Explore affordable AI search solutions and insights. Our expert-written blog covers the latest in AI technology, applications, and industry trends.",
    }
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}