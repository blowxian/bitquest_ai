'use client'

import React, { Suspense, useEffect, useState } from "react";
import { faBlog, faCommentDots, faComments, faLock, faShieldHalved, faSitemap } from "@fortawesome/free-solid-svg-icons";
import Header from '@/components/Header';
import SearchBar from "@/components/SearchBar";
import LinkButton from "@/components/LinkButton";
import UserMenu from '@/components/UserMenu';
import { Dictionary, getDictionary } from '@/app/[lang]/dictionaries';
import { SessionProvider } from '../context/sessionContext';
import VisitorTracker from '@/components/VisitorTracker';

async function fetchDictionary(lang: string) {
    return await getDictionary(lang);
}

export default function Page({ params }) {
    const [dict, setDict] = useState<Dictionary | null>(null);
    // const [sitemapPosts, setSitemapPosts] = useState<SitemapPost[]>([]);

    useEffect(() => {
        fetchDictionary(params.lang).then(setDict);
        // const fetchSitemapPosts = async () => {
        //     const posts = await getAllPosts();
        //     setSitemapPosts(posts);
        // };
        // fetchSitemapPosts();
    }, [params.lang]);

    return (
        <SessionProvider>
            <div className="flex justify-center w-full fixed top-0 left-0 z-10">
                <div className="w-3/4 p-4 flex justify-end">
                    <UserMenu lang={params.lang} />
                </div>
            </div>
            <main className="flex flex-col items-center justify-center min-h-screen w-full pt-24"> {/* 添加 pt-24 来防止内容被遮挡 */}
                <div className="w-full items-center justify-center flex flex-col sm:px-8">
                    <Header headerDict={dict?.header} />
                    <Suspense fallback={<div>Loading...</div>}>
                        <SearchBar searchDict={dict?.search} lang={params.lang} />
                    </Suspense>
                </div>
                <div className="text-center w-full mt-8">
                    <div className="flex flex-wrap justify-center space-x-2 space-y-2 text-sm">
                        <LinkButton href={`/${params.lang}/blog`} icon={faBlog} label={dict?.footer.blog} />
                        <LinkButton href={`/${params.lang}/forum`} icon={faComments} label={dict?.footer.forum} />
                        <LinkButton href={`/${params.lang}/feedback`} icon={faCommentDots} label={dict?.footer.feedback} />
                        <LinkButton href={`/${params.lang}/privacy-policy}`} icon={faLock} label="Privacy Policy" />
                        <LinkButton href={`/${params.lang}/disclaimer}`} icon={faShieldHalved} label="Disclaimer" />
                        <LinkButton href="/sitemap.xml" icon={faSitemap} label="Sitemap" />
                    </div>
                    <div className="mt-6 text-xs flex flex-wrap justify-center items-center space-x-2">
                        <a
                            href="https://woy.ai/"
                            title="Woy AI Tools Directory"
                            target="_blank"
                            rel="noopener"
                            className="text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            Woy AI
                        </a>
                        <span className="text-gray-400">|</span>
                        <a
                            href="https://dokeyai.com"
                            title="Dokey AI Tools Directory"
                            target="_blank"
                            rel="noopener"
                            className="text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            Dokey AI
                        </a>
                        <span className="text-gray-400">|</span>
                        <a
                            href="https://tap4.ai/"
                            title="Tap4 AI Tools Directory"
                            target="_blank"
                            rel="noopener"
                            className="text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            Tap4 AI
                        </a>
                    </div>
                </div>
            </main>
            <VisitorTracker />
        </SessionProvider>
    );
}
