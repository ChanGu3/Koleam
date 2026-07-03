import { useContext, useEffect, useRef } from "react"
import { PopupControllerContext } from "./PopupControllerContext.jsx"
import Popup from "./Popup.jsx"

function ContextPopupComponent({ children, onClose, isOpen, className = "" }) {
    const { popupCount, SetPopupCount, SetPopupStack, PopPopupStack } = useContext(PopupControllerContext)
    const onCloseRef = useRef(onClose)

    useEffect(() => {
        onCloseRef.current = onClose
    }, [onClose])

    useEffect(() => {
        if (isOpen) {
            SetPopupCount((prev) => prev + 1)
            SetPopupStack((prevStack) => [...prevStack, { onClose: () => onCloseRef.current(), isOpen }])

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

export default ContextPopupComponent
