'use client';

import Header from "@/components/header";
import SearchBar from "@/components/searchbar";
import DynamicResultViewer from "@/components/dynamic-result-viewer";
import {useState, useEffect} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSearch} from "@fortawesome/free-solid-svg-icons";
import Markdown from "@/lib/mark-down";
import axios from "axios";

async function fetchAPI() {
    const togetherAIRequest = axios.create({
        baseURL: '/',
        headers: {
            'Content-Type': 'application/json',
            'Conection': 'keep-alive',
        },
        responseType: 'stream' // 重要：设置响应类型为流
    });


    try {
        // 向 TogetherAI 发送请求
        const response = await togetherAIRequest.post('/api/stream', {
            // TogetherAI API 请求体
            prompt: "分析并说明杭州有什么好吃的并罗列。",
        });


        // 监听流上的 'data' 事件
        response.data.on('data', (chunk: string) => {
            const chunkAsString = chunk.toString();
            console.log('Received chunk: ', chunkAsString);
        });

        // 当流结束时，结束响应
        response.data.on('end', () => {
            console.log('Stream ended');
        });

        // 将 TogetherAI 响应的数据流直接传输给客户端
        // response.data.pipe(res);
    } catch (error) {
        console.error('Error communicating with TogetherAI:', error);
    }
}

async function touchUpdate() {
    // 调用 Next.js API 路由
    fetch('/api/update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Connection': 'keep-alive',
        },
        body: JSON.stringify({prompt: '杭州有什么好吃的，详细罗列。'}),
    }).catch(err => console.error('Fetch error:', err));
}

export default function Page() {
    /*const [count, setCount] = useState({content: 'Answer 1', count: 1});*/
    const [data, setData] = useState('');
    const [buffer, setBuffer] = useState('');
    const [error, setError] = useState('');
    let done = false;

    const searchResults = [{
        title: '杭州有什么好吃的，详细罗列。',
        content: '杭州有什么好吃的，详细罗列。',
    }, {
        title: '杭州有什么好吃的，详细罗列。',
        content: '杭州有什么好吃的，详细罗列。',
    }, {
        title: '杭州有什么好吃的，详细罗列。',
        content: '杭州有什么好吃的，详细罗列。',
    }, {
        title: '杭州有什么好吃的，详细罗列。',
        content: '杭州有什么好吃的，详细罗列。',
    }, {
        title: '杭州有什么好吃的，详细罗列。',
        content: '杭州有什么好吃的，详细罗列。',
    }];

    useEffect(() => {
        /*if(done){
            return;
        }
        done = true;*/

        // fetchAPI();
        const eventSource = new EventSource('/api/update?prompt=杭州有什么好吃的，详细罗列。');

        eventSource.onmessage = (event) => {
            // 将完整的字符串拆分为单独的 JSON 对象，并处理每一个
            const jsonObjects = event.data.split('data: ').slice(0);
            let partString = '';
            jsonObjects.forEach((jsonStr: string) => {
                if (jsonStr.trim() !== '[DONE]') {
                    const jsonData = JSON.parse(jsonStr);
                    // 处理每一个 JSON 对象
                    if (jsonData.generated_text !== null && jsonData.generated_text !== '') {
                        setData(jsonData.generated_text);
                        return;
                    }
                    console.log(jsonData.choices[0]?.text);
                    partString += jsonData.choices[0]?.text.toString();
                } else {
                    eventSource.close();
                }
            });
            setData((currentData) => {
                console.log(currentData);
                console.log(currentData.length);
                if (currentData.length > 10) {
                    eventSource.close();
                }
                return currentData.toString() + partString
            });

            // setData(currentData => currentData + '\n' + event.data);
            // console.log(event.data);
        };

        eventSource.onerror = (error) => {
            console.error('EventSource failed:', error);
            eventSource.close();
        };

        /*if(!done){
            touchUpdate();
            done = true;
        }*/

        return () => {
            eventSource.close();
        };


        /*// 调用 Next.js API 路由
        fetch('/api/stream', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Connection': 'keep-alive',
            },
            body: JSON.stringify({ prompt: '杭州有什么好吃的，详细罗列。' }),
        })
            .then(response => {
                // 检查 response.body 是否为 null
                if (!response.body) {
                    throw new Error('No response body found');
                }
                const reader = response.body.getReader();
                const decoder = new TextDecoder(); // 创建一个 TextDecoder 实例

                return new ReadableStream({
                    async start(controller) {
                        while (true) {
                            const { done, value } = await reader.read();
                            if (done) break;

                            const chunk = decoder.decode(value, { stream: true }); // 将 Uint8Array 转换为字符串
                            /!*chunks += chunk; // 将转换后的字符串块添加到 chunks 中
                            controller.enqueue(chunk);*!/

                            try {
                                // 将完整的字符串拆分为单独的 JSON 对象，并处理每一个
                                const jsonObjects = chunk.split('data: ').slice(1);
                                let partString = '';
                                jsonObjects.forEach(jsonStr => {
                                    if (jsonStr.trim() !== '[DONE]') {
                                        const jsonData = JSON.parse(jsonStr);
                                        // 处理每一个 JSON 对象
                                        if(jsonData.generated_text !== null && jsonData.generated_text !== '') {
                                            setData(jsonData.generated_text);
                                            return;
                                        }
                                        console.log('jsonData: ', jsonData);
                                        partString += jsonData.choices[0]?.text.toString();
                                    }
                                });
                                setData(data + partString);
                            } catch (parseError) {
                                throw new Error('Failed to parse response as JSON');
                            }
                        }
                        controller.close();
                        reader.releaseLock();
                    }
                }).pipeTo(new WritableStream());
            })
            .catch(err => console.error('Fetch error:', err));*/
        /*// 设置一个定时器，每秒增加 count
        const interval = setInterval(() => {
            setCount(prevCount => {
                if (prevCount.count >= 19) {
                    clearInterval(interval);
                }

                return {
                    content: prevCount.content + '; Answer ' + (prevCount.count + 1).toString(),
                    count: prevCount.count + 1
                }
            });
        }, 100);

        // 清除定时器的效果
        return () => clearInterval(interval);*/
    }, []); // 空依赖数组意味着这个 effect 只在组件挂载时运行

    /*useEffect(() => {
        // 设置定时器以定期更新状态
        const interval = setInterval(() => {
            if (buffer.length > 0) {
                console.log('buffer', buffer);
                setData(prevData => prevData + buffer);
                setBuffer(''); // 清空缓冲区
            }
        }, 300); // 每1000毫秒（1秒）更新一次

        // return () => clearInterval(interval);
    }, []);*/

    return (
        <div className="flex min-h-screen">
            {/*左侧边栏*/}
            <div className="bg-customGray flex h-screen w-72 flex-col">
                {/*顶部区域：Logo和搜索按钮*/}
                <div className="border-customWhite flex h-20 items-center justify-between border-b">
                    {/*Logo*/}
                    <img className="ml-4 h-8" src="http://localhost:3000/logo-final.svg" alt="Logo"/>
                    {/*搜索按钮*/}
                    <button className="mr-4 p-2 text-xl">
                        <FontAwesomeIcon icon={faSearch}
                                         className="text-customWhite hover:text-customOrange transition duration-150 ease-in-out"/>
                    </button>
                </div>

                {/*历史搜索结果容器*/}
                <div className="flex-1 overflow-y-auto">
                    {/*历史搜索结果*/}
                    <div className="p-4">
                        <h2 className="text-customWhite mb-4 text-xl font-semibold">历史搜索</h2>
                        <ul className="space-y-2">
                            <li><a href="#" className="block rounded p-2 text-customWhite">搜索结果
                                #1</a></li>
                            <li><a href="#" className="block rounded p-2 text-customWhite">搜索结果
                                #2</a></li>
                            <li><a href="#" className="block rounded p-2 text-customWhite">搜索结果
                                #3</a></li>
                            {/*更多历史搜索结果*/}
                        </ul>
                    </div>
                </div>

                {/*账号信息*/}
                <div className="p-4 border-t border-customGray">
                    <div className="mb-4 flex items-center">
                        <img className="mr-3 h-10 w-10 rounded-full"
                             src="https://imagedelivery.net/MPdwyYSWT8IY7lxgN3x3Uw/a9572d6d-2c7f-408b-2f17-65d1e09d9500/thumbnail"
                             alt="用户头像"/>
                        <div>
                            <div className="font-semibold text-customWhite">Lison Allen</div>
                            <a href="#" className="text-sm text-customOrange">设置</a>
                        </div>
                    </div>
                </div>
            </div>

            {/*主内容区*/}
            <div className="flex-1 p-4">
                <div className="overflow-hidden rounded bg-white shadow">
                    <div className="p-4 sm:p-6">
                        <h1 className="mb-4 text-xl font-semibold text-gray-800">搜索结果</h1>
                        <div className="border-t border-gray-200">
                            {/* 迭代搜索结果 */}
                            {searchResults.map((result, index) => (
                                <div key={index} className="border-b border-gray-200 px-4 py-5 sm:px-6">
                                    <h2 className="text-lg font-medium text-gray-800">{result.title}</h2>
                                    {/* Markdown 渲染 */}
                                    <div className="prose mt-2 max-w-none">
                                        <Markdown content={result.content}/>
                                    </div>
                                    {/* 其他元素 */}
                                </div>
                            ))}
                        </div>
                        {/* 底部链接或信息 */}
                        <div className="mt-4 px-4 py-4 sm:px-6">
                            <p className="text-xs text-gray-500">其他信息或链接。</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}