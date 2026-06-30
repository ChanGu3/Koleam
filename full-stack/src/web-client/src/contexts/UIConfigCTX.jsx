import { useEffect, useState } from "react"
import { FetchSavedColorTheme, FetchSavedWebsiteName, FetchSavedCurrentAccessType } from "../services/ui-config/ENV_UI_DATA.js"
import { UIConfigContext } from "./createContext/UIConfigContext.jsx"

export function UIConfigCTX({ children }) {
    const [WEBSITE_NAME, SetWEBSITE_NAME] = useState(null)
    const [CURRENT_ACCESS_TYPE, SetCURRENT_ACCESS_TYPE] = useState(null)
    const [COLORS, SetCOLORS] = useState(null)

    useEffect(() => {
        FetchSavedWebsiteName().then((websiteName) => {
            SetWEBSITE_NAME(websiteName)
        })
        FetchSavedColorTheme().then((colors) => {
            SetCOLORS(colors)
        })
        FetchSavedCurrentAccessType().then((C_A_T) => {
            SetCURRENT_ACCESS_TYPE(C_A_T)
        })
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
