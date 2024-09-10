// components/LinkButton.jsx

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const LinkButton = ({ href, icon, label, external = false }) => {
    return (
        <a href={href}
            className="link px-3 py-2 m-1 opacity-50 hover:opacity-100 transition duration-150 ease-in-out flex items-center"
            target={external ? "_blank" : "_self"}
            rel={external ? "noopener noreferrer" : ""}>
            <FontAwesomeIcon icon={icon} className="mr-2" />
            <span className="hidden sm:inline-block">{label}</span>
        </a>
    );
};

export default LinkButton;
