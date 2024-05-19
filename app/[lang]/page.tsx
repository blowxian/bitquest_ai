'use client'

import Header from '@/components/Header'
import SearchBar from "@/components/SearchBar";
import React, {Suspense, useEffect, useState} from "react";
import {faBlog, faCommentDots, faComments} from "@fortawesome/free-solid-svg-icons";
import LinkButton from "@/components/LinkButton";
import {SessionProvider} from "next-auth/react";
import UserMenu from "@/components/UserMenu";
import {Dictionary, getDictionary} from "@/app/[lang]/dictionaries";

async function fetchDictionary(lang:string) {
    return await getDictionary(lang);
}

export default function Page({params}: { params: { lang: string } }) {
    // State to store the resolved value of the dictionary
    const [dict, setDict] = useState<Dictionary | null>(null);


    // Fetch the dictionary when the component mounts or when params.lang changes
    useEffect(() => {
        fetchDictionary(params.lang)
            .then((result) => {
                setDict(result);
            });
    }, [params.lang]);

    return (
        <main className="flex min-h-screen flex-col items-center justify-between">
            <div className="flex justify-center w-full fixed top-0 left-0">
                <div className="w-3/4 p-4 flex justify-end">
                    <SessionProvider>
                        <UserMenu/>
                    </SessionProvider>
                </div>
            </div>
            <div className="w-full items-center justify-between flex flex-col sm:px-8">
                <Header headerDict={dict?.header}/>
                <Suspense>
                    <SearchBar searchDict={dict?.search}/>
                </Suspense>
            </div>
            <div className="mb-32 text-center w-full sm:mb-2">
                <div className="flex justify-center space-x-4 text-sm">
                    <LinkButton href="/blog" icon={faBlog} label={dict?.footer.blog}/>
                    <LinkButton href="/blog/forums/" icon={faComments} label={dict?.footer.forum}/>
                    <LinkButton href="/blog/forums/topic/hi-everyone-%ef%bc%8cwe-want-your-advice/"
                                icon={faCommentDots} label={dict?.footer.feedback}/>
                </div>
            </div>
        </main>
    )
}
