// HotQuestionCard.tsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardQuestion } from '@fortawesome/free-solid-svg-icons';

interface HotQuestionCardProps {
    searchTerm: string;
    onSearch: (searchTerm: string) => void; // External onSearch function passed as a prop
}

const HotQuestionCard: React.FC<HotQuestionCardProps> = ({ searchTerm, onSearch }) => {
    return (
        <button
            onClick={() => onSearch(searchTerm)}
            className="hover-icon flex items-center bg-customWhite shadow rounded-lg p-3 m-2 text-gray-400 hover:text-gray-800 transition duration-150 ease-in-out w-full sm:w-80"
        >
            <p className="flex-grow text-sm text-left">
                <FontAwesomeIcon className="flex-shrink-0 text-blue-400 pr-2" icon={faClipboardQuestion}/>
                {searchTerm}
            </p>
        </button>
    );
};

export default HotQuestionCard;
