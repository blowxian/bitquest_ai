import React from 'react';
import SearchInput from './SearchInput';
import UserMenu from './UserMenu';
import {SessionProvider} from "next-auth/react";

const TopNavBar = ({searchTerms, setSearchTerms, onSearch, searchInputRef}) => {
    return (
        <div className="fixed left-1/2 transform -translate-x-1/2 p-0 sm:p-4 w-full z-50 sm:max-w-6xl">
            <div className="bg-customBlack sm:rounded-lg p-4 w-full flex items-center justify-between shadow">
                <a href="/" className="hidden sm:flex text-customWhite2 text-2xl font-semibold mr-16">Coogle.AI</a>
                <SearchInput searchTerms={searchTerms} setSearchTerms={setSearchTerms} onSearch={onSearch} searchInputRef={searchInputRef}/>
                <SessionProvider>
                    <UserMenu/>
                </SessionProvider>
            </div>
        </div>
    );
};

export default TopNavBar;
