'use client';

import React, {useState, useRef, useCallback, useEffect} from 'react';
import {signIn, signOut, useSession} from "next-auth/react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faRightToBracket} from "@fortawesome/free-solid-svg-icons";
import {faXTwitter, faGoogle} from "@fortawesome/free-brands-svg-icons";

const UserMenu = ({loginBtnHoverColorClass = ''}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = useCallback(() => {
        setIsMenuOpen(!isMenuOpen);
    }, [isMenuOpen]);

    const menuRef = useRef(null);

    // 点击外部关闭菜单的函数
    const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
            setIsMenuOpen(false);
        }
    };

    useEffect(() => {
        // 添加全局点击事件监听器
        window.addEventListener('mousedown', handleClickOutside);

        // 组件卸载时移除事件监听器
        return () => {
            window.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const {data: session, status} = useSession();
    const loading = status === "loading";
    console.log("session", session)

    return (
        <div ref={menuRef} className="relative ml-2 sm:ml-16">
            {!session ? (
                <>
                    <button className={`p-2 text-customBlackText ${loginBtnHoverColorClass} opacity-50 hover:opacity-100 transition duration-150 ease-in-out`}
                            onClick={() => signIn('twitter')}><FontAwesomeIcon icon={faXTwitter} /></button>
                    <button className={`p-2 text-customBlackText ${loginBtnHoverColorClass} opacity-50 hover:opacity-100 transition duration-150 ease-in-out`}
                            onClick={() => signIn('google')}><FontAwesomeIcon icon={faGoogle} /></button>
                </>
            ) : (
                <>
                    <button onClick={toggleMenu}
                            className="flex items-center justify-center p-2 -m-2 text-xl rounded-full focus:outline-none focus:ring">
                        <img
                            src={session.user.image} // 替换成您的账号头像路径
                            alt="Your Avatar"
                            className="w-8 h-8 rounded-full"
                        />
                    </button>
                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 py-2 w-48 bg-white shadow-lg rounded-lg text-sm">
                            <div>
                                <div>
                                    <h4 className="px-4 py-2 text-center">Hi, {session.user.name}</h4>
                                    <button className="block px-4 py-2 text-customBlackText hover:bg-customWhite w-full"
                                            onClick={() => signOut()}>Sign out <FontAwesomeIcon icon={faRightToBracket} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default UserMenu;
