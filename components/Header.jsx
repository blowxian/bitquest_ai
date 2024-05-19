// 站点通用头部菜单
import Image from "next/image";

const Header = ({headerDict}) => {
    return (
        <header className="pb-6 w-full mt-52 sm:mt-72 flex flex-col items-center">
            <div className="px-4 sm:px-8 h-20">
                <a href="/" title={headerDict?.slogan}>
                    <Image
                        className="w-auto h-12 sm:h-16"
                        src="/img/coogle_ai_logo.svg"
                        width={140}
                        height={27}
                        alt=""
                        priority
                    />
                </a>
            </div>
            <h1 className="text-xl">phind ai cheap alternative</h1>
            <h2 className="hidden sm:block text-center text-gray-400 text-xs mt-2">Make AI Search Affordable For Everyone,Everywhere</h2>
        </header>
    )
}

export default Header;