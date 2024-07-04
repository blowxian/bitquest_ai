// components/SponsorButton.tsx

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { logEvent } from '@/lib/ga_log';

const getUserInfo = () => {
    const userAgent = navigator.userAgent;
    const deviceType = /Mobi|Android/i.test(userAgent) ? 'Mobile' : 'Desktop';
    const language = navigator.language;
    const platform = navigator.platform;
    const timestamp = new Date().toISOString();
    const pageUrl = window.location.href;

    return {
        userAgent,
        deviceType,
        language,
        platform,
        timestamp,
        pageUrl,
    };
};

const SponsorButton = () => {
    const handleClick = (linkType) => {
        const userInfo = getUserInfo();
        logEvent('click', 'PromotionButton', linkType, JSON.stringify(userInfo));
        console.log('User Info:', userInfo);
    };

    return (
        <div className="bg-[#F7EDE8] flex items-center justify-center mt-5 w-3/4">
            <button
                className="bg-[#737E91] text-xs text-gray-300 hover:text-white transition duration-150 ease-in-out py-2 px-4 rounded-lg shadow"
                onClick={() => handleClick('Desktop')}
            >
                <a
                    href="https://monica.im?utm=phind-ai-gas"
                    className="hidden md:block"
                    target="_blank"
                    rel="sponsored"
                    onClick={(e) => { e.stopPropagation(); handleClick('Desktop') }}
                >
                    Start Your Free Trial of GPT-4o, Claude3 Opus, and Gemini Pro in One App
                    <FontAwesomeIcon className="ml-1" icon={faArrowUpRightFromSquare} />
                </a>
                <a
                    href="https://app.adjust.com/1euq8c9j"
                    className="block md:hidden"
                    target="_blank"
                    rel="sponsored"
                    onClick={(e) => { e.stopPropagation(); handleClick('Mobile') }}
                >
                    Start Your Free Trial of GPT-4o, Claude3 Opus, and Gemini Pro in One App
                    <FontAwesomeIcon className="ml-1" icon={faArrowUpRightFromSquare} />
                </a>
            </button>
        </div>
    );
};

export default SponsorButton;