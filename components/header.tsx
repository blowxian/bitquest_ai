// 站点通用头部菜单
import Image from "next/image";

export default function Header() {
    return (
        <header className="pb-6 w-full mt-72 sm:mt-96 flex flex-col items-center">
            <div className="px-4 sm:px-8 h-20">
                <a href="/" title="Make AI Search Affordable For Everyone,Everywhere">
                    <Image
                        className="w-auto h-14 sm:h-16"
                        src="/logo_final_v.svg"
                        width={140}
                        height={27}
                        alt=""
                        priority
                    />
                </a>
            </div>
            <p className="hidden sm:block text-center text-gray-400 text-sm">Make AI Search Affordable For Everyone,Everywhere</p>
        </header>
    )
}