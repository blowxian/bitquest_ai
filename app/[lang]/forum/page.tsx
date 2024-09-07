'use client'

import React from 'react';
import { useParams } from 'next/navigation';
import TopNavBar from "@/components/TopNavBar";
import { SessionProvider } from '@/app/context/sessionContext';

export default function ForumPage() {
    const params = useParams()!;
    const lang = params.lang as string;

    return (
        <SessionProvider>
            <div className="flex min-h-screen flex-col">
                <TopNavBar lang={lang} />
                <div className="flex-1 mx-auto sm:p-4 pt-20 sm:pt-24 text-customBlackText max-w-6xl">
                    <div className="container mx-auto px-4 py-8">
                        <h1 className="text-3xl font-bold mb-4">Forum</h1>
                        <p className="mb-4">Welcome to our forum page. Discussions are available in {lang}.</p>
                        <div className="space-y-4">
                            <div className="border p-4 rounded-lg">
                                <h2 className="text-xl font-semibold mb-2">General Discussion</h2>
                                <p>Join the conversation about AI and machine learning.</p>
                            </div>
                            <div className="border p-4 rounded-lg">
                                <h2 className="text-xl font-semibold mb-2">Technical Support</h2>
                                <p>Get help with technical issues and questions.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SessionProvider>
    );
}