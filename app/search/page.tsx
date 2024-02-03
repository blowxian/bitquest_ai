'use client';

import React, {useState, useEffect, useCallback, useRef} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSearch, faClipboardQuestion} from "@fortawesome/free-solid-svg-icons";
import Markdown from "@/lib/mark-down";
import ReferenceCard from "@/components/ReferenceCard";
import DerivedQuestionCard from "@/components/DerivedQuestionCard";
import {useSearchParams, useRouter} from 'next/navigation';
import {GoogleCustomSearchResponse} from "@/pages/api/types";

export default function Page() {
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

    let done = false;

    const searchResults = [
        {
            title: '',
            content: '',
        }];

    const referenceData = query.items;

    const [derivedQuestions, setDerivedQuestions] = useState<string[]>([]);

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = useCallback(() => {
        setIsMenuOpen(!isMenuOpen);
    }, [isMenuOpen]);

    const menuRef = useRef<HTMLDivElement>(null);

    // 点击外部关闭菜单的函数
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setIsMenuOpen(false);
        }
    };

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
        // 添加全局点击事件监听器
        window.addEventListener('mousedown', handleClickOutside);

        // 组件卸载时移除事件监听器
        return () => {
            window.removeEventListener('keydown', handleGlobalKeyDown);
            window.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const replaceReferences = (text: string) => {
        const parts = text.split(/\[\[Ref (\d+)\]\]/g);
        return parts.map((part, index) => {
            if ((index % 2) === 1) {
                const refNumber = parseInt(part, 10) - 1;
                const refLink = referenceData[refNumber].link;
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
                if (jsonData.finish_reason === 'stop') {
                    console.log('UserSuggestion: ', jsonData.generated_text);
                    const extractedArray = extractArrayFromString(jsonData.generated_text);
                    console.log("User Suggestion Array: ", extractedArray);
                    setDerivedQuestions(extractedArray);
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

    useEffect(() => {
        const keywords = searchParams?.get('q');
        setSearchTerms(keywords ? keywords : '');
        setData('');

        if (keywords && !done) {
            done = true;
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
                    done = false;
                });

            fetchAndDisplayUserSuggestion();
        }
    }, [searchParams]);

    return (
        <div className="flex min-h-screen">
            {/*顶部菜单栏*/}
            <div className="fixed left-1/2 transform -translate-x-1/2 p-4 w-full z-50">
                <div className="bg-customBlack rounded-lg p-4 w-full flex items-center justify-between shadow">
                    {/* 左侧 Logo */}
                    <a href="/" className="text-customWhite2 text-2xl font-semibold mr-16">
                        Coogle.AI
                    </a>

                    {/* 中间搜索框 */}
                    <div className="flex-1 mx-4 flex items-center relative w-3/4">
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Coooooooogle"
                                className="bg-gray-700 text-white border border-gray-600 rounded-full py-2 pl-4 pr-10 w-full"
                                value={searchTerms}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                            />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <span className="mr-2 text-sm text-gray-400">⌘ + K</span>
                            <button className="p-2 text-xl" onClick={() => handleSearch()}>
                                <FontAwesomeIcon icon={faSearch}
                                                 className=" text-gray-400 hover:text-customWhite2 transition duration-150 ease-in-out"/>
                            </button>
                        </div>
                    </div>

                    {/* 右侧账号头像和下拉菜单 */}
                    <div className="relative ml-16" ref={menuRef}>
                        <button
                            className="text-white relative z-10 flex items-center"
                            onClick={toggleMenu}
                        >
                            <img
                                src="https://imagedelivery.net/MPdwyYSWT8IY7lxgN3x3Uw/a9572d6d-2c7f-408b-2f17-65d1e09d9500/thumbnail" // 替换成您的账号头像路径
                                alt="Your Avatar"
                                className="w-8 h-8 rounded-full"
                            />
                        </button>

                        {/* 下拉菜单 */}
                        {isMenuOpen && (
                            <div
                                className="absolute right-0 mt-2 py-2 w-36 bg-customWhite2 border border-gray-300 shadow-lg rounded-lg">
                                <a
                                    href="#"
                                    className="block px-4 py-2 text-customBlackText hover:bg-customWhite"
                                >
                                    注销
                                </a>
                                {/* 添加更多菜单项 */}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/*主内容区*/}
            <div className="flex-1 p-4 pt-24 text-customBlackText">
                {/* 迭代搜索结果 */}
                {searchResults.map((result, index) => (
                    <div key={index}
                         className="px-8 py-5 sm:px-6 overflow-hidden rounded bg-customWhite2 shadow mt-4">
                        <h2 className="text-lg font-medium text-gray-800 mb-4"><FontAwesomeIcon
                            className="text-customOrange mr-2"
                            icon={faClipboardQuestion}/> {searchParams?.get('q')}</h2>

                        {/* Markdown 渲染 */}
                        <div className="prose mt-2 max-w-none pb-4">
                            <Markdown content={data}/>
                        </div>

                        <h4 className='text-sm'>参考信息：</h4>
                        <div
                            className="flex flex-wrap justify-center overflow-x-auto pt-2 pb-2">
                            {referenceData?.map((data, index) => (
                                <ReferenceCard key={index} data={data}/>
                            ))}
                        </div>

                        <h4 className='text-sm'>您还想问：</h4>
                        <div className="flex flex-wrap justify-around pt-2">

                            {derivedQuestions.map((question, index) => (
                                <DerivedQuestionCard key={index} question={question} onSearch={handleSearch}/>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}