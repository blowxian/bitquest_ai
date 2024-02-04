import Header from '@/components/header'
import SearchBar from "@/components/searchbar";
import {Suspense} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMessage} from "@fortawesome/free-solid-svg-icons";

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
            <div className="w-full items-center flex flex-col">
                <Header/>
                <Suspense>
                    <SearchBar/>
                </Suspense>
            </div>
            <div className="mb-32 text-center lg:w-full lg:mb-0">
                <a
                    href="mailto:lisonallen@qq.com"
                    className="rounded-lg border border-transparent px-5 py-4 transition-colors hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <p className="m-0 text-sm opacity-50 leading-normal">
                        <FontAwesomeIcon icon={faMessage}/> Noodlion
                    </p>
                </a>
            </div>
        </main>
    )
}
