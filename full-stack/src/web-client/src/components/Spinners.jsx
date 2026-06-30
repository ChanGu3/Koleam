import { MoonLoader, ScaleLoader, FadeLoader, GridLoader } from "react-spinners"
import { useMediaQuery } from "react-responsive"
import { useMemo } from "react"
import useUIConfig from "../hooks/useUIConfig"

export function DefaultSpinner({ className = "", size = { default: 20, sm: undefined, md: undefined, lg: undefined, xl: undefined }, SpinnerComponent = MoonLoader }) {
    const { COLORS } = useUIConfig()

    const isSm = useMediaQuery({ minWidth: 640 })
    const isMd = useMediaQuery({ minWidth: 768 })
    const isLg = useMediaQuery({ minWidth: 1024 })
    const isXl = useMediaQuery({ minWidth: 1280 })

    const currentColSize = useMemo(() => {
        return isXl && size.xl !== undefined
            ? size.xl
            : isLg && size.lg !== undefined
              ? size.lg
              : isMd && size.md !== undefined
                ? size.md
                : isSm && size.sm !== undefined
                  ? size.sm
                  : size.default
    }, [isSm, isMd, isLg, isXl, size])

    return (
        <div className={`${className} w-full h-full flex items-center justify-center`}>
            {SpinnerComponent && (
                <SpinnerComponent
                    size={currentColSize}
                    color={COLORS ? COLORS.WHITE : "#000000"}
                />
            )}
        </div>
    )
}
