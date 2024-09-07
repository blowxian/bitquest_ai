// /components/TopNavBar.jsx
'use client'

import React, { useEffect, useState } from 'react';
import SearchInput from './SearchInput';
import UserMenu from './UserMenu';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { useSessionContext } from "@/app/context/sessionContext";
import models from '@/lib/models';
import Cookie from 'js-cookie';
import Overlay from './Overlay'; // 引入 Overlay 组件

const TopNavBar = ({ lang = 'en', searchTerms = '' }) => {
    const { data: session, status } = useSessionContext();
    const loading = status === "loading";
    const [isPro, setIsPro] = useState(false);
    const [selectedModel, setSelectedModel] = useState('');
    const [showOverlay, setShowOverlay] = useState(false); // 新增状态控制 Overlay 的显示

    useEffect(() => {
        if (!loading && session) {
            // 确保 session 数据存在且已加载
            if (status === 'authenticated' && session) {
                // @ts-ignore
                const proStatus = session.user?.subscriptions?.some(sub => new Date(sub.endDate) > new Date());
                setIsPro(proStatus || false);
            }
        }
    }, [session, loading]);

    useEffect(() => {
        const savedModel = Cookie.get('selectedModel');
        const modelSelectElement = document.querySelector('select');
        if (savedModel && modelSelectElement) {
            modelSelectElement.value = savedModel;
        }
    }, []);

    const getAvailableModels = () => {
        return Object.entries(models).map(([key, value]) => ({
            key,
            name: `${value.name || value.identifier.split('/')[1]}${!isPro && value.tier === 'pro' ? ' (Pro)' : ''}`
        }));
    };

    const handleModelChange = (event) => {
        const newSelectedModel = event.target.value;
        const modelTier = models[newSelectedModel].tier;

        if (modelTier === 'pro' && !isPro) {
            setShowOverlay(true);
            event.target.value = selectedModel; // 保持选择不变
            return;
        }

        setSelectedModel(newSelectedModel);
        Cookie.set('selectedModel', newSelectedModel, { expires: 30 });
    };

    return (
        <div className="fixed left-1/2 transform -translate-x-1/2 p-0 sm:p-4 w-full z-20 sm:max-w-6xl">
            <div className="bg-customBlack sm:rounded-lg pt-0 pb-14 px-4 sm:p-4 w-full flex items-center justify-between shadow">
                <a href="/" className="hidden sm:flex text-customWhite2 text-2xl font-semibold mr-16">Phind AI</a>
                <div className="relative">
                    <select
                        value={selectedModel}
                        className="bg-customBlack text-white appearance-none pl-0 pr-0 py-2 h-10 w-[9.5rem] overflow-hidden outline-none"
                        onChange={handleModelChange}>
                        {getAvailableModels().map((model) => (
                            <option key={model.key} value={model.key}>{model.name}</option>
                        ))}
                    </select>
                    <FontAwesomeIcon
                        icon={faChevronDown}
                        className="text-white inset-y-0 pointer-events-none absolute left-[8.5rem] top-3"
                    />
                </div>
                <SearchInput lang={lang?.toLowerCase()} searchTerms={searchTerms} />
                <UserMenu loginBtnHoverColorClass={"hover:text-customWhite"} lang={lang?.toLowerCase()} isTopNav={true} />
            </div>
            {showOverlay && <Overlay onClose={() => setShowOverlay(false)} lang={lang?.toLowerCase()} />}
        </div>
    );
};

export default TopNavBar;
