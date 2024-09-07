'use client'

import React from 'react';
import { useParams } from 'next/navigation';
import TopNavBar from "@/components/TopNavBar";
import { SessionProvider } from '@/app/context/sessionContext';

export default function BlogPage() {
    const params = useParams()!;
    const lang = params.lang as string;

    return (
        <SessionProvider>
            <div className="flex min-h-screen flex-col">
                <TopNavBar lang={lang} />
                <div className="flex-1 mx-auto sm:p-4 pt-20 sm:pt-24 text-customBlackText max-w-6xl">
                    <div className="container mx-auto px-4 py-8">
                        <h1 className="text-3xl font-bold mb-4">Blog</h1>
                        <p className="mb-4">Welcome to our blog page. Content is available in {lang}.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="border p-4 rounded-lg">
                                <h2 className="text-xl font-semibold mb-2">Latest AI Developments</h2>
                                <p>Explore the cutting-edge advancements in artificial intelligence.</p>
                            </div>
                            <div className="border p-4 rounded-lg">
                                <h2 className="text-xl font-semibold mb-2">Machine Learning Trends</h2>
                                <p>Discover the latest trends shaping the field of machine learning.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SessionProvider>
    );
}