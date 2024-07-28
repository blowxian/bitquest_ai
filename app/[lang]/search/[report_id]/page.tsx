// app/[lang]/report/[report_id]/page.tsx
import {SessionProvider} from "@/app/context/sessionContext";
import TopNavBar from "@/components/TopNavBar";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faClipboardQuestion} from "@fortawesome/free-solid-svg-icons";
import {marked} from 'marked';
import ReferenceCard from "@/components/ReferenceCard";
import DerivedQuestionCard from "@/components/DerivedQuestionCard";
import {getDictionary} from "@/app/[lang]/dictionaries";
import React from "react";

const replaceReferences = (text, referenceData) => {
    const parts = text.split(/\[citation:(\d+)\]/g);

    return parts.map((part, index) => {
        if ((index % 2) === 1) {
            const refNumber = parseInt(part, 10) - 1;
            const refLink = referenceData ? referenceData[refNumber]?.link : '';
            if (refLink) {
                // 转换为 Markdown 链接格式
                return ` [<span class="text-blue-600 hover:text-blue-800 visited:text-purple-600 text-xs">[${refNumber + 1}]</span>](${encodeURI(refLink)})`;
            }
            return ``;
        }
        return part;
    }).join('');
}

async function ReportPage({params}) {
    // API 请求获取报告和字典数据
    const reportResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/report?id=${encodeURIComponent(params.report_id)}`, {
        headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
    });

    if (reportResponse.status === 404) {
        throw new Error('ReportNotFound');
    } else if (!reportResponse.ok) {
        throw new Error(`Failed to fetch report, status: ${reportResponse.status}`);
    }

    const report = await reportResponse.json();
    console.log('report: ', report, 'reportData:', report.content, 'lang: ', params.lang);

    const reportData = JSON.parse(report.content);
    const dictionary = await getDictionary(params.lang);

    return (
        <div className="flex min-h-screen">
            <SessionProvider>
                <TopNavBar
                    lang={params.lang?.toLowerCase() || 'en'}
                    searchTerms={''}
                />
            </SessionProvider>

            <div className="flex-1 mx-auto sm:p-4 pt-20 sm:pt-24 text-customBlackText max-w-6xl">
                <div className="px-8 py-5 sm:px-6 overflow-hidden sm:rounded-lg bg-customWhite2 shadow mt-4">
                    <h2 className="text-lg font-medium text-gray-800 mb-4">
                        <FontAwesomeIcon className="text-customOrange mr-2" icon={faClipboardQuestion}/>
                        {report.title}
                    </h2>
                    <div className="prose mt-2 max-w-none pb-4">
                        <div
                            dangerouslySetInnerHTML={{__html: marked(replaceReferences(reportData.data, reportData.referenceData))}}/>
                    </div>
                    <h4 className='text-sm'>{dictionary?.search.refInfo}</h4>
                    <div className="flex flex-wrap justify-center overflow-x-auto pt-2 pb-2">
                        {reportData.referenceData.map((data, index) => (
                            <ReferenceCard key={index} data={data}/>
                        ))}
                    </div>
                    <h4 className='text-sm'>{dictionary?.search.moreQs}</h4>
                    <div className="flex flex-wrap justify-center pt-2">
                        {reportData.derivedQuestions.map((question, index) => (
                            <DerivedQuestionCard key={index} question={question}
                                                 lang={params.lang?.toLowerCase() || 'en'}/>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReportPage;