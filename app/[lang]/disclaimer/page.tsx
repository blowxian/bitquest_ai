'use client'

import React from 'react';
import { useParams } from 'next/navigation';
import TopNavBar from "@/components/TopNavBar";
import { SessionProvider } from '@/app/context/sessionContext';

export default function DisclaimerPage() {
    const params = useParams()!;
    const lang = params.lang as string;

    return (
        <SessionProvider>
            <div className="flex min-h-screen flex-col">
                <TopNavBar lang={lang} />
                <div className="flex-1 mx-auto sm:p-4 pt-20 sm:pt-24 text-customBlackText max-w-6xl">
                    <div className="container mx-auto px-4 py-8">
                        <h1 className="text-3xl font-bold mb-4">Disclaimer</h1>
                        <p className="mb-4">Please read our disclaimer in {lang}. This information is important for using our services.</p>
                        <div className="space-y-4">
                            <section>
                                <h2 className="text-xl font-semibold mb-2">Use of Service</h2>
                                <p>Our AI services are provided &quot;as is&quot; without any guarantees or warranties.</p>
                            </section>
                            <section>
                                <h2 className="text-xl font-semibold mb-2">Limitation of Liability</h2>
                                <p>We are not liable for any damages or losses resulting from the use of our services.</p>
                            </section>
                            <section>
                                <h2 className="text-xl font-semibold mb-2">Content Accuracy</h2>
                                <p>While we strive for accuracy, we cannot guarantee the completeness or accuracy of AI-generated content.</p>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </SessionProvider>
    );
}