import { useEffect, useState } from "react"

function SearchBarUI({ placeholder, setSearchQuery, className }) {
    const [currentSearchQuery, SetCurrentSearchQuery] = useState("")

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setSearchQuery(currentSearchQuery)
        }, 500)

        return () => clearTimeout(delayDebounceFn)
    }, [currentSearchQuery])

    return (
        <input
            value={currentSearchQuery}
            onChange={(event) => {
                SetCurrentSearchQuery(event.target.value)
            }}
            className={`${className} text-s-white font-bold placeholder:text-s-white/50 placeholder:font-semibold focus:outline-none`}
            type="text"
            placeholder={placeholder}
        />
    )
}

export default SearchBarUI
