/*
 *
 * This assumes cookies are used to store session information
 *
 */

/**
 * @return {Promise<boolean>}
 */
export async function isMemberAuthorized() {
    try {
        const response = await fetch("/api/authorize/member", {
            method: "GET",
            credentials: "include",
        })

        if (response.ok) {
            const data = await response.json()
            if (data.success) {
                return true
            }
        }
    } catch (error) {
        throw error
    }

    return false
}

/**
 * @return {Promise<boolean>}
 */
export async function isAdminAuthorized() {
    try {
        const response = await fetch("/api/authorize/admin", {
            method: "GET",
            credentials: "include",
        })

        if (response.ok) {
            const data = await response.json()
            if (data.success) {
                return true
            }
        }
    } catch (error) {}

    return false
}
