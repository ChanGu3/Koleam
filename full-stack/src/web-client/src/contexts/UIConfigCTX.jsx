import { createContext, useEffect, useState } from "react"
import { ACCESS_TYPE } from "../constants"
import { FetchSavedColorTheme } from "../services/ui-config/ColorTheme.js"

export const UIConfigContext = createContext(undefined)

export function UIConfigCTX({ children }) {
    const [WEBSITE_NAME, SetWEBSITE_NAME] = useState(null)
    const [CURRENT_ACCESS_TYPE, SetCURRENT_ACCESS_TYPE] = useState(null)
    const [COLORS, SetCOLORS] = useState(null)

    useEffect(() => {
        // TODO: - Fetch These From Server
        SetWEBSITE_NAME("Koleam")
        FetchSavedColorTheme().then((colors) => {
            SetCOLORS(colors)
        })
        SetCURRENT_ACCESS_TYPE(ACCESS_TYPE.LOCAL)
    }, [])

    useEffect(() => {
        InjectDynamicGlobalUIColors(COLORS)
    }, [COLORS])

    useEffect(() => {
        InjectWEBSITE_NAME(WEBSITE_NAME)
    }, [WEBSITE_NAME])

    function InjectDynamicGlobalUIColors(colors) {
        if (!colors) {
            return
        }

        const rootElement = document.documentElement
        rootElement.style.setProperty(`--color-s-white`, colors.WHITE)
        rootElement.style.setProperty(`--color-s-primary`, colors.PRIMARY)
        rootElement.style.setProperty(`--color-s-secondary`, colors.SECONDARY)
        rootElement.style.setProperty(`--color-s-tertiary`, colors.TERTIARY)
        rootElement.style.setProperty(`--color-s-dark-primary`, colors["DARK-PRIMARY"])
        rootElement.style.setProperty(`--color-s-dark-secondary`, colors["DARK-SECONDARY"])
        rootElement.style.setProperty(`--color-s-dark-tertiary`, colors["DARK-TERTIARY"])
        rootElement.style.setProperty(`--color-s-link-visited`, colors["LINK-VISITED"])
        rootElement.style.setProperty(`--color-s-error`, colors.ERROR)
        rootElement.style.setProperty(`--color-s-success`, colors.SUCCESS)
    }

    function InjectWEBSITE_NAME(websiteName) {
        document.title = websiteName
    }

    const value = {
        WEBSITE_NAME,
        CURRENT_ACCESS_TYPE, // FOR NOW I CAN CHANGE THIS FOR CHECKING WILL BE USED FOR PORT CHECKING THOUGH
        COLORS,
    }

    return <UIConfigContext.Provider value={value}>{children}</UIConfigContext.Provider>
}
