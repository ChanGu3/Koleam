import { useContext } from "react"
import { PopupControllerContext } from "./PopupControllerContext.jsx"
import ContextPopupComponent from "./ContextPopupComponent.jsx"

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
