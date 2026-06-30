import { useContext, useEffect } from "react"
import { PopupControllerContext } from "./PopupControllerContext.jsx"
import Popup from "./Popup.jsx"

// Defined outside to guarantee a stable React component reference
function ContextPopupComponent({ children, onClose, isOpen, className = "" }) {
    const { popupCount, SetPopupCount, SetPopupStack, PopPopupStack } = useContext(PopupControllerContext)

    useEffect(() => {
        if (isOpen) {
            SetPopupCount((prev) => prev + 1)
            SetPopupStack((prevStack) => [...prevStack, { onClose, isOpen }])

            return () => {
                SetPopupCount((prev) => prev - 1)
                SetPopupStack((prevStack) => prevStack.slice(0, -1))
            } // Decrements count when closed or unmounted
        }
    }, [isOpen, SetPopupCount, SetPopupStack])

    useEffect(() => {
        if (popupCount >= 1) {
            document.body.classList.add("overflow-hidden")
        } else if (popupCount === 0) {
            document.body.classList.remove("overflow-hidden")
        }

        return () => {
            if (popupCount > 0) {
                document.body.classList.remove("overflow-hidden")
            }
        }
    }, [popupCount])

    return (
        isOpen && (
            <Popup
                onClickOutside={() => {
                    PopPopupStack()
                }}
                popupCount={popupCount}
                onClose={onClose}
                isOpen={isOpen}
                className={className}
            >
                {children}
            </Popup>
        )
    )
}

/** * Hook for member related functions and data.
 * @returns {{ popupCount: number, PopupComponent: { children, onClose, isOpen, className } }}
 * @throws Will throw an error if used outside of a PopupControllerCTX provider.
 */
function usePopup() {
    const popupData = useContext(PopupControllerContext)

    if (popupData === undefined) {
        throw new Error(`${usePopup.name} must be used within a ${PopupControllerContext.name} Provider`)
    }

    return {
        ...popupData,
        PopupComponent: ContextPopupComponent,
    }
}

export default usePopup
