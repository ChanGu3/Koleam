export async function UpdateLogStream(streamID, lastTimeStampInSeconds) {
    try {
        const response = await fetch(`/api/title/member/stream/lastwatched/${streamID}`, {
            method: "PUT",
            credentials: "include",
            data: JSON.stringify({ lastTimeStampInSeconds: lastTimeStampInSeconds }),
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
    try {
        const response = await fetch(`/api/title/stream/${streamID}`, {
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
export async function AddStream({ titleID, installmentID, label, streamNumber, synopsis, releaseDate, streamThumbnail }) {
    const formData = new FormData()
    formData.append("streamThumbnail", streamThumbnail)
    formData.append("streamData", JSON.stringify({ titleID, installmentID, label, streamNumber, synopsis, releaseDate }))

    try {
        const response = await fetch(`/api/title/stream`, {
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
export async function UpdateStream(streamID, { label = null, streamNumber = null, synopsis = null, releaseDate = null, streamThumbnail = null }) {
    const formData = new FormData()
    formData.append("titleData", JSON.stringify({ label, streamNumber, synopsis, releaseDate, streamThumbnail }))
    if (titleCover) {
        formData.append("titleCover", titleCover)
    }

    try {
        const response = await fetch(`/api/title/stream/${streamID}`, {
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
    try {
        const response = await fetch(`/api/title/stream/${streamID}/video`, {
            method: "POST",
            body: JSON.stringify({ tempFileID }),
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

export async function DeleteStreamVideo(streamID) {
    try {
        const response = await fetch(`/api/title/stream/${streamID}/video`, {
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

export async function UpdateStreamVideo(streamID, tempFileID) {
    try {
        const response = await fetch(`/api/title/stream/${streamID}/video`, {
            method: "PUT",
            body: JSON.stringify({ tempFileID }),
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

export async function FetchStreamVideoRenderInfoEventSource(streamID, onStartCallback, onMessageCallback, onCompleteCallback, onErrorCallback) {
    const eventSource = new EventSource(`/api/title/stream/${streamID}/video/render`, {})

    eventSource.onmessage = (event) => {
        const { progress, streamVideoData } = event.data

        if (streamVideoData.isDownloaded) {
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
    try {
        const response = await fetch(`/api/title/stream/${streamID}/audio`, {
            method: "POST",
            body: JSON.stringify({ label, streamIndexAudioOnly, tempFileID }),
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

export async function DeleteStreamAudio(streamID, label) {
    try {
        const response = await fetch(`/api/title/stream/${streamID}/audio/${label}`, {
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
 * @param {{ streamIndexAudioOnly: number, tempFileID: string }} newFile
 * @param {string} newLabel
 *
 * @returns {Promise<boolean>}
 */
export async function UpdateStreamAudio(streamID, label, { newFile = null, newLabel = null }) {
    try {
        const { streamIndexAudioOnly, tempFileID } = newFile || {}
        const response = await fetch(`/api/title/stream/${streamID}/audio/${label}`, {
            method: "PUT",
            body: JSON.stringify({ streamIndexAudioOnly, tempFileID, newLabel }),
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

export async function FetchStreamAudioRenderInfoEventSource(streamID, label, onStartCallback, onMessageCallback, onCompleteCallback, onErrorCallback) {
    const eventSource = new EventSource(`/api/title/stream/${streamID}/audio/${label}/render`, {})

    eventSource.onmessage = (event) => {
        const { progress, streamAudioInfo } = event.data

        if (streamAudioInfo.isDownloaded) {
            onCompleteCallback(streamAudioInfo)
            eventSource.close()
            return
        }

        onMessageCallback({ progress, streamAudioInfo })
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
export async function AddStreamSubtitle(streamID, label, streamIndexSubtitleOnly, tempFileID) {
    try {
        const response = await fetch(`/api/title/stream/${streamID}/subtitle`, {
            method: "POST",
            body: JSON.stringify({ label, streamIndexSubtitleOnly, tempFileID }),
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

export async function DeleteStreamSubtitle(streamID, label) {
    try {
        const response = await fetch(`/api/title/stream/${streamID}/subtitle/${label}`, {
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
 * @param {{ streamIndexSubtitleOnly: number, tempFileID: string }} newFile
 * @param {string} newLabel
 *
 * @returns {Promise<boolean>}
 */
export async function UpdateStreamSubtitle(streamID, label, { newFile = null, newLabel = null }) {
    try {
        const { streamIndexSubtitleOnly, tempFileID } = newFile || {}
        const response = await fetch(`/api/title/stream/${streamID}/subtitle/${label}`, {
            method: "PUT",
            body: JSON.stringify({ streamIndexSubtitleOnly, tempFileID, newLabel }),
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

export async function FetchStreamSubtitleRenderInfoEventSource(streamID, label, onStartCallback, onMessageCallback, onCompleteCallback, onErrorCallback) {
    const eventSource = new EventSource(`/api/title/stream/${streamID}/subtitle/${label}/render`, {})

    eventSource.onmessage = (event) => {
        const { progress, streamSubtitleInfo } = event.data

        if (streamSubtitleInfo.isDownloaded) {
            onCompleteCallback(streamSubtitleInfo)
            eventSource.close()
            return
        }

        onMessageCallback({ progress, streamSubtitleInfo })
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
