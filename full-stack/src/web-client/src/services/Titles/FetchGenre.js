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
