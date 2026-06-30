import { ACCESS_TYPE, DEV_ACCESS_TYPE } from "../../../dev/constants.js"

/**
 * @returns { Promise<{
 * WHITE: string,
 * PRIMARY: string,
 * SECONDARY: string,
 * TERTIARY: string,
 * "DARK-PRIMARY": string,
 * "DARK-SECONDARY": string,
 * "DARK-TERTIARY": string,
 * "LINK-VISITED": string,
 * ERROR: string
 * }>
 * }
 */
export async function FetchSavedColorTheme() {
    const rootElement = document.documentElement
    const computedStyles = getComputedStyle(rootElement)
    const COLORS = {
        WHITE: computedStyles.getPropertyValue(`--color-s-white`).trim(),
        PRIMARY: computedStyles.getPropertyValue(`--color-s-primary`).trim(),
        SECONDARY: computedStyles.getPropertyValue(`--color-s-secondary`).trim(),
        TERTIARY: computedStyles.getPropertyValue(`--color-s-tertiary`).trim(),
        "DARK-PRIMARY": computedStyles.getPropertyValue(`--color-s-dark-primary`).trim(),
        "DARK-SECONDARY": computedStyles.getPropertyValue(`--color-s-dark-secondary`).trim(),
        "DARK-TERTIARY": computedStyles.getPropertyValue(`--color-s-dark-tertiary`).trim(),
        "LINK-VISITED": computedStyles.getPropertyValue(`--color-s-link-visited`).trim(),
        ERROR: computedStyles.getPropertyValue(`--color-s-error`).trim(),
        SUCCESS: computedStyles.getPropertyValue(`--color-s-success`).trim(),
    }

    try {
        const response = await fetch("/api/env/COLORS", {
            method: "GET",
            credentials: "include",
        })
        if (!response.ok) {
            throw new Error(`Failed to fetch color theme: ${response.statusText}`)
        }

        const data = await response.json()
        if (!data || !data.COLORS || !data.COLORS.LIGHT_MODE) {
            throw new Error("Invalid color theme data received from server")
        }

        const serverColors = data.COLORS.LIGHT_MODE
        for (const key in serverColors) {
            if (serverColors.hasOwnProperty(key)) {
                COLORS[key] = serverColors[key]
            }
        }
    } catch (err) {}

    return COLORS
}

export async function FetchSavedWebsiteName() {
    try {
        const response = await fetch("/api/env/LABELS/WEBSITE_NAME", {
            method: "GET",
            credentials: "include",
        })
        if (!response.ok) {
            throw new Error(`Failed to fetch website name: ${response.statusText}`)
        }

        const data = await response.json()
        if (!data || !data.WEBSITE_NAME) {
            throw new Error("Invalid website name data received from server")
        }

        return data.WEBSITE_NAME
    } catch (err) {
        return "Koleam" // Default website name if fetch fails
    }
}

export async function FetchSavedCurrentAccessType() {
    try {
        if ("5173" === window.location.port) {
            return DEV_ACCESS_TYPE
        }

        const response = await fetch("/api/env/PORT", {
            method: "GET",
            credentials: "include",
        })
        if (!response.ok) {
            throw new Error(`Failed to fetch current access type: ${response.statusText}`)
        }

        const data = await response.json()
        if (!data || (!data.LOCAL_PORT && !data.PUBLIC_PORT)) {
            throw new Error("Invalid current port data received from server")
        }

        if (data.LOCAL_PORT) {
            return ACCESS_TYPE.LOCAL
        } else if (data.PUBLIC_PORT) {
            return ACCESS_TYPE.PUBLIC
        }
    } catch (err) {
        return "ACCESS_TYPE_UNKNOWN"
    }
}
