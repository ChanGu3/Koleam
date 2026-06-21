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
 * @returns {Promise<boolean>}
 *
 */
export async function DeleteInstallmentByID(installmentID) {
    try {
        const response = await fetch(`/api/title/installment/${installmentID}`, {
            method: "DELETE",
        })

        if (!response.ok) {
            return false
        }

        if (response.status !== 200) {
            return false
        }

        const data = await response.json()

        if (data.error) {
            return false
        }

        return true
    } catch (err) {
        return false
    }
}

/**ark
 * @returns {Promise<boolean>}
 *
 */
export async function AddInstallment({ titleID, label, isSeason }) {
    try {
        const response = await fetch(`/api/title/installment`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ titleID, label, isSeason }),
        })

        if (!response.ok) {
            return false
        }

        if (response.status !== 200) {
            return false
        }

        const data = await response.json()

        if (data.error) {
            return false
        }

        return true
    } catch (err) {
        return false
    }
}

/**
 * @returns {Promise<boolean>}
 *
 */
export async function UpdateInstallment(installmentID, { label = null, installmentNumber = null, isSeason = null }) {
    try {
        const response = await fetch(`/api/title/installment/${installmentID}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ label, installmentNumber, isSeason }),
        })

        if (!response.ok) {
            return false
        }

        if (response.status !== 200) {
            return false
        }

        const data = await response.json()

        if (data.error) {
            return false
        }

        return true
    } catch (err) {
        return false
    }
}
