'use client'
// Import statements
import React, {useState, useEffect} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faClipboardQuestion} from "@fortawesome/free-solid-svg-icons";
import Markdown from "@/lib/mark-down";
import ReferenceCard from "@/components/ReferenceCard";
import DerivedQuestionCard from "@/components/DerivedQuestionCard";
import {useSearchParams} from 'next/navigation';
import {SearchResponse} from "@/pages/api/types";
import TopNavBar from "@/components/TopNavBar";
import {getDictionary, Dictionary} from "@/app/[lang]/dictionaries";
import {SessionProvider} from '@/app/context/sessionContext';
import Overlay from '@/components/Overlay';
import {logEvent} from '@/lib/ga_log';
import {recordToFeishu} from '@/lib/feishu';
import { env } from 'next-runtime-env';

function Page({params}: { params: { lang: string } }) {
    const [dict, setDict] = useState<Dictionary | null>(null);
    const [isDictionaryLoaded, setIsDictionaryLoaded] = useState(false); // 新增状态用于追踪字典是否加载完成
    const [data, setData] = useState('');
    const [query, setQuery] = useState<SearchResponse>({items: [], nextPageToken: null});
    const [referenceData, setReferenceData] = useState(['', '', '', '', '', '', '', '']);
    const [derivedQuestions, setDerivedQuestions] = useState<string[]>(['', '', '', '']);
    const [isFinalized, setIsFinalized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [feishuRecordId, setFeishuRecordId] = useState('');
    const [showOverlay, setShowOverlay] = useState(false);
    const [userIp, setUserIp] = useState('');
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
        const fetchUserIp = async () => {
            const response = await fetch('/api/get_client_ip');
            const data = await response.json();
            setUserIp(data.ip);
        };
        fetchUserIp();
    }, []);

    useEffect(() => {
        const keywords = searchParams?.get('q');
        if (keywords && isDictionaryLoaded) {
            performSearch(keywords);
        }
    }, [searchParams, isDictionaryLoaded]);

    useEffect(() => {
        if (query.items.length > 0) {
            processSearchResults();
        }
    }, [query]);

    useEffect(() => {
        if (isFinalized && !isLoading && feishuRecordId) {
            const assembledData = {
                data: data,
                referenceData: referenceData,
                derivedQuestions: derivedQuestions
            };
            createReport(assembledData);
        }
    }, [isFinalized, isLoading, feishuRecordId]);

    const performSearch = async (keywords: string) => {
        const searchCount = parseInt(localStorage.getItem('searchCount') || '0');

        // 检查搜索计数并显示浮层，如果满足条件则禁止搜索
        if (searchCount >= 10) {
            setShowOverlay(true);
            return;
        }

        setData('');
        setReferenceData(['', '', '', '', '', '', '', '']);
        setDerivedQuestions(['', '', '', '']);
        setIsLoading(true);
        document.title = `${keywords} | phind ai alternative`;

        // 更新搜索计数
        localStorage.setItem('searchCount', (searchCount + 1).toString());

        const response = await fetch('/api/search_service', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({keywords}),
        });
        const data = await response.json();
        setQuery(data);
        setReferenceData(data.items);
        fetchAndDisplayUserSuggestion(keywords);
    };

    const processSearchResults = () => {
        const system_prompt = constructSummarizePrompt(query.items, dict?.search);
        const add_record_promise = recordToFeishu("PWCWbe2x2aMfQts2fNpcmOWOnVh", "tbl5OB8eWTBgwrDc", "", {
            "搜索内容": searchParams?.get('q'),
            "用户IP": userIp                      // 添加用户IP信息
        });
        const eventSource = new EventSource(`/api/update?system_prompt=${encodeURIComponent(system_prompt)}&query=${encodeURIComponent(searchParams?.get('q') ?? '')}`);
        handleEventSource(eventSource, system_prompt, add_record_promise);
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
        const system_prompt = constructSuggestionPrompt(keywords, dict?.search);
        const eventSource = new EventSource(`/api/update?max_token=256&system_prompt=${encodeURIComponent(system_prompt)}&query=${encodeURIComponent(keywords)}`);
        let partString = '';
        eventSource.onmessage = (event) => {
            if (event.data !== '[DONE]') {
                partString += JSON.parse(event.data).choices[0].text;
                if (['stop', 'eos'].includes(JSON.parse(event.data).choices[0].finish_reason)) {
                    setDerivedQuestions(extractArrayFromString(partString));
                    setIsLoading(false);
                    eventSource.close();
                }
            }
        };
        eventSource.onerror = (error) => {
            console.error('fetchAndDisplayUserSuggestion EventSource failed:', error);
            eventSource.close();
        };
    };

    const handleEventSource = (eventSource, system_prompt, add_record_promise) => {
        let partString = '';
        eventSource.onmessage = (event) => {
            if (event.data !== '[DONE]') {
                partString += JSON.parse(event.data).choices[0].text;
                setData(partString);
            } else {
                finalizeData(partString, eventSource, system_prompt, add_record_promise);
            }
        };
        eventSource.onerror = (error) => {
            console.error('handleEventSource EventSource failed:', error);
            eventSource.close();
        };
    };

    const finalizeData = (partString, eventSource, system_prompt, add_record_promise) => {
        setData(partString);
        setIsFinalized(true); // 设置状态
        logEvent('search', 'ai summarization', 'summarization finish', partString);
        add_record_promise.then(add_record_response => {
            setFeishuRecordId(add_record_response.data.record.record_id);
            recordToFeishu("PWCWbe2x2aMfQts2fNpcmOWOnVh", "tbl5OB8eWTBgwrDc", add_record_response.data.record.record_id, {
                "搜索提示词": system_prompt,
                "搜索总结": partString,
                "发布链接": {
                    text: `${add_record_response.data.record.record_id}`,
                    link: `${env('NEXT_PUBLIC_BASE_URL')}/search/publish?recordId=${add_record_response.data.record.record_id}`
                }
            })
        });
        eventSource.close();
    };

    const createReport = async (assembledData) => {
        try {
            recordToFeishu("PWCWbe2x2aMfQts2fNpcmOWOnVh", "tbl5OB8eWTBgwrDc", feishuRecordId, {
                "搜索结构数据": JSON.stringify({
                    data: data,
                    referenceData: referenceData,
                    derivedQuestions: derivedQuestions
                })
            });
        } catch (error) {
            console.error('Error create feishu record:', error);
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
                    searchTerms={searchParams?.get('q') || undefined}
                />
            </SessionProvider>
            <div className="flex-1 mx-auto sm:p-4 pt-20 sm:pt-24 text-customBlackText max-w-6xl">
                <div className="px-8 py-5 sm:px-6 overflow-hidden sm:rounded-lg bg-customWhite2 shadow mt-4">
                    <h2 className="text-lg font-medium text-gray-800 mb-4"><FontAwesomeIcon
                        className="text-customOrange mr-2" icon={faClipboardQuestion}/> {searchParams?.get('q')}</h2>

                    <div className="prose mt-2 max-w-none pb-4">
                        <Markdown content={data} referenceData={referenceData}/>
                    </div>

                    <h4 className='text-sm'>{dict?.search.refInfo}</h4>
                    <div className="flex flex-wrap justify-center overflow-x-auto pt-2 pb-2">
                        {referenceData.map((data, index) => <ReferenceCard key={index} data={data}/>)}
                    </div>

                    <h4 className='text-sm'>{dict?.search.moreQs}</h4>
                    <div className="flex flex-wrap justify-center pt-2">
                        {isLoading ? [...Array(4)].map((_, index) => <DerivedQuestionCardSkeleton
                            key={index}/>) : derivedQuestions.map((question, index) => <DerivedQuestionCard key={index}
                                                                                                            question={question}/>)}
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