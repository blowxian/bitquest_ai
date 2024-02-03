import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faClipboardQuestion} from '@fortawesome/free-solid-svg-icons';

function DerivedQuestionCard({question, onSearch}) {
    return (
        <button onClick={() => onSearch(question)}
                className="hover-icon flex items-center bg-customWhite shadow rounded-lg p-3 m-2 text-gray-400 hover:text-gray-800 transition duration-150 ease-in-out">
            <p className="flex-grow text-sm"><FontAwesomeIcon className="flex-shrink-0 text-blue-400 pr-2" icon={faClipboardQuestion}/> {question}</p>
        </button>
    );
}

export default DerivedQuestionCard;
