'use client';

import {useSearchParams, useRouter} from 'next/navigation';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSearch} from "@fortawesome/free-solid-svg-icons";
import React, {useEffect, useRef} from "react";
import HotQuestionCard from './HotQuestionCard';

export default function SearchBar({searchDict}) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    function handleSearch(e: React.KeyboardEvent<HTMLInputElement> | null) {
        if (e && e.key === "Enter" || !e) {
            const term = inputRef.current?.value.trim(); // 使用trim()去除首尾空格

            // 如果term为空，则直接返回
            if (!term) {
                return;
            }

            const params = new URLSearchParams(searchParams as URLSearchParams);

            params.set('q', term);
            router.push(`/search?${params.toString()}`);
        }
    }

    const hotQuestions = [
        "enable scss in next.js14",
        "What's new in NextJS 14?",
        "Mistral 8x7B benchmarks"
    ];

    const onSearch = (searchTermsInput: string = '') => {
        if(searchTermsInput !== ''){
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
                <input
                    ref={inputRef}
                    type="search"
                    placeholder={searchDict?.placeholder}
                    className="bg-gray-700 text-white border border-gray-600 rounded-full sm:rounded-2xl py-8 pl-6 pr-28 w-full outline-none focus:ring-0 focus:border-gray-300"
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