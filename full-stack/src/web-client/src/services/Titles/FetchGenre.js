import { ERROR_MESSAGES } from "../../../../shared/log-messages"

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
 * @returns {Promise<any>}
 *
 */
export async function DeleteGenre(name) {
    let data = null
    try {
        const response = await fetch(`/api/title/genre/${name}`, {
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

/**
 * @returns {Promise<any>}
 *
 */
export async function AddGenre({ name }) {
    let data = null
    try {
        const response = await fetch(`/api/title/genre`, {
            method: "POST",
            body: JSON.stringify({ name }),
            headers: {
                "Content-Type": "application/json",
            },
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
