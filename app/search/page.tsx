'use client';

import Header from "@/components/header";
import SearchBar from "@/components/searchbar";
import DynamicResultViewer from "@/components/dynamic-result-viewer";
import {useState, useEffect} from "react";

export default function Page() {
    const [count, setCount] = useState({content: 'Answer 1', count: 1});

    useEffect(() => {
        // 设置一个定时器，每秒增加 count
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
        return () => clearInterval(interval);
    }, []); // 空依赖数组意味着这个 effect 只在组件挂载时运行

    return (
        <div className="flex min-h-screen flex-col items-center justify-between">
            <Header/>

            <SearchBar placeholder="Search for a Noodlion NFT..."/>


            <div className="">
                Question Answer Lists:
                <div className="relative mx-auto max-w-2xl px-4 border-b pb-2">
                    {count.content}
                </div>
            </div>

            <DynamicResultViewer/>

            <div className="search-container">
                <div className="search-input-container">
                    <input type="text" placeholder="Question to AI"/>
                </div>
                <div className="search-results-container">
                    <div className="search-results-header">
                        <h2>Results</h2>
                    </div>
                    <div className="search-results-list">
                        <p><strong>AI Response</strong></p>
                    </div>
                </div>
            </div>
        </div>
    )
}