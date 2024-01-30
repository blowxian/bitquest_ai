import React from 'react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowUpRightFromSquare} from "@fortawesome/free-solid-svg-icons";

export default function ReferenceCard({data}) {
    const imageUrl = data.pagemap?.cse_thumbnail?.length ? data.pagemap.cse_thumbnail[0].src : "";

    return (
        <div className="flex-none w-64 bg-customWhite2 rounded-lg shadow p-4 m-2">
            {imageUrl && (
                <img src={imageUrl} alt={data.title}
                     className="h-32 rounded-lg w-full object-cover"/>
            )}
            <h3
                className="mt-2 text-lg font-semibold">{data.title} <a href={data.link}  target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 visited:text-purple-600"><FontAwesomeIcon
                icon={faArrowUpRightFromSquare} size="xs"/></a></h3>
            <p className="text-sm text-gray-600">{data.snippet}</p>

        </div>
    );
}