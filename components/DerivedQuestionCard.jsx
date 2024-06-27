'use client'

import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faClipboardQuestion} from '@fortawesome/free-solid-svg-icons';

function DerivedQuestionCard({question, onSearch}) {
    return (
        <div className="w-full sm:w-1/4 px-1">
            <button onClick={() => onSearch(question)}
                    className="hover-icon flex items-center bg-customWhite shadow rounded-lg p-3 my-2 text-gray-400 hover:text-gray-800 transition duration-150 ease-in-out w-full">
                <p className="flex-grow text-sm text-left"><FontAwesomeIcon
                    className="flex-shrink-0 text-blue-400 pl-2 pr-3"
                    icon={faClipboardQuestion}/> {question}</p>
            </button>
        </div>
    );
}

export default DerivedQuestionCard;
