'use client';

import {useSearchParams} from "next/navigation";
import {useState} from "react";
import Markdown from "@/lib/mark-down";

export default function DynamicResultViewer() {
    const searchParams = useSearchParams();
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState('');

    const handleGenerate = async () => {

    }

    const markdownContent = `# 这是标题\n\n这是 *斜体* 和 **粗体** 文字。`;

    return (
        <div>
            <h3>{searchParams.get('q')}</h3>
            <p>dynamic result viewer</p>

            <div className="p-2 border m-2">test</div>

            <Markdown content={markdownContent} />
        </div>
    )
}