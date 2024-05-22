// 假设这个页面同样位于 /app/[lang]/checkout/canceled
'use client'

import React from 'react';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation'; // 保持路由器的导入风格一致，即使在这个页面中可能不直接使用

interface CanceledPageProps {
    params: {
        lang: string;
    };
}

const CanceledPage: React.FC<CanceledPageProps> = ({ params }) => {
    const router = useRouter(); // 如果需要在未来使用 router，现在已经设置好

    return (
        <main className="flex flex-col items-center justify-center min-h-screen">
            <Header headerDict={{ title: "Payment Canceled" }} />
            <div className="text-center">
                <h1>Payment Canceled</h1>
                <p>You have canceled the payment process.</p>
            </div>
        </main>
    );
};

export default CanceledPage;
