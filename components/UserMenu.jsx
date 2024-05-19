// /app/[lang]/checkout/page.tsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { signIn, signOut, useSession } from "next-auth/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightToBracket, faCrown } from "@fortawesome/free-solid-svg-icons";
import { faXTwitter, faGoogle } from "@fortawesome/free-brands-svg-icons";
import Overlay from '@/components/Overlay';

const UserMenu = ({ loginBtnHoverColorClass = '' }) => {
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

    const { data: session, status } = useSession();
    const loading = status === "loading";

    const isPro = session && session.user && session.user.isPro;

    const [isOverlayVisible, setIsOverlayVisible] = useState(false);

    const handleOpenOverlay = () => {
        setIsOverlayVisible(true);
    };

    const handleCloseOverlay = () => {
        setIsOverlayVisible(false);
    };

    return (
        <div ref={menuRef} className="relative ml-2 sm:ml-16">
            {session ? (
                <div className="relative"> {/* 保持这个div用于定位下拉菜单 */}
                    <div className="flex items-center space-x-4"> {/* Flex container for "Pro" button and avatar */}
                        {!isPro && (
                            <button className={`py-2 px-0 text-sm leading-7 text-gray-400 line-through hover:text-customBlackText hover:no-underline hover:text-xl transition-all duration-150 ease-in-out`}
                                    onClick={() => handleOpenOverlay()}>
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
                            <div>
                                <button className="block px-4 py-2 text-customBlackText hover:bg-customWhite w-full"
                                        onClick={() => signOut()}>
                                    Sign out <FontAwesomeIcon icon={faRightToBracket} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <>
                    <button className={`p-2 text-customBlackText ${loginBtnHoverColorClass} opacity-50 hover:opacity-100 transition duration-150 ease-in-out`}
                            onClick={() => signIn('twitter')}><FontAwesomeIcon icon={faXTwitter} /></button>
                    <button className={`p-2 text-customBlackText ${loginBtnHoverColorClass} opacity-50 hover:opacity-100 transition duration-150 ease-in-out`}
                            onClick={() => signIn('google')}><FontAwesomeIcon icon={faGoogle} /></button>
                </>
            )}
            {isOverlayVisible && <Overlay onClose={handleCloseOverlay} />}
        </div>
    );
};

export default UserMenu;