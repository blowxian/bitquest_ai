'use client';

import {useSearchParams} from "next/navigation";
import {useState} from "react";

export default function DynamicResultViewer() {
    const searchParams = useSearchParams();
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState('');

    const handleGenerate = async () => {

    }

    return (
        <div>
            <h3>{searchParams.get('q')}</h3>
            <p>dynamic result viewer</p>
        </div>
    )
}