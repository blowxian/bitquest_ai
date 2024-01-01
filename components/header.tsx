// 站点通用头部菜单
import Image from "next/image";

export default function Header() {
    return (
        <header className="pb-6 w-full lg:pb-0 mt-80">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <nav className="flex justify-center items-center h-20">
                    <div className="">
                        <a href="/bitquest_ai/public" title="">
                            <Image
                                className="w-auto h-16"
                                src="/coogle_logo.svg"
                                width={140}
                                height={27}
                                alt=""
                                priority
                            />
                        </a>
                    </div>
                </nav>
            </div>
        </header>
    )
}