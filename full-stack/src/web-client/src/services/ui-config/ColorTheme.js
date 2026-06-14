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

    return COLORS
    //TODO: get config setup on environment variables
}
