// app/[lang]/report/[report_id]/page.tsx
import {SessionProvider} from "@/app/context/sessionContext";
import TopNavBar from "@/components/TopNavBar";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faClipboardQuestion} from "@fortawesome/free-solid-svg-icons";
import Markdown from "@/lib/mark-down";
import ReferenceCard from "@/components/ReferenceCard";
import DerivedQuestionCard from "@/components/DerivedQuestionCard";
import React from "react";

export async function loader({ params, fetch }) {
    // API 请求获取报告和字典数据
    const reportResponse = await fetch(`/api/report?id=${params.report_id}`);
    const dictionaryResponse = await fetch(`/api/dictionary?lang=${params.lang}`);

    if (!reportResponse.ok) {
        throw new Error(`Failed to fetch report, status: ${reportResponse.status}`);
    }

    const report = await reportResponse.json();
    const dictionary = await dictionaryResponse.json();

    return {
        props: { report, dictionary, lang: params.lang },
    };
}

function ReportPage({ report, dictionary, lang }) {
    // 客户端逻辑和事件处理
    const handleSearch = () => {
        // 实现搜索逻辑
    };

    return (
        <div className="flex min-h-screen">
            <SessionProvider>
                <TopNavBar
                    searchTerms=""
                    setSearchTerms={null}
                    onSearch={null}
                    searchInputRef={null}
                    lang={lang?.toLowerCase() || 'en'}
                />
            </SessionProvider>

            <div className="flex-1 mx-auto sm:p-4 pt-20 sm:pt-24 text-customBlackText max-w-6xl">
                <div className="px-8 py-5 sm:px-6 overflow-hidden sm:rounded-lg bg-customWhite2 shadow mt-4">
                    <h2 className="text-lg font-medium text-gray-800 mb-4">
                        <FontAwesomeIcon className="text-customOrange mr-2" icon={faClipboardQuestion}/>
                        {"这是个问题"}
                    </h2>
                    <div className="prose mt-2 max-w-none pb-4">
                        <Markdown content={'这是搜索总结'} referenceData={[]}/>
                    </div>
                    <h4 className='text-sm'>{dictionary?.search.refInfo}</h4>
                    <div className="flex flex-wrap justify-center overflow-x-auto pt-2 pb-2">
                        {Array(8).fill(null).map((_, index) => (
                            <ReferenceCard key={index} data={null}/>
                        ))}
                    </div>
                    <h4 className='text-sm'>{dictionary?.search.moreQs}</h4>
                    <div className="flex flex-wrap justify-center pt-2">
                        {Array(1).fill(null).map((_, index) => (
                            <DerivedQuestionCard key={index} question={null} onSearch={null}/>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReportPage;