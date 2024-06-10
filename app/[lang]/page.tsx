// /app/[lang]/page.tsx
'use client'

import React, {Suspense, useEffect, useState} from "react";
import {faBlog, faCommentDots, faComments, faLock, faShieldHalved} from "@fortawesome/free-solid-svg-icons";
import Header from '@/components/Header';
import SearchBar from "@/components/SearchBar";
import LinkButton from "@/components/LinkButton";
import UserMenu from "@/components/UserMenu";
import {Dictionary, getDictionary} from '@/app/[lang]/dictionaries';
import {SessionProvider} from '../context/sessionContext';  // Adjust the import path as needed

async function fetchDictionary(lang: string) {
    return await getDictionary(lang);
}

export default function Page({params}) {
    const [dict, setDict] = useState<Dictionary | null>(null);

    useEffect(() => {
        fetchDictionary(params.lang).then(setDict);
    }, [params.lang]);

    return (
        <SessionProvider>
            <div className="flex justify-center w-full fixed top-0 left-0 z-10">
                <div className="w-3/4 p-4 flex justify-end">
                    <UserMenu lang={params.lang}/>
                </div>
            </div>
            <main className="flex flex-col items-center justify-center min-h-screen w-full pt-24"> {/* 添加 pt-24 来防止内容被遮挡 */}
                <div className="w-full items-center justify-center flex flex-col sm:px-8">
                    <Header headerDict={dict?.header}/>
                    <Suspense fallback={<div>Loading...</div>}>
                        <SearchBar searchDict={dict?.search} lang={params.lang}/>
                    </Suspense>
                </div>
                <div className="text-center w-full mt-8">
                    <div className="flex justify-center space-x-4 text-sm">
                        <LinkButton href="/blog/blog/blogs-and-articles/" icon={faBlog} label={dict?.footer.blog}/>
                        <LinkButton href="/blog/forums/" icon={faComments} label={dict?.footer.forum}/>
                        <LinkButton href="/blog/forums/topic/hi-everyone-%ef%bc%8cwe-want-your-advice/"
                                    icon={faCommentDots} label={dict?.footer.feedback}/>
                        <LinkButton href="/blog/private-policy/"
                                    icon={faLock} label="Private Policy"/>
                        <LinkButton href="/blog/disclaimer-for-phind-ai-com/"
                                    icon={faShieldHalved} label="Disclaimer"/>
                    </div>
                </div>
            </main>
        </SessionProvider>
    );
}
