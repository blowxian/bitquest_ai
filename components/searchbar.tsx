'use client';

import {useSearchParams, useRouter} from 'next/navigation';

export default function SearchBar({placeholder}: { placeholder: string }) {
    const searchParams = useSearchParams();
    const {replace} = useRouter();

    function handleSearch(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            const params = new URLSearchParams(searchParams);
            const term = (e.target as HTMLInputElement)?.value;

            if (term) {
                params.set('q', term);
            } else {
                params.delete('q');
            }
            replace(`/search?${params.toString()}`);
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
                    defaultValue={searchParams.get('q')?.toString()}
                />
                <button
                    className="absolute inset-y-0 right-0 flex items-center rounded-r-xl border-l border-gray-300 hover:border-gray-400 bg-gray-200 hover:bg-gray-300 px-6 font-bold">
                    →
                </button>
            </div>
        </div>
    )
}