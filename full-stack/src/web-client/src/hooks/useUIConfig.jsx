import { useContext } from "react"
import { UIConfigContext } from "../contexts/createContext/UIConfigContext.jsx"

/** * Hook for accessing UI configuration values from the UIConfigCTX.
 * @returns {{ WEBSITE_NAME: string, CURRENT_ACCESS_TYPE: string, COLORS: { WHITE: string, PRIMARY: string, SECONDARY: string, TERTIARY: string, "DARK-PRIMARY": string, "DARK-SECONDARY": string, "DARK-TERTIARY": string, "LINK-VISITED": string, ERROR: string } }}
 * @throws Will throw an error if used outside of a UIConfigCTX provider.
 */
function useUIConfig() {
    const uiConfig = useContext(UIConfigContext)

    if (uiConfig === undefined) {
        throw new Error(`${useUIConfig.name} must be used within a ${UIConfigContext.name} Provider`)
    }

    return uiConfig
}

export default useUIConfig
