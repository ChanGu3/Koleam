// some of these are the same could possibly condense into one

export async function FetchTitleInstallmentStreamHistory(limit = 10, offset = 0) {
    try {
        const response = await fetch(`/api/title/member/stream/lastwatched?latestStreamPerSeries=true&limit=${limit}&offset=${offset}`, {
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

export async function FetchGetCarousel(limit = 7, offset = 0) {
    try {
        const response = await fetch(`/api/title?getNewestReleases=true&limit=${limit}&offset=${offset}`, {
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

export async function FetchGetSeriesShuffle(limit = 10) {
    try {
        const response = await fetch(`/api/title?shuffle=true&limit=${limit}&offset=${0}`, {
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

export async function FetchTitleBySearchQuery(searchQuery, limit = 10, offset = 0) {
    try {
        const response = await fetch(`/api/title?search=${searchQuery}&limit=${limit}&offset=${offset}`, {
            method: "GET",
        })

        if (!response.ok) {
            return []
        }

        if (response.status !== 200) {
            return []
        }

        const data = await response.json()

        if (data.error) {
            return []
        }

        return data
    } catch (err) {
        return err
    }
}

export async function FetchTitleByGenre(genres = [], limit = 10, offset = 0) {
    try {
        const response = await fetch(`/api/title?genres=${genres.join(",")}&limit=${limit}&offset=${offset}&isAZ=${true}`, {
            method: "GET",
        })

        if (!response.ok) {
            return []
        }

        if (response.status !== 200) {
            return []
        }

        const data = await response.json()

        if (data.error) {
            return []
        }

        return data
    } catch (err) {
        throw err
    }
}

export async function FetchTitleAZ(limit = 10, offset = 0) {
    try {
        const response = await fetch(`/api/title?limit=${limit}&offset=${offset}&isAZ=${true}`, {
            method: "GET",
        })

        if (!response.ok) {
            return []
        }

        if (response.status !== 200) {
            return []
        }

        const data = await response.json()

        if (data.error) {
            return []
        }

        return data
    } catch (err) {
        throw err
    }
}

export async function FetchTitleByID(titleID) {
    try {
        const response = await fetch(`/api/title/${titleID}`, {
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
