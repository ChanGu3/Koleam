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

/**
 * @returns {Promise<boolean>}
 *
 */
export async function DeleteTitleByID(titleID) {
    try {
        const response = await fetch(`/api/title/${titleID}`, {
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

/**
 * @returns {Promise<boolean>}
 *
 */
export async function AddTitle({
    label,
    originalTranslation,
    description,
    copyright = null,
    filmSuitability = null,
    filmAgeMin = null,
    genres = [],
    otherTranslations = [],
    contentAdvisories = [],
    titleCover,
}) {
    const formData = new FormData()
    formData.append("titleCover", titleCover)
    formData.append("titleData", JSON.stringify({ label, originalTranslation, description, copyright, filmSuitability, filmAgeMin, genres, otherTranslations, contentAdvisories }))

    try {
        const response = await fetch(`/api/title`, {
            method: "POST",
            body: formData,
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
export async function UpdateTitle(
    titleID,
    {
        label = null,
        originalTranslation = null,
        description = null,
        copyright = null,
        filmSuitability = null,
        filmAgeMin = null,
        listData = {
            add: { genres: [], otherTranslations: [], contentAdvisories: [] },
            delete: { genres: [], otherTranslations: [], contentAdvisories: [] },
        },
        titleCover = null,
    }
) {
    const formData = new FormData()
    formData.append("titleData", JSON.stringify({ label, originalTranslation, description, copyright, filmSuitability, filmAgeMin, listData }))
    if (titleCover) {
        formData.append("titleCover", titleCover)
    }

    try {
        const response = await fetch(`/api/title/${titleID}`, {
            method: "PUT",
            body: formData,
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
