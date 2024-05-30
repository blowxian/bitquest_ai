// /app/[lang]/checkout/success/page.tsx
'use client'

import React, {useEffect, useState} from 'react';
import {useSearchParams} from 'next/navigation';
import Header from '@/components/Header';
import {Dictionary, getDictionary} from '@/app/[lang]/dictionaries';

interface SuccessPageProps {
    params: {
        lang: string;
    };
}

const fetchDictionary = async (lang: string) => {
    return await getDictionary(lang);
}

const SuccessPage: React.FC<SuccessPageProps> = ({params}) => {
    const [dict, setDict] = useState<Dictionary | null>(null);
    const searchParams = useSearchParams();
    const sessionId = searchParams?.get('session_id');

    useEffect(() => {
        fetchDictionary(params.lang).then(setDict);

        if (sessionId) {
            fetch(`/api/verify-payment?session_id=${sessionId}`)
                .then(res => res.json())
                .then(data => {
                    console.log(data);
                })
                .catch(error => {
                    console.error("Failed to verify payment:", error);
                });
        }
    }, [params.lang, sessionId]);

    return (
        <main className="flex flex-col items-center justify-center min-h-screen w-full">
            <div className="max-w-md w-full space-y-8">
                <Header headerDict={dict?.header}/>
                <div className="text-center">
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Payment Successful</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Thank you for your payment. Your transaction has been successfully processed.
                    </p>
                </div>
                <div className="mt-8 space-y-6">
                    <p className="text-center text-sm text-gray-600">
                        To begin your journey with Coogle, please join our Discord community by clicking the link
                        below.
                    </p>
                    <div className="flex justify-center">
                        <a href="https://discord.gg/GNv3qbm6" target="_blank"
                           className="group relative w-64 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Join Our Discord
                        </a>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default SuccessPage;