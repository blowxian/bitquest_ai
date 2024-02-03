import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";

export default function ReferenceCard({ data }) {
    const imageUrl = data.pagemap?.cse_thumbnail?.length ? data.pagemap.cse_thumbnail[0].src : "https://via.placeholder.com/200x160";

    return (
        <div className="group relative bg-customWhite rounded-lg shadow p-4 m-2 w-64 overflow-y-hidden">
            <div className="flex">
                {imageUrl && (
                    <img src={imageUrl} alt={data.title} className="flex-none h-16 w-20 rounded-lg object-contain mr-4"/>
                )}
                <div className={`flex-grow ${!imageUrl ? 'text-center' : ''}`}>
                    <h3 className="text-xs font-semibold">
                        {data.title}
                    </h3>
                </div>
            </div>
            <div className="absolute bottom-0 transform translate-y-full left-0 right-0 bg-white p-2 rounded-lg shadow-md mt-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 z-10 transition-all duration-300">
                <p className="text-xs text-gray-600">{data.snippet}&nbsp;<a href={data.link} target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-blue-600 hover:text-blue-800 visited:text-purple-600">
                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} size="xs"/>
                </a></p>
            </div>
        </div>
    );
}
