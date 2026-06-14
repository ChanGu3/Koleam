import { Link } from "react-router-dom"

function TextLink({ className = "", label, pathname }) {
    return (
        <Link
            className={`${className} text-s-dark-secondary hover:text-s-tertiary active:text-s-tertiary visited:text-s-link-visited cursor-pointer`}
            to={{
                pathname: pathname,
            }}
        >
            {label}
        </Link>
    )
}

export function TextButton({ className = "", label, onClick }) {
    return (
        <button
            className={`${className} w-fit text-s-dark-secondary hover:text-s-tertiary active:text-s-tertiary visited:text-s-link-visited cursor-pointer`}
            onClick={onClick}
        >
            {label}
        </button>
    )
}

export default TextLink
