// /components/UserMenu.jsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { signIn, signOut, useSession } from "next-auth/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightToBracket, faCrown, faFire } from "@fortawesome/free-solid-svg-icons";
import { faXTwitter, faGoogle } from "@fortawesome/free-brands-svg-icons";
import Overlay from '@/components/Overlay';
import { useSessionContext } from '@/app/context/sessionContext';
import Image from 'next/image';
import VisitorTracker from './VisitorTracker';

const UserMenu = ({ loginBtnHoverColorClass = '', lang = 'en', isTopNav = false }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const toggleMenu = useCallback(() => setIsMenuOpen(!isMenuOpen), [isMenuOpen]);
    const menuRef = useRef(null);

    const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
            setIsMenuOpen(false);
        }
    };

    useEffect(() => {
        window.addEventListener('mousedown', handleClickOutside);
        return () => window.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const { data: session, status, refreshSession } = useSessionContext();
    const loading = status === "loading";

    useEffect(() => {
        if (!loading && session) {
            console.log('session@UserMenu: ', session);
        }
    }, [session, loading]);

    const [isOverlayVisible, setIsOverlayVisible] = useState(false);

    const handleOpenOverlay = () => {
        setIsOverlayVisible(true);
    };

    const handleCloseOverlay = () => {
        setIsOverlayVisible(false);
    };

    // 判断用户是否为 Pro，确保至少有一个订阅在有效期内
    const isPro = session?.user?.subscriptions?.some(sub => new Date(sub.endDate) > new Date());

    const AIGirlDanceLink = () => (
        <a
            href="https://vidustudio.co/text-to-video/ai-girl-video"
            target="_blank"
            className={`mr-4 flex items-center group relative ${isTopNav ? 'text-customWhite2 hover:text-customWhite' : 'text-gray-700 hover:text-gray-900'
                }`}
        >
            <span className="absolute -top-2 -left-2 text-red-500 text-xs sm:hidden z-10">
                <FontAwesomeIcon icon={faFire} className="animate-pulse" />
            </span>
            <span className="absolute -top-2 -left-2 bg-red-500 text-white text-xs px-1 rounded animate-bounce hidden sm:inline-block z-10">
                <FontAwesomeIcon icon={faFire} className="mr-1" />
                HOT
            </span>
            <div className="relative w-6 h-6 mr-2 transform group-hover:scale-110 transition-transform duration-200">
                <Image
                    src="/img/ai-girl-dance.svg"
                    alt="AI Girl Dance"
                    layout="fill"
                    className={`${isTopNav ? 'filter-white group-hover:filter-bright-white' : 'filter-pink group-hover:filter-dark-pink'} transition-all duration-200`}
                />
            </div>
            <span className="text-sm font-medium transition-colors hidden sm:inline group-hover:underline">
                AI Girl Dance
            </span>
        </a>
    );

    return (
        <>
            <div ref={menuRef} className={`relative ml-2 sm:ml-16 flex items-center ${isTopNav ? 'text-customWhite2' : ''}`}>
                {session ? (
                    <div className="relative flex items-center">
                        <AIGirlDanceLink />
                        <div className="flex items-center space-x-4">
                            {isPro ? (
                                <FontAwesomeIcon icon={faCrown} className="text-customOrange text-xl text-shadow-default" />
                            ) : (
                                <button
                                    className={`py-2 px-0 text-sm leading-7 ${isTopNav ? 'text-gray-400 hover:text-customWhite' : 'text-gray-400 hover:text-customBlackText'} line-through hover:no-underline hover:text-xl transition-all duration-150 ease-in-out`}
                                    onClick={handleOpenOverlay}>
                                    <FontAwesomeIcon icon={faCrown} /> Pro
                                </button>
                            )}
                            <button onClick={toggleMenu}
                                className="flex items-center justify-center p-2 -m-2 text-xl rounded-full focus:outline-none focus:ring">
                                <img
                                    src={session.user.image}
                                    alt={session.user.name}
                                    className="w-8 h-8 rounded-full"
                                />
                            </button>
                        </div>
                        {isMenuOpen && (
                            <div className="absolute right-0 mt-2 py-2 w-48 bg-white shadow-lg rounded-lg text-sm">
                                <button className="block px-4 py-2 text-customBlackText hover:bg-customWhite w-full"
                                    onClick={() => signOut()}>
                                    Sign out <FontAwesomeIcon icon={faRightToBracket} />
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center">
                        <AIGirlDanceLink />
                        <button
                            className={`p-2 ${isTopNav ? 'text-customWhite2' : 'text-customBlackText'} ${loginBtnHoverColorClass} opacity-50 hover:opacity-100 transition duration-150 ease-in-out`}
                            onClick={() => signIn('twitter')}><FontAwesomeIcon icon={faXTwitter} /></button>
                        <button
                            className={`p-2 ${isTopNav ? 'text-customWhite2' : 'text-customBlackText'} ${loginBtnHoverColorClass} opacity-50 hover:opacity-100 transition duration-150 ease-in-out`}
                            onClick={() => signIn('google')}><FontAwesomeIcon icon={faGoogle} /></button>
                    </div>
                )}
                {isOverlayVisible && <Overlay onClose={handleCloseOverlay} lang={lang?.toLowerCase() || 'en'} />}
            </div>
            <VisitorTracker />
        </>
    );
};

export default UserMenu;