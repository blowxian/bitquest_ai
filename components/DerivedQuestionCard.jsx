import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faClipboardQuestion} from '@fortawesome/free-solid-svg-icons';

function DerivedQuestionCard({question, onSearch}) {
    return (
        <button onClick={() => onSearch(question)}
                className="flex items-center bg-white shadow rounded-lg p-3 m-2">
            <p className="flex-grow text-gray-800 text-sm"><FontAwesomeIcon className="flex-shrink-0 text-blue-500 hover:text-blue-700" icon={faClipboardQuestion}/> {question}</p>
        </button>
    );
}

export default DerivedQuestionCard;
