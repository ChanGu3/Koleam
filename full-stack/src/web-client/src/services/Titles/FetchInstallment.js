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

