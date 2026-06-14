import { validateEmail, validatePassword, validePasswordFailMsg } from "../../../../shared/Validations/account-validations"

/**
 * @returns {Promise<{ email: string } | null>}
 * Member data, null if not authorized
 */
export async function MemberData() {
    const response = await fetch("/api/account/member", {
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

export async function MemberUpdateEmail(newEmail) {
    if (validateEmail(newEmail) === false) {
        throw new Error("Invalid email format")
    }

    const response = await fetch("/api/account/member/email", {
        method: "PUT",
        headers: { "Content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ newEmail: newEmail }),
    })

    const data = await response.json()

    if (!response.ok || data.error) {
        throw new Error(data.error)
    }

    return data
}

export async function MemberUpdatePassword(currentPassword, newPassword, newPasswordAgain) {
    if (validatePassword(newPassword) === false) {
        throw new Error(validePasswordFailMsg)
    } else if (newPasswordAgain !== newPassword) {
        throw new Error("both passwords do not match")
    }

    const response = await fetch("/api/account/member/password", {
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

// 1-5
export async function FetchMemberRatingOfTitle(titleID) {
    const response = await fetch(`/api/title/member/${titleID}/rating`, {
        method: "GET",
        headers: { "Content-type": "application/json" },
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

// 1-5
export async function MemberUpdateRatingOfTitle(titleID, rating) {
    const response = await fetch(`/api/title/member/${titleID}/rating`, {
        method: "PUT",
        headers: { "Content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rating }),
    })

    return response.ok
}

export async function FetchMemberFavorites(limit, offset) {
    const response = await fetch(`/api/title/member/favorite?limit=${limit}&offset=${offset}`, {
        method: "GET",
        credentials: "include",
    })

    const data = await response.json()

    if (data.error) {
        return null
    }

    return data
}

export async function FetchMemberFavoriteOfTitle(titleID) {
    const response = await fetch(`/api/title/member/${titleID}/favorite`, {
        method: "GET",
        credentials: "include",
    })

    const data = await response.json()

    if (data.error) {
        return null
    }

    return data
}

export async function MemberUpdateFavoriteOfTitle(titleID) {
    const response = await fetch(`/api/title/member/${titleID}/favorite`, {
        method: "PUT",
        credentials: "include",
    })

    const data = await response.json()

    if (data.error || data.success) {
        return data
    }

    return null
}

export async function FetchMemberLikeOfStream(streamID) {
    const response = await fetch(`/api/title/member/stream/${streamID}/like`, {
        method: "GET",
        credentials: "include",
    })

    const data = await response.json()

    if (data.error) {
        return null
    }

    return data
}

export async function MemberUpdateLikeOfStream(streamID) {
    const response = await fetch(`/api/title/member/stream/${streamID}/like`, {
        method: "PUT",
        credentials: "include",
    })

    const data = await response.json()

    if (data.error || data.success) {
        return data
    }

    return null
}
