import { createContext, useState } from "react"

export const PopupControllerContext = createContext(undefined)

export function PopupControllerCTX({ children }) {
    const [popupCount, SetPopupCount] = useState(0)

    return <PopupControllerContext.Provider value={{ popupCount, SetPopupCount }}>{children}</PopupControllerContext.Provider>
}
