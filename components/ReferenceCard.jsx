'use client'

import React from 'react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowUpRightFromSquare} from "@fortawesome/free-solid-svg-icons";

// Skeleton.js - 骨架图组件
function Skeleton() {
    return (
        <div className="w-full sm:w-1/4 px-1">
            <div className="bg-customWhite rounded-lg shadow p-4 my-2 w-full overflow-y-hidden">
                <div className="flex">
                    <div className="flex-none h-3 w-3 bg-gray-300 rounded-sm mr-4 mt-3"></div>
                    <div className="flex-grow">
                        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-300 rounded"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ReferenceCard({data}) {
    const [loading, setLoading] = React.useState(true);

    // 假设数据加载逻辑在此处
    React.useEffect(() => {
        if (data) {
            setLoading(false);
        } else {
            setLoading(true);
        }
    }, [data]);

    if (loading) {
        return <Skeleton/>;
    }

    const imageUrl = data?.pagemap?.cse_thumbnail?.length ? data.pagemap.cse_thumbnail[0].src : "";
    return (
        <div className="w-full sm:w-1/4 px-1">
            <div className="group relative bg-customWhite rounded-lg shadow p-4 my-2 w-full overflow-y-hidden">
                <div className="flex">
                    <div className={`flex-grow ${!imageUrl ? 'w-full' : ''}`}>
                        <h3 className="text-xs font-semibold">
                            <img
                                className="h-4 w-4 float-left mr-3 mb-5 rounded-sm"
                                alt={data?.domain}
                                src={`https://www.google.com/s2/favicons?domain=${data?.domain}&sz=${16}`}
                            /> {data?.title}
                        </h3>
                    </div>
                </div>
                <div
                    className="absolute bottom-0 transform translate-y-full left-0 right-0 bg-white p-2 rounded-lg shadow-md mt-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 z-10 transition-all duration-300">
                    <a href={typeof data?.link === 'string' && data.link ? data.link : '#'} target="_blank"
                       rel="noopener noreferrer"
                       className="text-xs text-blue-600 hover:text-blue-800 visited:text-purple-600">
                        {data?.snippet}&nbsp;
                        <FontAwesomeIcon icon={faArrowUpRightFromSquare} size="xs"/>
                    </a>
                </div>
            </div>
        </div>);
}
