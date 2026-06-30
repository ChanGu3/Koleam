import { useState, useEffect, useCallback } from "react"
import { PopupControllerContext } from "./PopupControllerContext"

export function PopupControllerCTX({ children }) {
    const [popupCount, SetPopupCount] = useState(0)
    const [popupStack, SetPopupStack] = useState([])

    const PopPopupStack = useCallback(() => {
        if (popupStack.length > 0) {
            const topmostPopup = popupStack[popupStack.length - 1]
            if (topmostPopup) {
                topmostPopup.onClose()
            }
        }
    }, [popupStack])

    useEffect(() => {
        function handleKeyDown(event) {
            if (event.key === "Escape") {
                PopPopupStack()
            }
        }

        document.addEventListener("keydown", handleKeyDown)

        return () => {
            document.removeEventListener("keydown", handleKeyDown)
        }
    }, [PopPopupStack])

    return <PopupControllerContext.Provider value={{ popupCount, SetPopupCount, popupStack, SetPopupStack, PopPopupStack }}>{children}</PopupControllerContext.Provider>
}
