// components/LinkButton.jsx

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const LinkButton = ({ href, icon, label }) => {
    return (
        <a href={href}
           className="link px-5 py-4 opacity-50 hover:opacity-100 transition duration-150 ease-in-out"
           target="_blank" rel="noopener noreferrer">
            <span><FontAwesomeIcon icon={icon}/> <span className="hidden sm:inline-block">{label}</span></span>
        </a>
    );
};

export default LinkButton;
