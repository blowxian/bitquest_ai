import Header from '@/components/header'
import SearchBar from "@/components/searchbar";
import {Suspense} from "react";
import {faBlog, faCommentDots, faComments} from "@fortawesome/free-solid-svg-icons";
import LinkButton from "@/components/LinkButton";

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
            <div className="mb-32 text-center w-full sm:mb-2">
                <div className="flex justify-center space-x-4 text-sm">
                    <LinkButton href="https://coogle.ai/blog" icon={faBlog} label="Blog"/>
                    <LinkButton href="https://coogle.ai/blog/forums" icon={faComments} label="Forum"/>
                    <LinkButton href="https://coogle.ai/blog/forums/topic/hi-everyone-%ef%bc%8cwe-want-your-advice"
                                icon={faCommentDots} label="Feedback"/>
                </div>
            </div>
        </main>
    )
}
