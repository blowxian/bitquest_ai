// /app/[lang]/search/page.tsx
'use client';

import React, {useState, useEffect, useRef} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faClipboardQuestion} from "@fortawesome/free-solid-svg-icons";
import Markdown from "@/lib/mark-down";
import ReferenceCard from "@/components/ReferenceCard";
import DerivedQuestionCard from "@/components/DerivedQuestionCard";
import {useSearchParams, useRouter} from 'next/navigation';
import {SearchResponse} from "@/pages/api/types";
import TopNavBar from "@/components/TopNavBar";
import {getDictionary, Dictionary} from "@/app/[lang]/dictionaries";
import {SessionProvider} from '@/app/context/sessionContext';  // Adjust the import path as needed
import Overlay from '@/components/Overlay';
import {logEvent} from '@/lib/ga_log';
import {notifyFeishu} from '@/lib/notify';

async function fetchDictionary(lang: string) {
    return await getDictionary(lang);
}

async function notfiyFeishu(message: string) {
    await notifyFeishu(message);
}

export default function Page({params}: { params: { lang: string } }) {
    // State to store the resolved value of the dictionary
    const [dict, setDict] = useState<Dictionary | null>(null);


    // Fetch the dictionary when the component mounts or when params.lang changes
    useEffect(() => {
        fetchDictionary(params.lang)
            .then((result) => {
                setDict(result);
            });
    }, [params.lang]);

    const [data, setData] = useState('');
    const [query, setQuery] = useState<SearchResponse>({
        items: [],
        nextPageToken: null
    });
    const searchParams = useSearchParams();
    const [searchTerms, setSearchTerms] = useState('');
    const router = useRouter();

    const searchResults = [
        {
            title: '',
            content: '',
        }];

    const [referenceData, setReferenceData] = useState([])
    // const referenceData = query.items;

    const [derivedQuestions, setDerivedQuestions] = useState<string[]>(['', '', '', '']);

    // 创建一个 ref 来引用输入框
    const searchInputRef = useRef<HTMLInputElement>(null);

    // 键盘事件处理函数
    const handleGlobalKeyDown = (event: KeyboardEvent) => {

        // 检查是否按下了 'K' 键，同时按下了 'Meta' 键（Mac）或 'Control' 键（Windows/Linux）
        if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
            event.preventDefault(); // 阻止默认行为

            const searchInput = searchInputRef.current;
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

    const constructSummarizePrompt = (searchResults, dictTexts) => {
        // 格式化搜索结果
        const formattedResults = searchResults.map((result, index) =>
            `${dictTexts.searchResultPrefix.replace('${index}', index + 1).replace('${snippet}', result.snippet)}`
        ).join('\n\n');

        // 构建完整的提示
        const systemPrompt = `${dictTexts.searchPrompt.replace('${context}', formattedResults)}`;

        return systemPrompt;
    };

    const fetchAndSummarizeData = (googleSearchRes: SearchResponse) => {
        const searchResults = query.items;  // 假设 query.items 包含从服务器加载的搜索结果

        // 使用上面的函数构建完整的提示
        const system_prompt = constructSummarizePrompt(searchResults, dict?.search);
        notfiyFeishu(`
                ****** 搜索内容 ******
                ${searchTerms}
        `);


        const eventSource = new EventSource(`/api/update?system_prompt=` + encodeURIComponent(system_prompt) + `&query=` + encodeURIComponent(searchTerms));

        let partString = '';

        eventSource.onmessage = (event) => {
            if (event.data !== '[DONE]') {
                partString += JSON.parse(event.data).choices[0].text;
                setData(partString);
            } else {
                setData(partString);
                logEvent('search', 'ai summarization', 'summarization finish', partString);
                notfiyFeishu(`
                ****** 搜索提示词 ******
                ${system_prompt}
                
                ****** 搜索总结 ******
                ${partString}
                `);
                eventSource.close();
            }
        };

        eventSource.onerror = (error) => {
            console.error('fetchAndSummarizeData EventSource failed:', error);
            logEvent('search', 'ai summarization', 'summarization error', partString);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    };

    const extractArrayFromString = (str: string) => {
        const regex = /'[^']+'/g;
        const matches = str.match(regex);
        return matches ? matches.map(match => match.replace(/'/g, "")) : [];
    }

    const constructSuggestionPrompt = (searchTerms, dictTexts) => {
        // Using the localized prompt template and replace placeholders with actual search terms
        const prompt = dictTexts.userSuggestionPrompt.replace('${searchTerms}', searchTerms);

        return prompt;
    };

    const fetchAndDisplayUserSuggestion = () => {
        // 使用上面的函数构建完整的提示
        const system_prompt = constructSuggestionPrompt(searchTerms, dict?.search);

        const eventSource = new EventSource(`/api/update?max_token=128&system_prompt=` + encodeURIComponent(system_prompt) + `&query=` + encodeURIComponent(searchTerms));

        let partString = '';

        eventSource.onmessage = (event) => {
            if (event.data !== '[DONE]') {
                const jsonData = JSON.parse(event.data).choices[0];
                partString += jsonData.text;
                if (jsonData.finish_reason === 'stop' || jsonData.finish_reason === 'eos') {
                    const extractedArray = extractArrayFromString(partString);
                    console.log("User Suggestion Array: ", extractedArray);
                    setDerivedQuestions(extractedArray);
                    setIsLoading(false);
                    logEvent('search', 'ai suggestion', 'suggestion finish with stop or eos', extractedArray.join(','));
                    eventSource.close();
                }
            } else {
                logEvent('search', 'ai suggestion', 'suggestion finish with [DONE]', partString);
                eventSource.close();
            }
        }

        eventSource.onerror = (error) => {
            console.error('fetchAndDisplayUserSuggestion EventSource failed:', error);
            logEvent('search', 'ai suggestion', 'suggestion error', '');
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }

    const [showOverlay, setShowOverlay] = useState(false);

    const handleSearch = (searchTermsInput: string = '') => {
        // 更新 URL，这里将触发 useSearchParams 的变化
        router.push(`/${params.lang}/search?q=${encodeURIComponent(searchTermsInput === '' ? searchTerms : searchTermsInput)}`);
        if (searchInputRef.current) {
            searchInputRef.current.blur();
        }
    };

    useEffect(() => {
        if (query.items?.length === 0) {
            return;
        }
        fetchAndSummarizeData(query);
    }, [query]);

    const [isLoading, setIsLoading] = useState(true);

    // make sure only on Google query is running at a time
    const searchServiceFinished = useRef(false)

    useEffect(() => {
        const keywords = searchParams?.get('q');
        setSearchTerms(keywords ? keywords : '');
        setData('');
        setReferenceData([]);
        setDerivedQuestions(['', '', '', ''])
        setIsLoading(true);

        if (keywords && dict && !searchServiceFinished.current) {
            document.title = `${keywords} | phind ai alternative`;
            searchServiceFinished.current = true;

            logEvent('search', 'ai search', 'search start', keywords);

            fetch('/api/search_service', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({keywords}),
            })
                .then((response) => response.json())
                .then((data) => {
                    setQuery(data);
                    setReferenceData(data.items);
                    searchServiceFinished.current = false;
                });

            fetchAndDisplayUserSuggestion();
        }
    }, [searchParams, dict]);

    function DerivedQuestionCardSkeleton() {
        return (
            <div className="bg-customWhite shadow rounded-lg p-3 m-2 w-full sm:w-64">
                <div className="rounded bg-slate-300 h-4 w-3/4 mb-2"></div>
                <div className="rounded bg-slate-300 h-4 w-1/2"></div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen">

            {/* 使用 TopNavBar 组件 */}
            <SessionProvider>
                <TopNavBar
                    searchTerms={searchTerms}
                    setSearchTerms={setSearchTerms}
                    onSearch={() => handleSearch(searchTerms)}
                    searchInputRef={searchInputRef}
                    lang={params.lang?.toLowerCase() || 'en'}
                />
            </SessionProvider>

            {/*主内容区*/}
            <div className="flex-1 mx-auto sm:p-4 pt-20 sm:pt-24 text-customBlackText max-w-6xl">
                {/* 迭代搜索结果 */}
                {searchResults.map((result, index) => (
                    <div key={index}
                         className="px-8 py-5 sm:px-6 overflow-hidden sm:rounded-lg bg-customWhite2 shadow mt-4">
                        <h2 className="text-lg font-medium text-gray-800 mb-4"><FontAwesomeIcon
                            className="text-customOrange mr-2"
                            icon={faClipboardQuestion}/> {searchParams?.get('q')}</h2>

                        {/* Markdown 渲染 */}
                        <div className="prose mt-2 max-w-none pb-4">
                            <Markdown content={data} referenceData={referenceData}/>
                        </div>

                        <h4 className='text-sm'>{dict?.search.refInfo}</h4>
                        <div
                            className="flex flex-wrap justify-center overflow-x-auto pt-2 pb-2">
                            {(referenceData?.length > 0 ? referenceData : [null, null, null, null, null]).map((data, index) => (
                                <ReferenceCard key={index} data={data}/>
                            ))}
                        </div>

                        <h4 className='text-sm'>{dict?.search.moreQs}</h4>
                        <div className="flex flex-wrap justify-center pt-2">
                            {isLoading ? (
                                // 渲染一定数量的骨架图组件
                                [...Array(4)].map((_, index) => <DerivedQuestionCardSkeleton key={index}/>)
                            ) : (
                                // 渲染实际数据组件
                                derivedQuestions.map((question, index) => (
                                    <DerivedQuestionCard key={index} question={question} onSearch={handleSearch}/>
                                ))
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {showOverlay && <Overlay onClose={() => setShowOverlay(false)} lang={params.lang?.toLowerCase() || 'en'}/>}
        </div>
    )
}