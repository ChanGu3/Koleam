import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
    FetchLogStream,
    FetchStreamByID,
    DeleteStreamByID,
    AddStream,
    UpdateStream,
    AddStreamVideo,
    UpdateStreamVideo,
    DeleteStreamVideo,
    FetchStreamVideoRenderInfoEventSource,
    AddStreamAudio,
    UpdateStreamAudio,
    DeleteStreamAudio,
    FetchStreamAudioRenderInfoEventSource,
    AddStreamSubtitle,
    UpdateStreamSubtitle,
    DeleteStreamSubtitle,
    FetchStreamSubtitleRenderInfoEventSource,
} from "../services/Titles/FetchStream.js"
import { FetchMemberLikeOfStream, MemberUpdateLikeOfStream } from "../services/account/member.js"
import { FetchTitleInstallmentStreamHistory } from "../services/Titles/FetchTitle.js"

//TODO: Using RenderInfo for subtitle and audio is not good for performance seperately I would also need to maodify them if i want to use them to not invalidate queries if more than one is being used especially all together for now just not going to use eventSource with it since its unecessary network traffic (possibly create one entire loading RenderInfo for all media would probably be better in fact I need to do more batch requests)

export function useGetStreamByID(streamID) {
    return useQuery({
        queryKey: ["STREAM", streamID],
        queryFn: async () => await FetchStreamByID(streamID),
        enabled: !!streamID,
    })
}

export function useGetLogStream(streamID) {
    return useQuery({
        queryKey: ["STREAM", "LOG", streamID],
        queryFn: async () => await FetchLogStream(streamID),
        enabled: !!streamID,
    })
}

export function getThumbnailURL(streamID, coverVersion) {
    return `/api/title/stream/${streamID}/thumbnail.jpg?v=${coverVersion}`
}

export function useGetThumbnailCoverVersion(streamID) {
    return useQuery({
        queryKey: ["STREAM", "THUMBNAIL_VERSION", streamID],
        queryFn: () => Date.now(),
        enabled: !!streamID,
        staleTime: Infinity,
    })
}

export function getM3u8URL(streamID, m3u8Version) {
    return `/api/title/stream/${streamID}/master.m3u8?v=${m3u8Version}`
}

export function useGetM3u8Version(streamID) {
    return useQuery({
        queryKey: ["STREAM", "M3U8_VERSION", streamID],
        queryFn: () => Date.now(),
        enabled: !!streamID,
        staleTime: Infinity,
    })
}

export function useDeleteStream({ onSuccess = () => {}, onError = () => {} }) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["STREAM", "DELETE"],
        mutationFn: async ({ streamID }) => await DeleteStreamByID(streamID),
        onSuccess: async (data, variables, onMutateResult, context) => {
            const { titleID, streamID } = variables
            // Invalidate queries for title lists because stream counts will change.
            await queryClient.invalidateQueries({ queryKey: ["TITLE", "ADMINISTRATION", "SEARCH"] })
            await queryClient.invalidateQueries({ queryKey: ["TITLE", titleID] })
            await queryClient.invalidateQueries({ queryKey: ["INSTALLMENT", "BY_TITLE", "ALL", titleID] })
            await queryClient.invalidateQueries({ queryKey: ["STREAM", streamID] })
            onSuccess(data, variables, onMutateResult, context)
        },
        onError,
    })
}

export function useAddStream({ onSuccess = () => {}, onError = () => {} }) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["STREAM", "ADD"],
        mutationFn: async ({ titleID, installmentID, label, streamNumber, synopsis, releaseDate, streamThumbnail }) =>
            await AddStream({ titleID, installmentID, label, streamNumber, synopsis, releaseDate, streamThumbnail }),
        onSuccess: async (data, variables, onMutateResult, context) => {
            const { titleID } = variables
            await queryClient.invalidateQueries({ queryKey: ["TITLE", "ADMINISTRATION", "SEARCH"] })
            await queryClient.invalidateQueries({ queryKey: ["TITLE", titleID] })
            await queryClient.invalidateQueries({ queryKey: ["INSTALLMENT", "BY_TITLE", "ALL", titleID] })

            onSuccess(data, variables, onMutateResult, context)
        },
        onError,
    })
}

export function useUpdateStream({ onSuccess = () => {}, onError = () => {} }) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["STREAM", "UPDATE"],
        mutationFn: async ({ streamID, label = null, streamNumber = null, synopsis = null, releaseDate = null, streamThumbnail = null }) =>
            await UpdateStream(streamID, {
                label,
                streamNumber,
                synopsis,
                releaseDate,
                streamThumbnail,
            }),
        onSuccess: async (data, variables, onMutateResult, context) => {
            const { streamID, titleID } = variables
            await queryClient.invalidateQueries({ queryKey: ["INSTALLMENT", "LIST", titleID] })
            await queryClient.invalidateQueries({ queryKey: ["STREAM", streamID] })
            await queryClient.invalidateQueries({ queryKey: ["STREAM", "THUMBNAIL_VERSION", streamID] })
            onSuccess(data, variables, onMutateResult, context)
        },
        onError,
    })
}

export function useMemberGetLike(streamID, memberIsSignedIn) {
    return useQuery({
        queryKey: ["USER", "LIKE", streamID],
        queryFn: async () => await FetchMemberLikeOfStream(streamID),
        enabled: !!streamID && !!memberIsSignedIn,
    })
}

export function useMemberUpdateLike(streamID) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["USER", "LIKE", streamID],
        mutationFn: async () => await MemberUpdateLikeOfStream(streamID),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["USER", "LIKE", streamID] })
            await queryClient.invalidateQueries({ queryKey: ["STREAM", streamID] })
        },
    })
}

export function useMemberGetWatchHistory(limit = 12, offset = 0, memberIsSignedIn) {
    return useQuery({
        queryKey: ["USER", "WATCH_HISTORY"],
        queryFn: async () => await FetchTitleInstallmentStreamHistory(limit, offset),
        enabled: !!memberIsSignedIn,
    })
}

//
// MEDIA
//

export async function invalidateAddingStreamQueries(queryClient, streamID, audios = [], subtitles = []) {
    await queryClient.invalidateQueries({ queryKey: ["STREAM", streamID] })

    // DO NOT await these, as the EventSource queries function never "resolves".
    queryClient.invalidateQueries({ queryKey: ["STREAM", "VIDEO", streamID, "RENDER_INFO"] })

    for (const audio of audios) {
        const { label } = audio
        queryClient.invalidateQueries({ queryKey: ["STREAM", streamID, "AUDIO", label, "RENDER_INFO"] })
    }

    for (const subtitle of subtitles) {
        const { label, isCC } = subtitle
        queryClient.invalidateQueries({ queryKey: ["STREAM", streamID, "SUBTITLE", label, isCC, "RENDER_INFO"] })
    }
}

// VIDEO
export function useAddVideoRender({ onSuccess = () => {}, onError = () => {}, invalidateQueries = true }) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["STREAM", "VIDEO", "ADD"],
        mutationFn: async ({ streamID, tempFileID }) => await AddStreamVideo(streamID, tempFileID),
        onSuccess: async (data, variables, onMutateResult, context) => {
            if (invalidateQueries) {
                const { streamID } = variables
                await queryClient.invalidateQueries({ queryKey: ["STREAM", streamID] })

                // DO NOT await this, as the EventSource query function never "resolves".
                queryClient.invalidateQueries({ queryKey: ["STREAM", "VIDEO", streamID, "RENDER_INFO"] })
            }

            // useStreamVideoRenderInfo hook when the job is complete.
            onSuccess(data, variables, onMutateResult, context)
        },
        onError,
    })
}

export function useUpdateVideoRender({ onSuccess = () => {}, onError = () => {}, invalidateQueries = true }) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["STREAM", "VIDEO", "UPDATE"],
        mutationFn: async ({ streamID, tempFileID }) => await UpdateStreamVideo(streamID, tempFileID),
        onSuccess: async (data, variables, onMutateResult, context) => {
            if (invalidateQueries) {
                const { streamID } = variables
                await queryClient.invalidateQueries({ queryKey: ["STREAM", streamID] })

                // DO NOT await these, as the EventSource queries function never "resolves".
                queryClient.invalidateQueries({ queryKey: ["STREAM", "VIDEO", streamID, "RENDER_INFO"] })
                queryClient.invalidateQueries({ queryKey: ["STREAM", streamID, "AUDIO", label, "RENDER_INFO"] })
                queryClient.invalidateQueries({ queryKey: ["STREAM", streamID, "SUBTITLE", label, isCC, "RENDER_INFO"] })

                // DO NOT await this, as the EventSource query function never "resolves".
                queryClient.invalidateQueries({ queryKey: ["STREAM", "VIDEO", streamID, "RENDER_INFO"] })
            }

            // useStreamVideoRenderInfo hook when the job is complete.
            onSuccess(data, variables, onMutateResult, context)
        },
        onError,
    })
}

export function useDeleteVideoRender({ onSuccess = () => {}, onError = () => {} }) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["STREAM", "VIDEO", "DELETE"],
        mutationFn: async ({ streamID }) => await DeleteStreamVideo(streamID),
        onSuccess: async (data, variables, onMutateResult, context) => {
            const { streamID } = variables
            await queryClient.invalidateQueries({ queryKey: ["STREAM", streamID] })
            await queryClient.invalidateQueries({ queryKey: ["STREAM", "M3U8_VERSION", streamID] })
            onSuccess(data, variables, onMutateResult, context)
        },
        onError,
    })
}

export function useStreamVideoRenderInfo(streamID, onStartCallback, onMessageCallback, onCompleteCallback, onErrorCallback, isDownloaded) {
    const queryClient = useQueryClient()
    return useQuery({
        queryKey: ["STREAM", "VIDEO", streamID, "RENDER_INFO"],
        queryFn: async () => {
            if (isDownloaded) {
                return null
            }
            await FetchStreamVideoRenderInfoEventSource(
                streamID,
                onStartCallback,
                onMessageCallback,
                async (streamVideoData) => {
                    await queryClient.invalidateQueries({ queryKey: ["STREAM", streamID] })
                    await queryClient.invalidateQueries({ queryKey: ["STREAM", "M3U8_VERSION", streamID] })
                    onCompleteCallback(streamVideoData)
                },
                onErrorCallback
            )
        },
        enabled: !!streamID,
    })
}

// AUDIO
export function useAddAudioRender({ onSuccess = () => {}, onError = () => {}, invalidateQueries = true }) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["STREAM", "AUDIO", "ADD"],
        mutationFn: async ({ streamID, label, streamIndexAudioOnly, tempFileID }) => await AddStreamAudio(streamID, label, streamIndexAudioOnly, tempFileID),
        onSuccess: async (data, variables, onMutateResult, context) => {
            if (invalidateQueries) {
                const { streamID, label } = variables
                await queryClient.invalidateQueries({ queryKey: ["STREAM", streamID] })

                // DO NOT await this, as the EventSource query function never "resolves".
                queryClient.invalidateQueries({ queryKey: ["STREAM", streamID, "AUDIO", label, "RENDER_INFO"] })
            }

            // useStreamAudioRenderInfo hook when the job is complete.
            onSuccess(data, variables, onMutateResult, context)
        },
        onError,
    })
}

export function useUpdateAudioRender({ onSuccess = () => {}, onError = () => {} }) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["STREAM", "AUDIO", "UPDATE"],
        mutationFn: async ({ streamID, label, newFile = null, newLabel = null }) => await UpdateStreamAudio(streamID, label, { newFile, newLabel }),
        onSuccess: async (data, variables, onMutateResult, context) => {
            const { streamID, label, newFile, newLabel } = variables
            await queryClient.invalidateQueries({ queryKey: ["STREAM", streamID] })
            await queryClient.invalidateQueries({ queryKey: ["STREAM", "M3U8_VERSION", streamID] })
            if (newFile) {
                queryClient.invalidateQueries({ queryKey: ["STREAM", streamID, "AUDIO", newLabel || label, "RENDER_INFO"] })
            }
            onSuccess(data, variables, onMutateResult, context)
        },
        onError,
    })
}

export function useDeleteAudioRender({ onSuccess = () => {}, onError = () => {} }) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["STREAM", "AUDIO", "DELETE"],
        mutationFn: async ({ streamID, label }) => await DeleteStreamAudio(streamID, label),
        onSuccess: async (data, variables, onMutateResult, context) => {
            const { streamID } = variables
            await queryClient.invalidateQueries({ queryKey: ["STREAM", streamID] })
            await queryClient.invalidateQueries({ queryKey: ["STREAM", "M3U8_VERSION", streamID] })
            onSuccess(data, variables, onMutateResult, context)
        },
        onError,
    })
}

export function useStreamAudioRenderInfo(streamID, label, onStartCallback, onMessageCallback, onCompleteCallback, onErrorCallback, isDownloaded) {
    const queryClient = useQueryClient()
    return useQuery({
        queryKey: ["STREAM", streamID, "AUDIO", label, "RENDER_INFO"],
        queryFn: async () => {
            if (isDownloaded) {
                return null
            }
            await FetchStreamAudioRenderInfoEventSource(
                streamID,
                label,
                onStartCallback,
                onMessageCallback,
                async (streamAudioData) => {
                    await queryClient.invalidateQueries({ queryKey: ["STREAM", streamID] })
                    await queryClient.invalidateQueries({ queryKey: ["STREAM", "M3U8_VERSION", streamID] })
                    onCompleteCallback(streamAudioData)
                },
                onErrorCallback
            )
        },
        enabled: !!streamID,
    })
}

// SUBTITLE
export function useAddSubtitleRender({ onSuccess = () => {}, onError = () => {}, invalidateQueries = true }) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["STREAM", "SUBTITLE", "ADD"],
        mutationFn: async ({ streamID, label, isCC, streamIndexSubtitleOnly, tempFileID }) => await AddStreamSubtitle(streamID, label, isCC, streamIndexSubtitleOnly, tempFileID),
        onSuccess: async (data, variables, onMutateResult, context) => {
            if (invalidateQueries) {
                const { streamID, label, isCC } = variables
                await queryClient.invalidateQueries({ queryKey: ["STREAM", streamID] })

                // DO NOT await this, as the EventSource query function never "resolves".
                queryClient.invalidateQueries({ queryKey: ["STREAM", streamID, "SUBTITLE", label, isCC, "RENDER_INFO"] })
            }

            // useStreamSubtitleRenderInfo hook when the job is complete.
            onSuccess(data, variables, onMutateResult, context)
        },
        onError,
    })
}

export function useUpdateSubtitleRender({ onSuccess = () => {}, onError = () => {} }) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["STREAM", "SUBTITLE", "UPDATE"],
        mutationFn: async ({ streamID, label, isCC, newFile = null, newLabel = null, newIsCC = null }) =>
            await UpdateStreamSubtitle(streamID, label, isCC, { newFile, newLabel, newIsCC }),
        onSuccess: async (data, variables, onMutateResult, context) => {
            const { streamID, label, newFile, newLabel } = variables
            await queryClient.invalidateQueries({ queryKey: ["STREAM", streamID] })
            await queryClient.invalidateQueries({ queryKey: ["STREAM", "M3U8_VERSION", streamID] })
            if (newFile) {
                queryClient.invalidateQueries({ queryKey: ["STREAM", streamID, "SUBTITLE", newLabel || label, "RENDER_INFO"] })
            }
            onSuccess(data, variables, onMutateResult, context)
        },
        onError,
    })
}

export function useDeleteSubtitleRender({ onSuccess = () => {}, onError = () => {} }) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["STREAM", "SUBTITLE", "DELETE"],
        mutationFn: async ({ streamID, label, isCC }) => await DeleteStreamSubtitle(streamID, label, isCC),
        onSuccess: async (data, variables, onMutateResult, context) => {
            const { streamID } = variables
            await queryClient.invalidateQueries({ queryKey: ["STREAM", streamID] })
            await queryClient.invalidateQueries({ queryKey: ["STREAM", "M3U8_VERSION", streamID] })
            onSuccess(data, variables, onMutateResult, context)
        },
        onError,
    })
}

export function useStreamSubtitleRenderInfo(streamID, label, isCC, onStartCallback, onMessageCallback, onCompleteCallback, onErrorCallback, isDownloaded) {
    const queryClient = useQueryClient()
    return useQuery({
        queryKey: ["STREAM", streamID, "SUBTITLE", label, isCC, "RENDER_INFO"],
        queryFn: async () => {
            if (isDownloaded) {
                return null
            }
            await FetchStreamSubtitleRenderInfoEventSource(
                streamID,
                label,
                isCC,
                onStartCallback,
                onMessageCallback,
                async (streamSubtitleData) => {
                    await queryClient.invalidateQueries({ queryKey: ["STREAM", streamID] })
                    await queryClient.invalidateQueries({ queryKey: ["STREAM", "M3U8_VERSION", streamID] })
                    onCompleteCallback(streamSubtitleData)
                },
                onErrorCallback
            )
        },

        enabled: !!streamID,
    })
}
