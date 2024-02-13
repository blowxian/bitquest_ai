import Header from '@/components/header'
import SearchBar from "@/components/searchbar";
import {Suspense} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBlog, faCommentDots, faComments, faMessage} from "@fortawesome/free-solid-svg-icons";

export async function generateMetadata() {
    return {
        verification: {
            google: 'XlVgQsgr-59VgeJdUJ6u_DkzHTdT144bB7PJGWIMhDM',
        }
    }
}

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-between">
            <div className="w-full items-center justify-between flex flex-col sm:px-8">
                <Header/>
                <Suspense>
                    <SearchBar/>
                </Suspense>
            </div>
            <div className="mb-32 text-center w-full sm:mb-0">
                <div className="flex justify-center space-x-4 text-lg sm:text-sm">
                    <a href="https://coogle.ai/blog"
                       className="link px-5 py-4 opacity-50 hover:opacity-100 transition duration-150 ease-in-out"
                       target="_blank">
                        <span><FontAwesomeIcon icon={faBlog}/> <span className="hidden sm:inline-block">Blog</span></span>
                    </a>
                    <a href="https://coogle.ai/blog/forums"
                       className="link px-5 py-4 opacity-50 hover:opacity-100 transition duration-150 ease-in-out"
                       target="_blank">
                        <span><FontAwesomeIcon icon={faComments}/> <span className="hidden sm:inline-block">Forum</span></span>
                    </a>
                    <a href="https://coogle.ai/blog/forums/topic/hi-everyone-%ef%bc%8cwe-want-your-advice"
                       className="link px-5 py-4 opacity-50 hover:opacity-100 transition duration-150 ease-in-out"
                       target="_blank">
                        <span><FontAwesomeIcon icon={faCommentDots}/> <span className="hidden sm:inline-block">Feedback</span></span>
                    </a>
                </div>
            </div>
        </main>
    )
}
