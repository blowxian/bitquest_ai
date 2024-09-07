'use client'

import React from 'react';
import { useParams } from 'next/navigation';
import TopNavBar from "@/components/TopNavBar";
import { SessionProvider } from '@/app/context/sessionContext';

export default function FeedbackPage() {
    const params = useParams()!;
    const lang = params.lang as string;

    return (
        <SessionProvider>
            <div className="flex min-h-screen flex-col">
                <TopNavBar lang={lang} />
                <div className="flex-1 mx-auto sm:p-4 pt-20 sm:pt-24 text-customBlackText max-w-6xl">
                    <div className="container mx-auto px-4 py-8">
                        <h1 className="text-3xl font-bold mb-4">Feedback</h1>
                        <p className="mb-4">We value your feedback. Please share your thoughts with us in {lang}.</p>
                        <form className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block mb-1">Name</label>
                                <input type="text" id="name" className="w-full border rounded p-2" />
                            </div>
                            <div>
                                <label htmlFor="email" className="block mb-1">Email</label>
                                <input type="email" id="email" className="w-full border rounded p-2" />
                            </div>
                            <div>
                                <label htmlFor="message" className="block mb-1">Message</label>
                                <textarea id="message" rows={4} className="w-full border rounded p-2"></textarea>
                            </div>
                            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Submit</button>
                        </form>
                    </div>
                </div>
            </div>
        </SessionProvider>
    );
}