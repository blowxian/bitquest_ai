// /components/SearchBar.tsx
'use client';

import {useSearchParams, useRouter} from 'next/navigation';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSearch, faChevronDown} from "@fortawesome/free-solid-svg-icons";
import React, {useEffect, useRef, useState} from "react";
import HotQuestionCard from './HotQuestionCard';
import {useSessionContext} from '@/app/context/sessionContext';
import models from '@/lib/models';
import Cookie from 'js-cookie';

export default function SearchBar({searchDict, lang}) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    const {data: session, status} = useSessionContext();
    const loading = status === "loading";
    const [isPro, setIsPro] = useState(false);

    useEffect(() => {
        if (!loading && session) {
            console.log('session@SearchBar: ', session);

            // 确保 session 数据存在且已加载
            if (status === 'authenticated' && session) {
                // @ts-ignore
                const proStatus = session.user?.subscriptions?.some(sub => new Date(sub.endDate) > new Date());
                setIsPro(proStatus || false);

                console.log("session:", session);
                console.log("isPro:", isPro);
            }
        }
    }, [session, loading]);

    useEffect(() => {
        const savedModel = Cookie.get('selectedModel');
        if (savedModel) {
            const modelSelectElement = document.querySelector('select');
            if (modelSelectElement) {
                modelSelectElement.value = savedModel;
            }
        }
    }, []);

    useEffect(() => {
        console.log("Updated isPro:", isPro);  // This logs the updated state after changes
    }, [isPro]); // Dependency array includes isPro

    const getAvailableModels = () => {
        // 如果是 Pro 用户，返回 free 和 pro 层级的模型
        if (isPro) {
            return Object.entries(models).filter(([key, value]) => value.tier === 'free' || value.tier === 'pro');
        }
        // 否则，只返回 free 层级的模型
        return Object.entries(models).filter(([key, value]) => value.tier === 'free');
    };


    function handleSearch(e: React.KeyboardEvent<HTMLInputElement> | null) {
        if (e && e.key === "Enter" || !e) {
            const term = inputRef.current?.value.trim();
            if (!term) {
                return;
            }

            // 存储选中的模型到 cookie
            const modelSelectElement = document.querySelector('select');
            const selectedModel = modelSelectElement?.value;
            if (selectedModel) {
                Cookie.set('selectedModel', selectedModel, { expires: 30 });
            }

            const params = new URLSearchParams(searchParams as URLSearchParams);
            params.set('q', term);
            router.push(`/${lang}/search?${params.toString()}`);
        }
    }

    const hotQuestions = [
        "enable scss in next.js14",
        "What's new in NextJS 14?",
        "Mistral 8x7B benchmarks"
    ];

    const onSearch = (searchTermsInput: string = '') => {
        if (searchTermsInput !== '') {
            // 更新 URL，这里将触发 useSearchParams 的变化
            router.push(`/search?q=${encodeURIComponent(searchTermsInput)}`);
        }
    };

    // 键盘事件处理函数
    const handleGlobalKeyDown = (event: KeyboardEvent) => {

        // 检查是否按下了 'K' 键，同时按下了 'Meta' 键（Mac）或 'Control' 键（Windows/Linux）
        if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
            event.preventDefault(); // 阻止默认行为

            const searchInput = inputRef.current;
            if (searchInput) {
                searchInput.focus(); // 聚焦到输入框
                searchInput.select(); // 全选输入框内容
            }
        }
    };

    useEffect(() => {
        // 添加事件监听器
        window.addEventListener('keydown', handleGlobalKeyDown);

        // 组件卸载时移除事件监听器
        return () => {
            window.removeEventListener('keydown', handleGlobalKeyDown);
        };
    }, []);

    return (
        <div className={"w-3/4 max-w-6xl"}>
            {/* 中间搜索框 */}
            <div className="flex-1 sm:mx-4 flex items-center relative w-full">
                <div className="relative flex items-center">
                    <select
                        className="bg-gray-700 text-white appearance-none rounded-l-full pl-10 pr-1.5 py-2 h-20 outline-none absolute top-[-2.5rem] left-0 w-[7.5rem] overflow-hidden">
                        {getAvailableModels().map(([key, model]) => (
                            <option key={key} value={key}>{model.identifier.split('/')[1]}</option>
                        ))}
                    </select>
                    <FontAwesomeIcon
                        icon={faChevronDown}
                        className="text-gray-400 absolute inset-y-0 pointer-events-none top-[-0.5rem] h-4 left-[1rem]"
                    />
                </div>

                <input
                    ref={inputRef}
                    type="search"
                    placeholder={searchDict?.placeholder}
                    className="bg-gray-700 text-white border border-gray-600 rounded-full sm:rounded-2xl py-8 pl-32 pr-28 w-full outline-none focus:ring-0"
                    onKeyUp={(e) => {
                        handleSearch(e);
                    }}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="hidden sm:block mr-4 text-sm text-gray-400">⌘ + K</span>
                    <button className="p-2 text-xl" onClick={() => handleSearch(null)}>
                        <FontAwesomeIcon icon={faSearch}
                                         className=" text-gray-400 hover:text-customWhite2 transition duration-150 ease-in-out"/>
                    </button>
                </div>
            </div>


            <div className="flex flex-wrap justify-center pt-2">
                {hotQuestions.map((question, index) => (
                    <HotQuestionCard
                        key={index}
                        searchTerm={question}
                        onSearch={onSearch}
                    />
                ))}
            </div>
        </div>
    )
}