'use client';

import {useSearchParams, useRouter} from 'next/navigation';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSearch} from "@fortawesome/free-solid-svg-icons";
import React, {useRef} from "react";

export default function SearchBar() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    function handleSearch(e: React.KeyboardEvent<HTMLInputElement> | null) {
        if (e && e.key === "Enter" || !e) {
            const params = new URLSearchParams(searchParams as URLSearchParams);
            const term = inputRef.current?.value;

            if (term) {
                params.set('q', term);
            } else {
                params.delete('q');
            }

            router.push(`/search?${params.toString()}`);
        }
    }

    return (
        <div className={"w-3/4 max-w-6xl"}>
            {/* 中间搜索框 */}
            <div className="flex-1 mx-4 flex items-center relative w-full">
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Coooooooogle"
                    className="bg-gray-700 text-white border border-gray-600 rounded-2xl py-8 pl-6 pr-28 w-full"
                    onKeyUp={(e) => {
                        handleSearch(e);
                    }}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="mr-4 text-sm text-gray-400">⌘ + K</span>
                    <button className="p-2 text-xl" onClick={() => handleSearch(null)}>
                        <FontAwesomeIcon icon={faSearch}
                                         className=" text-gray-400 hover:text-customWhite2 transition duration-150 ease-in-out"/>
                    </button>
                </div>
            </div>
        </div>
    )
}