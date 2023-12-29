import Header from '../components/header'

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-between">
            <Header/>

            {/* Search Box */}
            <div className="w-full max-w-4xl mb-36">
                <div className="relative flex items-center rounded-xl border border-gray-100 bg-gray-100 p-4">
                    <input
                        type="text"
                        className="w-full py-4 pl-10 pr-10 mr-16 text-lg border-none focus:ring-0 focus:outline-none  bg-gray-100"
                        placeholder="请输入搜索内容..."
                    />
                    <button className="absolute inset-y-0 right-0 flex items-center rounded-r-xl border-l border-gray-300 bg-gray-200 px-6 font-bold">
                        →
                    </button>
                </div>
            </div>

            <div className="mb-32 text-center lg:w-full lg:mb-0 lg:text-center">
                <a
                    href="mailto:lisonallen@qq.com"
                    className="rounded-lg border border-transparent px-5 py-4 transition-colors hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <p className={`m-0 text-sm opacity-50`}>
                        &copy;Noodlion
                    </p>
                </a>
            </div>
        </main>
    )
}
