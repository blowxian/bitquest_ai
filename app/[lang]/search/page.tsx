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
import { notifyFeishu, warnFeishu } from '@/lib/feishu';
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

interface SafetyError extends Error {
    safetyRatings?: any;
}

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
    const [shouldFetchSuggestions, setShouldFetchSuggestions] = useState(false);
    const [cachedSuggestions, setCachedSuggestions] = useState<{ [key: string]: string[] }>({});
    const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
    const [isSummarizationDone, setIsSummarizationDone] = useState(false);
    const [isSuggestionDone, setIsSuggestionDone] = useState(false);
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

    useEffect(() => {
        if (shouldFetchSuggestions && !isFetchingSuggestions) {
            const fetchSuggestions = async () => {
                setIsFetchingSuggestions(true);
                const keywords = searchParams?.get('q') as string;
                if (cachedSuggestions[keywords]) {
                    setDerivedQuestions(cachedSuggestions[keywords]);
                    setIsLoading(false);
                } else {
                    await fetchAndDisplayUserSuggestion(keywords);
                }
                setShouldFetchSuggestions(false);
                setIsFetchingSuggestions(false);
            };
            fetchSuggestions();
        }
    }, [shouldFetchSuggestions, cachedSuggestions, searchParams]);

    useEffect(() => {
        if (isSummarizationDone && isSuggestionDone) {
            finalizeData();
        }
    }, [isSummarizationDone, isSuggestionDone]);

    const performSearch = async (keywords: string) => {
        try {
            setIsSearching(true);
            setData('');
            setReferenceData(['', '', '', '', '', '', '', '']);
            setDerivedQuestions(['', '', '', '']);
            setIsLoading(true);
            document.title = `${keywords}`;

            const response = await fetch('/api/search_service', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keywords }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setQuery(data);
            setReferenceData(data.items);
        } catch (error) {
            console.error('Search failed:', error);
            warnFeishu(`Search failed for keywords "${keywords}": ${error}`);
            setData('Error: Failed to perform search. Please try again later.');
        } finally {
            setIsSearching(false);
        }
    };

    const processSearchResults = async () => {
        const system_prompt = constructSummarizePrompt(query.items, dict?.search);
        const searchQuery = searchParams?.get('q') ?? '';

        try {
            await handleGeminiRequest(system_prompt, searchQuery, false);
            setShouldFetchSuggestions(true);
        } catch (error) {
            console.error('Gemini request failed:', error);
            if (error === "SAFETY_BLOCK") {
                console.log('Switching to TogetherAI due to safety concerns');
                notifyFeishu(`Gemini request blocked for safety reasons. Query: "${searchQuery}". Switching to TogetherAI.`);
                try {
                    await handleTogetherAIRequest(system_prompt, searchQuery, false);
                    setShouldFetchSuggestions(true);
                } catch (togetherError) {
                    console.error('TogetherAI request failed:', togetherError);
                    setData('Error: Failed to fetch data from both Gemini and TogetherAI. Please try again later.');
                    warnFeishu(`Search failed on both Gemini and TogetherAI for query "${searchQuery}": ${togetherError}`);
                }
            } else {
                setData('Error: Failed to fetch data. Please try again later.');
                warnFeishu(`Search failed on Gemini for query "${searchQuery}": ${error}`);
            }
        }
    };

    const handleGeminiRequest = (system_prompt: string, query: string, isSuggestion: boolean): Promise<string> => {
        return new Promise((resolve, reject) => {
            const eventSource = new EventSource(`/api/gemini?system_prompt=${encodeURIComponent(system_prompt)}&query=${encodeURIComponent(query)}`);
            handleEventSource(eventSource, resolve, reject, isSuggestion);
        });
    };

    const handleTogetherAIRequest = (system_prompt: string, query: string, isSuggestion: boolean): Promise<string> => {
        return new Promise((resolve, reject) => {
            const eventSource = new EventSource(`/api/update?system_prompt=${encodeURIComponent(system_prompt)}&query=${encodeURIComponent(query)}`);
            handleEventSource(eventSource, resolve, reject, isSuggestion);
        });
    };

    const handleEventSource = (eventSource: EventSource, resolve: (value: string) => void, reject: (reason: string) => void, isSuggestion: boolean) => {
        let partString = '';
        eventSource.onmessage = (event) => {
            if (event.data !== '[DONE]') {
                try {
                    const parsedData = JSON.parse(event.data);
                    if (parsedData.content !== undefined) {
                        // Gemini format
                        partString += parsedData.content;
                        if (!isSuggestion) {
                            setData(partString);
                        }
                    } else if (parsedData.choices && parsedData.choices[0].text !== undefined) {
                        // TogetherAI format
                        partString += parsedData.choices[0].text;
                        if (!isSuggestion) {
                            setData(partString);
                        }
                    } else if (parsedData.error) {
                        console.error('API error:', parsedData.error);
                        warnFeishu(`API error during ${isSuggestion ? 'suggestion' : 'main'} request: ${parsedData.error}`);
                        eventSource.close();
                        reject(parsedData.error);
                    }
                } catch (error) {
                    console.error('Error parsing event data:', error);
                    warnFeishu(`Error parsing event data during ${isSuggestion ? 'suggestion' : 'main'} request: ${error}`);
                    reject('Error parsing event data');
                }
            } else {
                if (partString.trim() === '') {
                    // Gemini returned [DONE] without any content
                    console.log('Gemini returned no content, treating as safety issue');
                    eventSource.close();
                    reject("SAFETY_BLOCK");
                } else {
                    if (!isSuggestion) {
                        setData(partString);
                        setIsSummarizationDone(true);
                    } else {
                        const extractedQuestions = extractArrayFromString(partString);
                        setDerivedQuestions(extractedQuestions);
                        setCachedSuggestions(prev => ({ ...prev, [searchParams?.get('q') as string]: extractedQuestions }));
                        setIsSuggestionDone(true);
                    }
                    eventSource.close();
                    resolve(partString);
                }
            }
        };
        eventSource.onerror = (error) => {
            console.error('EventSource failed:', error);
            warnFeishu(`EventSource failed during ${isSuggestion ? 'suggestion' : 'main'} request: ${error}`);
            eventSource.close();
            reject('EventSource failed');
        };
    };

    const finalizeData = async () => {
        setIsFinalized(true);
        logEvent('search', 'ai summarization', 'summarization finish', data);

        try {
            await publishReportAndGoogleIndex(searchParams?.get('q'), data, referenceData, derivedQuestions);
            console.log('Report sent successfully');
        } catch (error) {
            console.error('Error sending report:', error);
            warnFeishu(`Error sending report for query "${searchParams?.get('q')}": ${error}`);
        }
        setIsLoading(false);
    };

    const fetchAndDisplayUserSuggestion = async (keywords: string) => {
        if (cachedSuggestions[keywords]) {
            setDerivedQuestions(cachedSuggestions[keywords]);
            setIsLoading(false);
            return;
        }

        const system_prompt = constructSuggestionPrompt(keywords, dict?.search);
        try {
            const questions = await handleGeminiRequest(system_prompt, keywords, true);
            const extractedQuestions = extractArrayFromString(questions);
            setDerivedQuestions(extractedQuestions);
            setCachedSuggestions(prev => ({ ...prev, [keywords]: extractedQuestions }));
            setIsLoading(false);
        } catch (error) {
            console.error('Gemini suggestion request failed:', error);
            if (error === "SAFETY_BLOCK") {
                console.log('Switching to TogetherAI for suggestions due to safety concerns');
                try {
                    const questions = await handleTogetherAIRequest(system_prompt, keywords, true);
                    const extractedQuestions = extractArrayFromString(questions);
                    setDerivedQuestions(extractedQuestions);
                    setCachedSuggestions(prev => ({ ...prev, [keywords]: extractedQuestions }));
                    setIsLoading(false);
                } catch (togetherError) {
                    console.error('TogetherAI suggestion request failed:', togetherError);
                    setDerivedQuestions([]);
                    setIsLoading(false);
                    warnFeishu(`Failed to fetch suggestions from both Gemini and TogetherAI: ${togetherError}`);
                }
            } else {
                setDerivedQuestions([]);
                setIsLoading(false);
                warnFeishu(`Failed to fetch suggestions: ${error}`);
            }
        }
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
        const matches = str.match(/"[^"]+"/g);
        return matches ? matches.map(match =>
            match.replace(/^"|"$/g, "")  // 移除开头和结尾的双引号
                .replace(/&quot;/g, "'")  // 将 &quot; 转换回单引号
        ) : [];
    }

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