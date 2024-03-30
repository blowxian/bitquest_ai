import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSearch} from '@fortawesome/free-solid-svg-icons';

const SearchInput = ({searchTerms, setSearchTerms, onSearch, searchInputRef}) => {

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            onSearch();
        }
    };

    return (
        <div className="flex-1 mx-2 sm:mx-4 flex items-center relative w-3/4">
            <input
                ref={searchInputRef}
                type="text"
                placeholder="Phind"
                value={searchTerms}
                onChange={(e) => setSearchTerms(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-gray-700 text-white border border-gray-600 focus:outline-none rounded-full py-2 pl-4 pr-10 w-full"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="hidden sm:inline mr-2 text-sm text-gray-400">⌘ + K</span>
                <button className="p-2 text-xl" onClick={onSearch}>
                    <FontAwesomeIcon icon={faSearch} className="text-gray-400 hover:text-white"/>
                </button>
            </div>
        </div>
    );
};

export default SearchInput;
