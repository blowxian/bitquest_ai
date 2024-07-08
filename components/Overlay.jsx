// components/Overlay.jsx
'use client';

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useSessionContext } from '@/app/context/sessionContext';
import { getDictionary } from '@/app/[lang]/dictionaries';
import {logEvent} from "@/lib/ga_log"; // Adjust the import path as needed

const Overlay = ({ onClose, lang = 'en' }) => {
    const { data: session } = useSessionContext();
    const userId = session?.user?.id;
    const [dict, setDict] = useState(null);

    useEffect(() => {
        // 异步加载字典数据
        const loadDict = async () => {
            const dictionary = await getDictionary(lang);
            setDict(dictionary);
        };

        loadDict();

        logEvent('pricing_show', 'commercial', 'pro popup', partString);
    }, [lang]); // 当语言变更时重新加载字典

    const handleMonthlySubscribe = () => {
        const url = userId ? `/checkout?userId=${userId}&plan=monthly` : '/checkout?plan=monthly';
        window.open(url, '_blank');
    };

    const handleYearlySubscribe = () => {
        const url = userId ? `/checkout?userId=${userId}&plan=yearly` : '/checkout?plan=yearly';
        window.open(url, '_blank');
    };

    if (!dict) return null; // 如果字典数据未加载，不渲染组件

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-lg w-full relative">
                <button className="absolute top-2 right-4 text-2xl text-gray-600" onClick={onClose}>
                    &times;
                </button>
                <h2 className="text-xl font-bold mb-4">{dict.overlay.title}</h2>
                <ul className="space-y-4">
                    {Object.entries(dict.overlay.models).map(([key, modelDetails]) => (
                        <li key={key}>
                            <strong>{modelDetails.name}</strong> {/* 显示模型名称 */}
                            <p>{modelDetails.description}</p> {/* 显示模型描述 */}
                        </li>
                    ))}
                </ul>

                <div className="flex justify-between mt-6">
                    <div>
                        <h3 className="font-bold">Monthly</h3>
                        <p>{dict.overlay.subscriptionInfo.monthly}</p>
                        <p className="text-red-500 font-bold text-lg">&nbsp;</p>
                        <button onClick={handleMonthlySubscribe}
                                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-lg py-2 px-4 rounded-full shadow-lg hover:shadow-xl hover:from-purple-500 hover:to-blue-500 transition-transform transform hover:scale-105 active:scale-95 mt-4">
                            {dict.overlay.subscribeMonthlyButton}
                        </button>
                    </div>
                    <div>
                        <h3 className="font-bold">Yearly</h3>
                        <p>{dict.overlay.subscriptionInfo.yearly}</p>
                        <p className="text-red-500 font-bold text-lg">{dict.overlay.subscriptionInfo.save}</p>
                        <button onClick={handleYearlySubscribe}
                                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-lg py-2 px-4 rounded-full shadow-lg hover:shadow-xl hover:from-purple-500 hover:to-blue-500 transition-transform transform hover:scale-105 active:scale-95 mt-4">
                            {dict.overlay.subscribeYearlyButton}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Overlay;
