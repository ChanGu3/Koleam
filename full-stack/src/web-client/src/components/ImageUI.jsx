import { useState } from "react"

function ImageUI({ className = "", Src, Fallback }) {
    const [hasError, setHasError] = useState(false)

    if (hasError || !Src) {
        return <Fallback className={`${className} w-full h-full object-cover`} />
    }

    return (
        <img
            src={Src}
            className={`${className} w-full h-full object-cover`}
            onError={() => setHasError(true)}
        />
    )
}

export default ImageUI
