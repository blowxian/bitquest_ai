'use client'

import React from 'react';
import { useParams } from 'next/navigation';
import TopNavBar from "@/components/TopNavBar";
import { SessionProvider } from '@/app/context/sessionContext';

export default function PrivacyPolicyPage() {
    const params = useParams()!;
    const lang = params.lang as string;

    return (
        <SessionProvider>
            <div className="flex min-h-screen flex-col">
                <TopNavBar lang={lang} />
                <div className="flex-1 mx-auto sm:p-4 pt-20 sm:pt-24 text-customBlackText max-w-6xl">
                    <div className="container mx-auto px-4 py-8">
                        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
                        <p className="mb-4">Our privacy policy is available in {lang}. We are committed to protecting your privacy.</p>
                        <div className="space-y-4">
                            <section>
                                <h2 className="text-xl font-semibold mb-2">Data Collection</h2>
                                <p>We collect minimal data necessary to provide our services.</p>
                            </section>
                            <section>
                                <h2 className="text-xl font-semibold mb-2">Data Usage</h2>
                                <p>Your data is used solely for improving our services and user experience.</p>
                            </section>
                            <section>
                                <h2 className="text-xl font-semibold mb-2">Data Protection</h2>
                                <p>We implement robust security measures to protect your personal information.</p>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </SessionProvider>
    );
}