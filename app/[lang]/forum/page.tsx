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
                <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16 sm:mt-20">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-800">Forum</h1>
                    <p className="mb-8 text-lg text-gray-600">Welcome to our forum page. Discussions are available in {lang}.</p>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow">
                            <h2 className="text-xl font-semibold mb-3 text-gray-800">General Discussion</h2>
                            <p className="text-gray-600">Join the conversation about AI and machine learning.</p>
                        </div>
                        <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow">
                            <h2 className="text-xl font-semibold mb-3 text-gray-800">Technical Support</h2>
                            <p className="text-gray-600">Get help with technical issues and questions.</p>
                        </div>
                        <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow">
                            <h2 className="text-xl font-semibold mb-3 text-gray-800">Feature Requests</h2>
                            <p className="text-gray-600">Share your ideas for new features and improvements.</p>
                        </div>
                    </div>
                </main>
            </div>
        </SessionProvider>
    );
}