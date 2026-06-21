export async function GetAllGenres(limit = 10, offset = 0) {
    const response = await fetch(`/api/title/genre?offset=${offset}&limit=${limit}`, {
        method: "GET",
    })

    if (!response.ok) {
        return []
    }

    const data = await response.json()

    if (data.error) {
        return []
    }

    return data
}

export async function FetchGenre(genre) {
    const response = await fetch(`/api/title/genre/${genre}`, {
        method: "GET",
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

/**
 * @returns {Promise<boolean>}
 *
 */
export async function DeleteGenre(name) {
    try {
        const response = await fetch(`/api/title/genre/${name}`, {
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
    } catch (err) {}
}

/**
 * @returns {Promise<boolean>}
 *
 */
export async function AddGenre({ name }) {
    try {
        const response = await fetch(`/api/title/genre`, {
            method: "POST",
            body: JSON.stringify({ name }),
            headers: {
                "Content-Type": "application/json",
            },
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
