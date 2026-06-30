import { ERROR_MESSAGES } from "../../../../shared/log-messages.js"

export async function UpdateLogStream(streamID, lastTimeStampInSeconds) {
    try {
        const response = await fetch(`/api/title/member/stream/lastwatched/${streamID}`, {
            method: "PUT",
            credentials: "include",
            body: JSON.stringify({ lastTimeStampInSeconds: lastTimeStampInSeconds }),
            headers: {
                "Content-Type": "application/json",
            },
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

export async function FetchLogStream(streamID) {
    try {
        const response = await fetch(`/api/title/member/stream/lastwatched/${streamID}`, {
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

        console.log(data)

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

/**
 * @returns {Promise<boolean>}
 *
 */
export async function DeleteStreamByID(streamID) {
    let data = null
    try {
        const response = await fetch(`/api/title/stream/${streamID}`, {
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
 * @returns {Promise<boolean>}
 *
 */
export async function AddStream({ titleID, installmentID, label, streamNumber, synopsis, releaseDate, streamThumbnail }) {
    const formData = new FormData()
    formData.append("streamThumbnail", streamThumbnail)
    formData.append("streamData", JSON.stringify({ titleID, installmentID, label, streamNumber, synopsis, releaseDate }))

    let data = null
    try {
        const response = await fetch(`/api/title/stream`, {
            method: "POST",
            body: formData,
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
 * @returns {Promise<boolean>}
 *
 */
export async function UpdateStream(streamID, { label = null, streamNumber = null, synopsis = null, releaseDate = null, streamThumbnail = null }) {
    const formData = new FormData()
    formData.append("streamData", JSON.stringify({ label, synopsis, releaseDate }))
    if (streamThumbnail) {
        formData.append("streamThumbnail", streamThumbnail)
    }

    let data = null
    try {
        const response = await fetch(`/api/title/stream/${streamID}`, {
            method: "PUT",
            body: formData,
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

//
// Media
//

// Video
export async function AddStreamVideo(streamID, tempFileID) {
    let data = null
    try {
        const response = await fetch(`/api/title/stream/${streamID}/video`, {
            method: "POST",
            body: JSON.stringify({ tempFileID }),
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

export async function DeleteStreamVideo(streamID) {
    let data = null
    try {
        const response = await fetch(`/api/title/stream/${streamID}/video`, {
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

export async function UpdateStreamVideo(streamID, tempFileID) {
    let data = null
    try {
        const response = await fetch(`/api/title/stream/${streamID}/video`, {
            method: "PUT",
            body: JSON.stringify({ tempFileID }),
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

export async function FetchStreamVideoRenderInfoEventSource(streamID, onStartCallback, onMessageCallback, onCompleteCallback, onErrorCallback) {
    const eventSource = new EventSource(`/api/title/stream/${streamID}/video/render`, {})

    eventSource.onmessage = (event) => {
        const { progress, streamVideoData } = JSON.parse(event.data)

        if (streamVideoData && streamVideoData.isDownloaded) {
            onCompleteCallback(streamVideoData)
            eventSource.close()
            return
        }

        onMessageCallback({ progress, streamVideoData })
    }

    eventSource.onerror = (err) => {
        onErrorCallback(err)
        eventSource.close()
    }

    eventSource.onopen = () => {
        onStartCallback()
    }

    return eventSource
}

// Audio
export async function AddStreamAudio(streamID, label, streamIndexAudioOnly, tempFileID) {
    let data = null
    try {
        const response = await fetch(`/api/title/stream/${streamID}/audio`, {
            method: "POST",
            body: JSON.stringify({ label, streamIndexAudioOnly, tempFileID }),
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

export async function DeleteStreamAudio(streamID, label) {
    let data = null
    try {
        const response = await fetch(`/api/title/stream/${streamID}/audio/${label}`, {
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
 * @param {{ streamIndexAudioOnly: number, tempFileID: string }} newFile
 * @param {string} newLabel
 *
 * @returns {Promise<boolean>}
 */
export async function UpdateStreamAudio(streamID, label, { newFile = null, newLabel = null }) {
    let data = null
    try {
        const { streamIndexAudioOnly, tempFileID } = newFile || {}
        const response = await fetch(`/api/title/stream/${streamID}/audio/${label}`, {
            method: "PUT",
            body: JSON.stringify({ streamIndexAudioOnly, tempFileID, newLabel }),
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

export async function FetchStreamAudioRenderInfoEventSource(streamID, label, onStartCallback, onMessageCallback, onCompleteCallback, onErrorCallback) {
    const eventSource = new EventSource(`/api/title/stream/${streamID}/audio/${label}/render`, {})

    eventSource.onmessage = (event) => {
        const { progress, streamAudioData } = JSON.parse(event.data)

        if (streamAudioData && streamAudioData.isDownloaded) {
            onCompleteCallback(streamAudioData)
            eventSource.close()
            return
        }

        onMessageCallback({ progress, streamAudioData })
    }

    eventSource.onerror = (err) => {
        onErrorCallback(err)
        eventSource.close()
    }

    eventSource.onopen = () => {
        onStartCallback()
    }

    return eventSource
}

// Subtitle
export async function AddStreamSubtitle(streamID, label, isCC, streamIndexSubtitleOnly, tempFileID) {
    let data = null
    try {
        const response = await fetch(`/api/title/stream/${streamID}/subtitle`, {
            method: "POST",
            body: JSON.stringify({ label, streamIndexSubtitleOnly, tempFileID, isCC }),
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

export async function DeleteStreamSubtitle(streamID, label, isCC) {
    let data = null
    try {
        const response = await fetch(`/api/title/stream/${streamID}/subtitle/${label}/${isCC}`, {
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
 * @param {{ streamIndexSubtitleOnly: number, tempFileID: string }} newFile
 * @param {string} newLabel
 *
 * @returns {Promise<boolean>}
 */
export async function UpdateStreamSubtitle(streamID, label, isCC, { newFile = null, newLabel = null, newIsCC = null }) {
    let data = null
    try {
        const { streamIndexSubtitleOnly, tempFileID } = newFile || {}
        const response = await fetch(`/api/title/stream/${streamID}/subtitle/${label}/${isCC}`, {
            method: "PUT",
            body: JSON.stringify({ streamIndexSubtitleOnly, tempFileID, newLabel, newIsCC }),
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

export async function FetchStreamSubtitleRenderInfoEventSource(streamID, label, isCC, onStartCallback, onMessageCallback, onCompleteCallback, onErrorCallback) {
    const eventSource = new EventSource(`/api/title/stream/${streamID}/subtitle/${label}/${isCC}/render`, {})

    eventSource.onmessage = (event) => {
        const { progress, streamSubtitleData } = JSON.parse(event.data)

        if (streamSubtitleData && streamSubtitleData.isDownloaded) {
            onCompleteCallback(streamSubtitleData)
            eventSource.close()
            return
        }
        onMessageCallback({ progress, streamSubtitleData })
    }

    eventSource.onerror = (err) => {
        onErrorCallback(err)
        eventSource.close()
    }

    eventSource.onopen = () => {
        onStartCallback()
    }

    return eventSource
}
