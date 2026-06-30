import { useEffect, useRef } from "react"
import { Z_INDEX } from "../constants"
import { SquareX } from "lucide-react"

function Popup({ children, isOpen, onClickOutside, onClose, className = "", popupCount, outsideOnDownCloses = false }) {
    const bgRef = useRef(null)

    useEffect(() => {
        function handleMouseDown(event) {
            if (outsideOnDownCloses && bgRef.current && event.target === bgRef.current) {
                onClickOutside()
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleMouseDown)
        } else {
            document.removeEventListener("mousedown", handleMouseDown)
        }

        return () => {
            document.removeEventListener("mousedown", handleMouseDown)
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    const zPopupFactor = Z_INDEX.POPUP + popupCount

    // TODO: MAYBE JUST MATCH THE NAVBAR FOR MARGIN LOL QUICK FIX FOR NOW
    return (
        <div
            ref={bgRef}
            style={{ zIndex: zPopupFactor + 1 }}
            className={`fixed overflow-y-auto inset-0 bg-s-tertiary/75`}
        >
            <div className={`absolute inset-0 pointer-events-none ${className} py-36`}>
                <div className="rounded-md relative pointer-events-auto flex items-center justify-center">
                    <div className="relative pb-12">
                        <button
                            className="absolute -top-10 -right-1 text-s-white hover:text-s-white/75 cursor-pointer"
                            onClick={onClose}
                        >
                            <SquareX className="w-8 h-8" />
                        </button>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Popup
