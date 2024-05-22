// /app/[lang]/checkout/success/page.tsx
'use client'

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation'; // 引入 useSearchParams
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
    const searchParams = useSearchParams(); // 使用 useSearchParams 获取查询参数
    const sessionId = searchParams?.get('session_id'); // 通过 searchParams.get 获取 session_id

    useEffect(() => {
        fetchDictionary(params.lang).then(setDict);

        if (sessionId) {
            // 调用 API 来校验 session_id
            fetch(`/api/verify-payment?session_id=${sessionId}`)
                .then(res => res.json())
                .then(data => {
                    // 根据返回的验证结果进行处理
                    console.log(data); // 或者设置状态显示在页面上
                })
                .catch(error => {
                    console.error("Failed to verify payment:", error);
                });
        }
    }, [params.lang, sessionId]);

    return (
        <main className="flex flex-col items-center justify-center min-h-screen">
            <Header headerDict={dict?.header} />
            <div className="text-center">
                <h1>Payment Successful</h1>
                <p>Thank you for your payment!</p>
            </div>
        </main>
    );
};

export default SuccessPage;
