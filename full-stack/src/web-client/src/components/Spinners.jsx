import { MoonLoader, ScaleLoader, FadeLoader, GridLoader } from "react-spinners"
import { useMediaQuery } from "react-responsive"
import { useEffect, useState } from "react"
import useUIConfig from "../hooks/useUIConfig"

export function DefaultSpinner({ className = "", size = { default: 20, sm: undefined, md: undefined, lg: undefined, xl: undefined } }) {
    const { COLORS } = useUIConfig()
    const [currentColSize, SetCurrentColSize] = useState(20)

    const isSm = useMediaQuery({ minWidth: 640 })
    const isMd = useMediaQuery({ minWidth: 768 })
    const isLg = useMediaQuery({ minWidth: 1024 })
    const isXl = useMediaQuery({ minWidth: 1280 })

    useEffect(() => {
        const tempCurrentSize =
            isXl && size.xl !== undefined
                ? size.xl
                : isLg && size.lg !== undefined
                  ? size.lg
                  : isMd && size.md !== undefined
                    ? size.md
                    : isSm && size.sm !== undefined
                      ? size.sm
                      : size.default
        if (tempCurrentSize !== currentColSize) {
            SetCurrentColSize(tempCurrentSize)
        }
    }, [isSm, isMd, isLg, isXl, currentColSize])

    return (
        <div className={`${className} w-full h-full flex items-center justify-center`}>
            <MoonLoader
                size={currentColSize}
                color={COLORS ? COLORS.WHITE : "#000000"}
            />
        </div>
    )
}
