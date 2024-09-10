import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardQuestion } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

function DerivedQuestionCard({ question, lang }) {
    return (
        <div className="w-full sm:w-1/4 px-1 py-2">
            <Link
                className="hover-icon flex items-center bg-customWhite shadow rounded-lg p-3 my-2 text-gray-400 hover:text-gray-800 transition duration-150 ease-in-out w-full h-full"
                href={`/${lang}/search?q=${encodeURIComponent(question)}`} passHref>
                <p className="flex flex-grow items-center text-sm text-left">
                    <FontAwesomeIcon
                        className="flex-shrink-0 text-blue-400 pl-2 pr-5"
                        icon={faClipboardQuestion} /> {question}
                </p>
            </Link>
        </div>
    );
}

export default DerivedQuestionCard;