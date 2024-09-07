'use client'

// Import statements
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboardQuestion } from "@fortawesome/free-solid-svg-icons";
import Markdown from "@/lib/mark-down";
import ReferenceCard from "@/components/ReferenceCard";
import DerivedQuestionCard from "@/components/DerivedQuestionCard";
import { useSearchParams } from 'next/navigation';
import { SearchResponse } from "@/pages/api/types";
import TopNavBar from "@/components/TopNavBar";
import { Dictionary, getDictionary } from "@/app/[lang]/dictionaries";
import { SessionProvider } from '@/app/context/sessionContext';
import Overlay from '@/components/Overlay';
import { logEvent } from '@/lib/ga_log';
import { notifyFeishu } from '@/lib/feishu';
import { env } from 'next-runtime-env';
import axios from "axios";
import Cookies from 'js-cookie';

async function getIPLocation(ip: any) {
    try {
        const response = await axios.get(`https://ipapi.co/${ip}/json/`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch IP location:', error);
        return null;
    }
}
const publishReportAndGoogleIndex = async (title, data, referenceData, derivedQuestions) => {
    try {
        const reportResponse = await fetch('/api/report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: null, // 或者填写用户ID
                title: title,
                content: JSON.stringify({
                    data: data,
                    referenceData: referenceData,
                    derivedQuestions: derivedQuestions
                })
            }),
        });

        if (!reportResponse.ok) {
            console.error('Report API request failed:', reportResponse.statusText);
        } else {
            const responseData = await reportResponse.json();

            const res = await fetch('/api/indexing/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: env('NEXT_PUBLIC_BASE_URL') + "/en" + responseData.url,
                    type: "URL_UPDATED"
                }),
            });

            // 获取用户IP地址和东八区时间
            const ipResponse = await axios.get('https://api.ipify.org?format=json');
            const ip = ipResponse.data.ip;

            const date = new Date();
            const options = { timeZone: 'Asia/Shanghai', hour12: false };
            const formattedDate = date.toLocaleString('zh-CN', options);

            // 获取用户IP所在位置（假设有getIPLocation函数）
            const location = await getIPLocation(ip);

            // 使用 js-cookie 获取 user_info 并解析
            let userInfo = { name: 'Unknown', email: 'Unknown' };
            const userInfoCookie = Cookies.get('user_info');
            if (userInfoCookie) {
                try {
                    userInfo = JSON.parse(decodeURIComponent(userInfoCookie));
                } catch (e) {
                    console.error('Failed to parse user_info:', e);
                }
            }

            const feishuMessage = `[${formattedDate}] 用户[${userInfo.name}][${userInfo.email}]搜索了[${title}]并提交了 google 索引, [${env('NEXT_PUBLIC_BASE_URL')}/en${responseData.url}] IP: ${ip}` +
                (location ? ` [${location.city}, ${location.region}, ${location.country_name}]` : '');

            notifyFeishu(feishuMessage);

            console.log('Report API response: ', responseData);
        }
    } catch (error) {
        console.error('Failed to call Report API:', error);
    }
};

function Page({ params }: { params: { lang: string } }) {
    const [dict, setDict] = useState<Dictionary | null>(null);
    const [isDictionaryLoaded, setIsDictionaryLoaded] = useState(false); // 新增状态用于追踪字典是否加载完成
    const [data, setData] = useState('');
    const [query, setQuery] = useState<SearchResponse>({ items: [], nextPageToken: null });
    const [referenceData, setReferenceData] = useState(['', '', '', '', '', '', '', '']);
    const [derivedQuestions, setDerivedQuestions] = useState<string[]>(['', '', '', '']);
    const [isFinalized, setIsFinalized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showOverlay, setShowOverlay] = useState(false);
    const [isSearching, setIsSearching] = useState(false); // 新增状态变量
    const searchParams = useSearchParams();

    useEffect(() => {
        const fetchDictionary = async () => {
            const result = await getDictionary(params.lang);
            setDict(result);
            setIsDictionaryLoaded(true); // 在字典加载后设置为true
        };
        fetchDictionary();
    }, [params.lang]);

    useEffect(() => {
        const keywords = searchParams?.get('q');
        if (keywords && isDictionaryLoaded && !isSearching) {
            performSearch(keywords);
        }
    }, [searchParams, isDictionaryLoaded]);

    useEffect(() => {
        if (query.items.length > 0) {
            processSearchResults();
        }
    }, [query]);

    const performSearch = async (keywords: string) => {
        const searchCount = parseInt(localStorage.getItem('searchCount') || '0');

        // 检查搜索计数并显示浮层，如果满足条件则禁止搜索
        /*if (searchCount >= 10) {
            setShowOverlay(true);
            return;
        }*/

        setIsSearching(true); // 开始搜索时设置状态
        setData('');
        setReferenceData(['', '', '', '', '', '', '', '']);
        setDerivedQuestions(['', '', '', '']);
        setIsLoading(true);
        document.title = `${keywords}`;

        // 更新搜索计数
        localStorage.setItem('searchCount', (searchCount + 1).toString());

        const response = await fetch('/api/search_service', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ keywords }),
        });
        const data = await response.json();
        setQuery(data);
        setReferenceData(data.items);
        // fetchAndDisplayUserSuggestion(keywords);
        setIsSearching(false); // 搜索完成时重置状态
    };

    const processSearchResults = () => {
        const system_prompt = constructSummarizePrompt(query.items, dict?.search);
        const eventSource = new EventSource(`/api/update?system_prompt=${encodeURIComponent(system_prompt)}&query=${encodeURIComponent(searchParams?.get('q') ?? '')}`);
        handleEventSource(eventSource);
    };

    const constructSummarizePrompt = (searchResults, dictTexts) => {
        const formattedResults = searchResults.map((result, index) =>
            `${dictTexts.searchResultPrefix.replace('${index}', index + 1).replace('${snippet}', result.snippet)}`
        ).join('\n\n');
        return `${dictTexts.searchPrompt.replace('${context}', formattedResults)}`;
    };

    const constructSuggestionPrompt = (searchTerms, dictTexts) => {
        return dictTexts?.userSuggestionPrompt.replace('${searchTerms}', searchTerms);
    };

    const extractArrayFromString = (str: string) => {
        const matches = str.match(/'[^']+'/g);
        return matches ? matches.map(match => match.replace(/'/g, "")) : [];
    }

    const fetchAndDisplayUserSuggestion = (keywords: string) => {
        return new Promise((resolve, reject) => {
            const system_prompt = constructSuggestionPrompt(keywords, dict?.search);
            const eventSource = new EventSource(`/api/update?max_token=256&system_prompt=${encodeURIComponent(system_prompt)}&query=${encodeURIComponent(keywords)}`);
            let partString = '';
            eventSource.onmessage = (event) => {
                if (event.data !== '[DONE]') {
                    partString += JSON.parse(event.data).choices[0].text;/*
                    if (['stop', 'eos'].includes(JSON.parse(event.data).choices[0].finish_reason)) {
                        setDerivedQuestions(extractArrayFromString(partString));
                        setIsLoading(false);
                        eventSource.close();
                        resolve(); // Resolve the promise when done
                    }*/
                } else {
                    setDerivedQuestions(extractArrayFromString(partString));
                    setIsLoading(false);
                    eventSource.close();
                    resolve(extractArrayFromString(partString)); // Resolve the promise when done
                }
            };
            eventSource.onerror = (error) => {
                console.error('fetchAndDisplayUserSuggestion EventSource failed:', error);
                eventSource.close();
                reject(error); // Reject the promise if there's an error
            };
        });
    };

    const handleEventSource = (eventSource) => {
        let partString = '';
        eventSource.onmessage = (event) => {
            if (event.data !== '[DONE]') {
                partString += JSON.parse(event.data).choices[0].text;
                setData(partString);
            } else {
                finalizeData(partString, eventSource);
            }
        };
        eventSource.onerror = (error) => {
            console.error('handleEventSource EventSource failed:', error);
            eventSource.close();
        };
    };

    const finalizeData = async (partString, eventSource) => {
        setData(partString);
        setIsFinalized(true); // 设置状态
        logEvent('search', 'ai summarization', 'summarization finish', partString);
        eventSource.close();    // 调用发送报告的函数

        try {
            const derivedQuestions = await fetchAndDisplayUserSuggestion(searchParams?.get('q') as string); // Wait for derivedQuestions to be populated
            await publishReportAndGoogleIndex(searchParams?.get('q'), partString, referenceData, derivedQuestions);
            console.log('Report sent successfully');
        } catch (error) {
            console.error('Error sending report:', error);
        }
    };

    const handleOverlayClose = () => {
        setShowOverlay(false);
        localStorage.setItem('searchCount', '0'); // 清零搜索计数
    };

    return (
        <div className="flex min-h-screen">
            <SessionProvider>
                <TopNavBar
                    lang={params.lang?.toLowerCase()}
                    searchTerms={searchParams?.get('q') as any}
                />
            </SessionProvider>
            <div className="flex-1 mx-auto sm:p-4 pt-20 sm:pt-24 text-customBlackText max-w-6xl">
                <div className="px-8 py-5 sm:px-6 overflow-hidden sm:rounded-lg bg-customWhite2 shadow mt-4">
                    <h2 className="text-lg font-medium text-gray-800 mb-4"><FontAwesomeIcon
                        className="text-customOrange mr-2" icon={faClipboardQuestion} /> {searchParams?.get('q')}</h2>

                    <div className="prose mt-2 max-w-none pb-4">
                        <Markdown content={data} referenceData={referenceData} />
                    </div>

                    <h4 className='text-sm'>{dict?.search.refInfo}</h4>
                    <div className="flex flex-wrap justify-center overflow-x-auto pt-2 pb-2">
                        {referenceData.map((data, index) => <ReferenceCard key={index} data={data} />)}
                    </div>

                    <h4 className='text-sm'>{dict?.search.moreQs}</h4>
                    <div className="flex flex-wrap justify-center pt-2">
                        {isLoading ? [...Array(4)].map((_, index) => <DerivedQuestionCardSkeleton
                            key={index} />) : derivedQuestions.map((question, index) =>
                                <DerivedQuestionCard
                                    key={index}
                                    question={question}
                                    lang={params.lang?.toLowerCase()}
                                />)}
                    </div>
                </div>
            </div>
            {showOverlay && <Overlay onClose={handleOverlayClose} lang={params.lang?.toLowerCase() || 'en'} />}
        </div>
    );
}

export default Page;

function DerivedQuestionCardSkeleton() {
    return (
        <div className="w-full sm:w-1/4 px-1">
            <div className="bg-customWhite shadow rounded-lg p-4 my-2 w-full">
                <div className="rounded bg-slate-300 h-4 w-3/4"></div>
            </div>
        </div>
    );
}