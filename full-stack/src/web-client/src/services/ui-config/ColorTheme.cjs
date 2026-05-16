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
async function GetSavedColorTheme() {
    return null
    //TODO: get config setup on environment variables
}

module.exports.GetSavedColorTheme = GetSavedColorTheme
