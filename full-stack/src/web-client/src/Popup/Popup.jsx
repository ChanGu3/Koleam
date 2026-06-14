import { useEffect, useRef } from "react"
import { Z_INDEX } from "../constants"
import { SquareX } from "lucide-react"

function Popup({ children, isOpen, onClose, popupCount, outsideOnDownCloses = false }) {
    const bgRef = useRef(null)

    useEffect(() => {
        function handleKeyDown(event) {
            if (event.key === "Escape" || (outsideOnDownCloses && bgRef.current && event.target === bgRef.current)) {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown)
            document.addEventListener("mousedown", handleKeyDown)
        } else {
            document.removeEventListener("keydown", handleKeyDown)
            document.removeEventListener("mousedown", handleKeyDown)
        }

        return () => {
            document.removeEventListener("keydown", handleKeyDown)
            document.removeEventListener("mousedown", handleKeyDown)
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    const zPopupFactor = Z_INDEX.POPUP + popupCount

    // TODO: MAYBE JUST MATCH THE NAVBAR FOR MARGIN LOL QUICK FIX FOR NOW
    return (
        <>
            <div
                className="fixed flex justify-center items-center inset-0 pointer-events-none"
                style={{ zIndex: zPopupFactor + 1 }}
            >
                <div className="rounded-md relative pointer-events-auto flex items-center justify-center mt-24">
                    <div className="">{children}</div>
                    <button
                        className="absolute -top-10 -right-1 text-s-white hover:text-s-white/75 cursor-pointer"
                        onClick={onClose}
                    >
                        <SquareX className="w-8 h-8" />
                    </button>
                </div>
            </div>

            <div
                ref={bgRef}
                className="fixed inset-0 bg-s-tertiary/75 h-full w-full"
                style={{ zIndex: zPopupFactor }}
            ></div>
        </>
    )
}

export default Popup
