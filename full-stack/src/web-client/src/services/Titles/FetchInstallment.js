export async function FetchIntallmentsByTitleID(titleID) {
    try {
        const response = await fetch(`/api/title/installment?titleID=${titleID}`, {
            method: "GET",
        })

        if (!response.ok) {
            return null
        }

        if (response.status !== 200) {
            return null
        }

        const data = await response.json()

        if (data.error) {
            return null
        }

        return data
    } catch (err) {
        return null
    }
}

export async function FetchIntallmentByID(installmentID) {
    try {
        const response = await fetch(`/api/title/installment/${installmentID}`, {
            method: "GET",
        })

        if (!response.ok) {
            return null
        }

        if (response.status !== 200) {
            return null
        }

        const data = await response.json()

        if (data.error) {
            return null
        }

        return data
    } catch (err) {
        return null
    }
}

/**
 * @returns {Promise<any>}
 *
 */
export async function DeleteInstallmentByID(installmentID) {
    let data = null
    try {
        const response = await fetch(`/api/title/installment/${installmentID}`, {
            method: "DELETE",
        })

        data = await response.json()
    } catch (err) {
        throw Error(ERROR_MESSAGES.SHARED.unexpected)
    }

    if (data && data.error) {
        throw Error(data.error)
    }

    return data
}

/**ark
 * @returns {Promise<boolean>}
 *
 */
export async function AddInstallment({ titleID, label, isSeason }) {
    let data = null
    try {
        const response = await fetch(`/api/title/installment`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ titleID, label, isSeason }),
        })

        data = await response.json()
    } catch (err) {
        throw Error(ERROR_MESSAGES.SHARED.unexpected)
    }

    if (data && data.error) {
        throw Error(data.error)
    }

    return data
}

/**
 * @returns {Promise<boolean>}
 *
 */
export async function UpdateInstallment(installmentID, { label = null, installmentNumber = null, isSeason = null }) {
    let data = null
    try {
        const response = await fetch(`/api/title/installment/${installmentID}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ label, installmentNumber, isSeason }),
        })

        data = await response.json()
    } catch (err) {
        throw Error(ERROR_MESSAGES.SHARED.unexpected)
    }

    if (data && data.error) {
        throw Error(data.error)
    }

    return data
}
