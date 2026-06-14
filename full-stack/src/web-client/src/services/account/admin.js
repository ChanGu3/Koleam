import { validatePassword, validePasswordFailMsg } from "../../../../shared/Validations/account-validations"

/**
 * @returns {Promise<{ username: string } | null>}
 * Admin data, null if not authorized
 */
export async function AdminData() {
    const response = await fetch("/api/account/admin", {
        method: "GET",
        credentials: "include",
    })

    if (!response.ok) {
        return null
    }

    const data = await response.json()

    if (data.error) {
        return null
    }

    return data
}

export async function AdminUpdatePassword(currentPassword, newPassword, newPasswordAgain) {
    if (validatePassword(newPassword) === false) {
        throw new Error(validePasswordFailMsg)
    } else if (newPasswordAgain !== newPassword) {
        throw new Error("both passwords do not match")
    }

    const response = await fetch("/api/account/admin/password", {
        method: "PUT",
        headers: { "Content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword: currentPassword, newPassword: newPassword }),
    })

    const data = await response.json()

    if (!response.ok || data.error) {
        throw new Error(data.error)
    }

    return data
}
