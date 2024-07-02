'use client'

import React, {useEffect, useState} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import axios from 'axios';
import Header from "@/components/Header";

const PublishPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const recordId = searchParams ? searchParams.get('recordId') : null; // 确保 searchParams 不是 null
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDataAndCreateRecord = async () => {
        try {
            if (!recordId) {
                setError('No recordId provided');
                setLoading(false);
                return;
            }
            // 获取记录
            const params = new URLSearchParams({
                appToken: "PWCWbe2x2aMfQts2fNpcmOWOnVh",
                tableId: "tbl5OB8eWTBgwrDc",
                recordId: recordId
            }).toString();

            const recordResponse = await axios.get(`/api/record?${params}`);

            const recordData = recordResponse.data;
            console.log(recordData);

            // 调用项目中的 report API 创建数据库记录
            const reportResponse = await fetch('/api/report', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    userId: null, // 或者填写用户ID
                    title: recordData.data.record.fields.搜索内容,
                    content: recordData.data.record.fields.搜索结构数据
                }),
            });
            const reportData = await reportResponse.json();

            console.log('Report created:', reportData);

            if (reportResponse.status === 200) {
                const res = await fetch('/api/indexing/google', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url: process.env.NEXT_PUBLIC_BASE_URL + "/en" + reportData.url, type: "URL_UPDATED"}),
                });

                console.log('google indexing res: ', res);

                // 成功后跳转至发布后的页面
                router.push(reportData.url);
            } else {
                throw new Error('创建记录失败');
            }
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDataAndCreateRecord();
    }, []); // 空数组表示 useEffect 仅在组件挂载时执行一次

    return (
        <main className="flex flex-col items-center justify-center min-h-screen w-full">
            <div className="max-w-md w-full space-y-8">
                <Header headerDict={{ "slogan": "Make AI Search Affordable For Everyone,Everywhere" }} />
                <div className="text-center">
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        {loading ? 'Loading...' : error ? 'Error: ' + error : 'Success'}
                    </h2>
                </div>
            </div>
        </main>
    );
};

export default PublishPage;