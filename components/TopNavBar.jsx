// /components/TopNavBar.jsx
import React, {useEffect, useState} from 'react';
import SearchInput from './SearchInput';
import UserMenu from './UserMenu';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronDown} from "@fortawesome/free-solid-svg-icons";
import {useSessionContext} from "@/app/context/sessionContext";
import models from '@/lib/models';
import Cookie from 'js-cookie';

const TopNavBar = ({searchTerms, setSearchTerms, onSearch, searchInputRef}) => {
    const {data: session, status} = useSessionContext();
    const loading = status === "loading";
    const [isPro, setIsPro] = useState(false);

    useEffect(() => {
        if (!loading && session) {
            console.log('session@SearchBar: ', session);

            // 确保 session 数据存在且已加载
            if (status === 'authenticated' && session) {
                // @ts-ignore
                const proStatus = session.user?.subscriptions?.some(sub => new Date(sub.endDate) > new Date());
                setIsPro(proStatus || false);

                console.log("session:", session);
                console.log("isPro:", isPro);
            }
        }
    }, [session, loading]);

    useEffect(() => {
        console.log("Updated isPro:", isPro);  // This logs the updated state after changes
    }, [isPro]); // Dependency array includes isPro

    useEffect(() => {
        const savedModel = Cookie.get('selectedModel');
        const modelSelectElement = document.querySelector('select');
        if (savedModel && modelSelectElement) {
            modelSelectElement.value = savedModel;
        }
    }, []);

    const getAvailableModels = () => {
        // 如果是 Pro 用户，返回 free 和 pro 层级的模型
        if (isPro) {
            return Object.entries(models).filter(([key, value]) => value.tier === 'free' || value.tier === 'pro');
        }
        // 否则，只返回 free 层级的模型
        return Object.entries(models).filter(([key, value]) => value.tier === 'free');
    };

    const handleModelChange = (event) => {
        const selectedModel = event.target.value;
        Cookie.set('selectedModel', selectedModel, { expires: 30 }); // Cookie 过期时间为 7 天
        // 其他可能的处理逻辑
    };

    return (
        <div className="fixed left-1/2 transform -translate-x-1/2 p-0 sm:p-4 w-full z-20 sm:max-w-6xl">
            <div className="bg-customBlack sm:rounded-lg p-4 w-full flex items-center justify-between shadow">
                <a href="/" className="hidden sm:flex text-customWhite2 text-2xl font-semibold mr-16">Phind AI</a>
                <div className="relative">
                    <select
                        className="bg-customBlack text-white appearance-none pl-0 pr-[1.5rem] py-2 h-10 w-[6rem] overflow-hidden outline-none"
                        onChange={handleModelChange}>
                        {getAvailableModels().map(([key, model]) => (
                            <option key={key} value={key}>{model.identifier.split('/')[1]}</option>
                        ))}
                    </select>
                    <FontAwesomeIcon
                        icon={faChevronDown}
                        className="text-white inset-y-0 pointer-events-none absolute left-[5rem] top-3"
                    />
                </div>
                <SearchInput searchTerms={searchTerms} setSearchTerms={setSearchTerms} onSearch={onSearch}
                             searchInputRef={searchInputRef}/>
                <UserMenu loginBtnHoverColorClass={"hover:text-customWhite"}/>
            </div>
        </div>
    );
};

export default TopNavBar;
