'use client';

import {useEffect, useState} from "react";

// 假设每个数据项都是这种类型
type DataType = {
    time: string; // 根据实际数据结构调整
};

export default function Page() {
    const [data, setData] = useState<DataType[]>([]);

    useEffect(() => {
        const eventSource = new EventSource('/api/events');
        eventSource.onmessage = (event) => {
            console.log('Received data: ', event.data);
            const newData = JSON.parse(event.data);
            setData(prevData => [...prevData, newData]);
        };

        eventSource.onerror = (error) => {
            console.error('EventSource failed:', error);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, []);

    return (
        <div>
            <h1>实时数据</h1>
            {data.map((item, index) => (
                <div key={index}>{item.time}</div>
            ))}
        </div>
    )
}