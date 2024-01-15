'use client';

import {useSearchParams, useRouter} from 'next/navigation';

export default function SearchBar({placeholder}: { placeholder: string }) {
    const searchParams = useSearchParams();
    const {replace} = useRouter();

    function handleSearch(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            const params = new URLSearchParams(searchParams as URLSearchParams);
            const term = (e.target as HTMLInputElement)?.value;

            if (term) {
                params.set('q', term);
            } else {
                params.delete('q');
            }
            // replace(`/search?${params.toString()}`);
            fetchData(term).then();
        }
    }

    async function fetchData(keywords: string) {
        const response = await fetch('/api/readable', {
            method: 'POST',
            headers: {
                'Content-Type': 'text/event-stream; charset=utf-8',
            },
            body: keywords, // 发送 POST 请求的数据
        });

        // 获取 ReadableStream
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        // 读取流数据
        reader?.read().then(function processText({done, value}) {
            if (done) {
                console.log('Stream complete');
                return;
            }
            const text = decoder.decode(value);
            // console.log(text); // 处理每一块流数据

            // 将完整的字符串拆分为单独的 JSON 对象，并处理每一个
            const jsonObjects = text.split('data: ').slice(1);
            let partString = '';
            jsonObjects.forEach((jsonStr: string) => {
                if (jsonStr.trim() !== '[DONE]') {
                    const jsonData = JSON.parse(jsonStr);
                    // 处理每一个 JSON 对象
                    if (jsonData.generated_text !== null && jsonData.generated_text !== '') {
                        console.log(jsonData.generated_text);
                        return;
                    }
                    console.log(jsonData.choices[0]?.text);
                    partString += jsonData.choices[0]?.text.toString();
                } else {
                    return;
                }
            });

            // 读取下一块数据
            reader.read().then(processText);
        });
    }

    async function fetchGeneratedText(prompt: string) {
        try {
            const response = await fetch('/api/textGeneration', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({prompt})
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching generated text:', error);
        }
    }

    return (
        <div className="w-full max-w-4xl mb-36">
            <div className="relative flex items-center rounded-xl border border-gray-100 bg-gray-100 p-4">
                <input
                    type="text"
                    className="w-full py-4 pl-10 pr-10 mr-16 text-lg border-none focus:ring-0 focus:outline-none  bg-gray-100"
                    placeholder={placeholder}
                    onKeyUp={(e) => {
                        handleSearch(e);
                    }}
                    defaultValue={(searchParams as URLSearchParams).get('q')?.toString()}
                />
                <button
                    className="absolute inset-y-0 right-0 flex items-center rounded-r-xl border-l border-gray-300 hover:border-gray-400 bg-gray-200 hover:bg-gray-300 px-6 font-bold">
                    →
                </button>
            </div>
        </div>
    )
}