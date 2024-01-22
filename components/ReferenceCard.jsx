import React from 'react';

export default function ReferenceCard({data}) {
    return (
        <div className="flex-none w-64 bg-white rounded-lg shadow p-4 m-2">
            <img src={data.pagemap?.cse_thumbnail?.length ? data.pagemap?.cse_thumbnail[0]?.src : ""} alt={data.title}
                 className="h-32 rounded-lg w-full object-cover"/>
            <h3 className="mt-2 text-lg font-semibold">{data.title}</h3>
            <p className="text-sm text-gray-600">{data.snippet}</p>
            <a href={data.link} className="text-blue-600 hover:text-blue-800 visited:text-purple-600">了解更多</a>
        </div>
    );
}