// 站点通用头部菜单
import Image from "next/image";

const Header = ({headerDict}) => {
    return (
        <header className="pb-6 w-full mt-52 sm:mt-72 flex flex-col items-center">
            <div className="px-4 sm:px-8 h-20">
                <a href="/" title={headerDict?.slogan}>
                    <Image
                        className="w-auto h-12 sm:h-16"
                        src="/img/phind_ai_alter_logo.svg"
                        width={140}
                        height={27}
                        alt=""
                        priority
                    />
                </a>
            </div>
            <p className="hidden sm:block text-center text-gray-400 text-sm">{headerDict?.slogan}</p>
        </header>
    )
}

export default Header;