import React, {useState, useRef} from 'react';

const UserMenu = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <div ref={menuRef} className="relative">
            <button onClick={toggleMenu} className="rounded-full focus:outline-none focus:ring">
                <img
                    src="https://imagedelivery.net/MPdwyYSWT8IY7lxgN3x3Uw/a9572d6d-2c7f-408b-2f17-65d1e09d9500/thumbnail" // 替换成您的账号头像路径
                    alt="Your Avatar"
                    className="w-8 h-8 rounded-full sm:w-10 sm:h-10"
                />
            </button>
            {isMenuOpen && (
                <div className="absolute right-0 mt-2 py-2 w-48 bg-white shadow-lg rounded-lg">
                    <a href="#" className="block px-4 py-2 text-customBlackText hover:bg-customWhite">注销</a>
                </div>
            )}
        </div>
    );
};

export default UserMenu;
