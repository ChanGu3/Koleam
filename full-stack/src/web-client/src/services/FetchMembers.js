export async function FetchAllMembers(limit = 25, offset = 0, search) {
    const response = await fetch(`/api/moderation/members?limit=${limit}&offset=${offset}&search=${search}`, {
        method: "GET",
        credentials: "include",
    })

    if (!response.ok) {
        return []
    }

    const data = await response.json()

    if (data.error) {
        throw new Error(data.error)
    }

    return data
}

export async function FetchMember(email) {
    const response = await fetch(`/api/moderation/members/${email}`, {
        method: "GET",
        credentials: "include",
    })

    if (!response.ok) {
        return null
    }

    const data = await response.json()

    if (data.error) {
        throw new Error(data.error)
    }

    return data
}

export async function DeleteMember(email) {
    const response = await fetch(`/api/moderation/members/${email}`, {
        method: "DELETE",
        credentials: "include",
    })

    if (!response.ok) {
        return null
    }

    const data = await response.json()

    if (data.error) {
        throw new Error(data.error)
    }

    return data
}
