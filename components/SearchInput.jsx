import React, {useEffect, useRef} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSearch} from '@fortawesome/free-solid-svg-icons';
import {useRouter, useSearchParams} from 'next/navigation';

const SearchInput = ({lang = 'en', searchTerms = ''}) => {
    const searchInputRef = useRef(null);
    const searchParams = useSearchParams();
    const router = useRouter();  // Add this line

    useEffect(() => {
        searchInputRef.current.value = searchTerms || searchParams?.get('q');

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, []);

    const handleSearch = () => {
        if(!searchInputRef.current.value || (searchInputRef.current.value === searchParams?.get('q'))){
            return;
        }

        router.push(`/${lang}/search?q=${encodeURIComponent(searchInputRef.current.value)}`);
    };

    const handleGlobalKeyDown = (event) => {
        if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
            event.preventDefault();
            searchInputRef.current?.focus();
            searchInputRef.current?.select();
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="flex-1 mx-4 sm:mx-4 flex items-center absolute sm:relative top-12 sm:top-0 w-5/6">
            <input
                ref={searchInputRef}
                type="text"
                placeholder="Phind"
                onKeyDown={handleKeyDown}
                className="bg-gray-700 text-white border border-gray-600 focus:outline-none rounded-full py-2 pl-4 pr-10 w-full"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="hidden sm:inline mr-2 text-sm text-gray-400">⌘ + K</span>
                <button className="p-2 text-xl" onClick={handleSearch}>
                    <FontAwesomeIcon icon={faSearch} className="text-gray-400 hover:text-white"/>
                </button>
            </div>
        </div>
    );
};

export default SearchInput;
