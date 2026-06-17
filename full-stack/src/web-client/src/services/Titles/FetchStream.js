export async function FetchLogStreamStarted(streamID) {
    try {
        const response = await fetch(`/api/title/member/stream/lastwatched/${streamID}`, {
            method: "PUT",
            credentials: "include",
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

export async function FetchStreamByID(streamID) {
    try {
        const response = await fetch(`/api/title/stream/${streamID}`, {
            method: "GET",
            credentials: "include",
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

export async function FetchSubtitleByStreamIDLabelExt(streamID, label, ext) {
    try {
        const response = await fetch(`/api/title/stream/${streamID}/subs/${label}.${ext}`, {
            method: "GET",
            credentials: "include",
        })

        if (!response.ok) {
            return null
        }

        if (response.status !== 200) {
            return null
        }

        const data = await response.text()

        return data
    } catch (err) {
        return null
    }
}
