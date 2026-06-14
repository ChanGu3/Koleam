import { useContext, useEffect } from "react"
import { PopupControllerContext } from "./PopupControllerCTX"
import Popup from "./Popup.jsx"

// Defined outside to guarantee a stable React component reference
function ContextPopupComponent({ children, onClose, isOpen }) {
    const { popupCount, SetPopupCount } = useContext(PopupControllerContext)

    useEffect(() => {
        if (isOpen) {
            SetPopupCount((prev) => prev + 1)
            return () => SetPopupCount((prev) => prev - 1) // Decrements count when closed or unmounted
        }
    }, [isOpen, SetPopupCount])

    return (
        <Popup
            popupCount={popupCount}
            onClose={onClose}
            isOpen={isOpen}
        >
            {children}
        </Popup>
    )
}

/** * Hook for member related functions and data.
 * @returns {{ popupCount: number, PopupComponent: { children, onClose, isOpen } }}
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
