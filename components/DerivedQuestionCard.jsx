import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

function DerivedQuestionCard({ question }) {
    return (
        <div className="flex items-center bg-white shadow-lg rounded-lg p-3 m-2">
            <p className="flex-grow text-gray-800">{question.text}</p>
            <a href={question.moreInfoLink} className="flex-shrink-0 text-blue-500 hover:text-blue-700">
                <FontAwesomeIcon icon={faInfoCircle} />
            </a>
        </div>
    );
}

export default DerivedQuestionCard;
