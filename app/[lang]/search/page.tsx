'use client';

import React, {useState, useEffect, useRef} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faClipboardQuestion} from "@fortawesome/free-solid-svg-icons";
import Markdown from "@/lib/mark-down";
import ReferenceCard from "@/components/ReferenceCard";
import DerivedQuestionCard from "@/components/DerivedQuestionCard";
import {useSearchParams, useRouter} from 'next/navigation';
import {GoogleCustomSearchResponse} from "@/pages/api/types";
import TopNavBar from "@/components/TopNavBar";
import {getDictionary} from "@/app/[lang]/dictionaries";

export default async function Page(/*{params}: { params: { lang: string } }*/) {
    // const dict = await getDictionary(params.lang) // en
    const [data, setData] = useState('');
    const [query, setQuery] = useState<GoogleCustomSearchResponse>({
        items: [],
        queries: {
            request: [],
            nextPage: [],
        },
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

    const replaceReferences = (text: string) => {
        const parts = text.split(/\[\[Ref (\d+)\]\]/g);
        return parts.map((part, index) => {
            if ((index % 2) === 1) {
                const refNumber = parseInt(part, 10) - 1;
                // @ts-ignore
                const refLink = referenceData ? referenceData[refNumber]?.link : '';
                if (refLink) {
                    // 转换为 Markdown 链接格式
                    return ` [<span class="text-blue-600 hover:text-blue-800 visited:text-purple-600 text-xs">[${refNumber + 1}]</span>](${refLink})`;
                }
                return ``;
            }
            return part;
        }).join('');
    }

    const fetchAndSummarizeData = (googleSearchRes: GoogleCustomSearchResponse) => {
        const eventSource = new EventSource(`/api/update?prompt=` + encodeURIComponent(`合并以下多个搜索结果，结合你的知识，生成用户想要的答案，并在回复中标注各条搜索结果的引用部分。

${googleSearchRes.items?.map((result, index) => `搜索结果${index + 1}： ${result.snippet}`).join('\n')}
    
结合上述搜索结果和你的知识，请提供关于 ${googleSearchRes.queries?.request[0].searchTerms} 的综合性中文答案，用 Markdown 格式结构化输出，并在回复中明确标注引用的部分。格式为：在引用相关信息后加上[[Ref X]]，其中X是搜索结果的序号。
`));

        let partString = '';

        eventSource.onmessage = (event) => {
            if (event.data !== '[DONE]') {
                const jsonData = JSON.parse(event.data);
                // console.log('Received message: ', jsonData.token.text);

                partString += jsonData.token.text;
                setData(replaceReferences(partString));
            } else {
                eventSource.close();
            }
        };

        eventSource.onerror = (error) => {
            console.error('fetchAndSummarizeData EventSource failed:', error);
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

    const fetchAndDisplayUserSuggestion = () => {
        const eventSource = new EventSource(`/api/update?max_token=128&prompt=` + encodeURIComponent(`根据用户之前的搜索内容：“${searchParams?.get('q')}”，请提供四个紧密相关的、用户可能感兴趣的中文搜索话题或问题。请确保每个话题或问题控制在15个汉字内，并且仅回复一个格式为['话题1', '话题2', '话题3', '话题4']的列表。除此之外不需要包含任何其他信息。请仅回复一次并且确保回复仅包含这个列表。`));

        eventSource.onmessage = (event) => {
            if (event.data !== '[DONE]') {
                const jsonData = JSON.parse(event.data);
                if (jsonData.finish_reason === 'stop' || jsonData.finish_reason === 'eos') {
                    console.log('UserSuggestion: ', jsonData.generated_text);
                    const extractedArray = extractArrayFromString(jsonData.generated_text);
                    console.log("User Suggestion Array: ", extractedArray);
                    setDerivedQuestions(extractedArray);
                    setIsLoading(false);
                    eventSource.close();
                }
            } else {
                eventSource.close();
            }
        }

        eventSource.onerror = (error) => {
            console.error('fetchAndDisplayUserSuggestion EventSource failed:', error);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }

    const handleSearch = (searchTermsInput: string = '') => {
        // 更新 URL，这里将触发 useSearchParams 的变化
        router.push(`/search?q=${encodeURIComponent(searchTermsInput === '' ? searchTerms : searchTermsInput)}`);
        if (searchInputRef.current) {
            searchInputRef.current.blur();
        }
    };

    // 更新状态变量以匹配输入框的内容
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerms(event.target.value);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        // 检查是否同时按下了 'Enter' 键和 'Meta' 键（Mac 的 Command 键）或 'Control' 键（Windows/Linux）
        if (event.key === 'Enter') {
            handleSearch(); // 调用搜索处理函数
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
    const googleSearchDone = useRef(false)

    useEffect(() => {
        const keywords = searchParams?.get('q');
        setSearchTerms(keywords ? keywords : '');
        setData('');
        setReferenceData([]);
        setDerivedQuestions(['', '', '', ''])
        setIsLoading(true);

        if (keywords && !googleSearchDone.current) {
            document.title = `${keywords} | Coogle.ai`;
            googleSearchDone.current = true;
            fetch('/api/googleSearch', {
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
                    googleSearchDone.current = false;
                });

            fetchAndDisplayUserSuggestion();
        }
    }, [searchParams]);

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
            <TopNavBar
                searchTerms={searchTerms}
                setSearchTerms={setSearchTerms}
                onSearch={() => handleSearch(searchTerms)}
                searchInputRef={searchInputRef}
            />

            {/*主内容区*/}
            <div className="flex-1 mx-auto sm:p-4 pt-14 sm:pt-24 text-customBlackText max-w-6xl">
                {/* 迭代搜索结果 */}
                {searchResults.map((result, index) => (
                    <div key={index}
                         className="px-8 py-5 sm:px-6 overflow-hidden sm:rounded-lg bg-customWhite2 shadow mt-4">
                        <h2 className="text-lg font-medium text-gray-800 mb-4"><FontAwesomeIcon
                            className="text-customOrange mr-2"
                            icon={faClipboardQuestion}/> {searchParams?.get('q')}</h2>

                        {/* Markdown 渲染 */}
                        <div className="prose mt-2 max-w-none pb-4">
                            <Markdown content={data}/>
                        </div>

                        <h4 className='text-sm'>参考信息{/*{dict.search.refInfo}*/}</h4>
                        <div
                            className="flex flex-wrap justify-center overflow-x-auto pt-2 pb-2">
                            {(referenceData?.length > 0 ? referenceData : [null, null, null, null, null]).map((data, index) => (
                                <ReferenceCard key={index} data={data}/>
                            ))}
                        </div>

                        <h4 className='text-sm'>您还想问{/*{dict.search.moreQs}*/}</h4>
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
        </div>
    )
}