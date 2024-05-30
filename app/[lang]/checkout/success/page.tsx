// /app/[lang]/checkout/success/page.tsx
'use client'

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import { Dictionary, getDictionary } from '@/app/[lang]/dictionaries';

interface SuccessPageProps {
    params: {
        lang: string;
    };
}

const fetchDictionary = async (lang: string) => {
    return await getDictionary(lang);
}

const SuccessPage: React.FC<SuccessPageProps> = ({ params }) => {
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
            <Header headerDict={dict?.header} />
            <div className="text-center">
                <h1>Payment Successful</h1>
                <p>Thank you for your payment!</p>
            </div>
        </main>
    );
};

export default SuccessPage;