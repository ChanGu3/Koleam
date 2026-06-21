import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
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

export function useGetStreamByID(streamID) {
    return useQuery({
        queryKey: ["STREAM", streamID],
        queryFn: async () => await FetchStreamByID(streamID),
        enabled: !!streamID,
    })
}

export function useDeleteStream() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["STREAM", "DELETE"],
        mutationFn: async ({ streamID }) => await DeleteStreamByID(streamID),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["STREAM"] })
            queryClient.invalidateQueries({ queryKey: ["TITLE"] })
        },
    })
}

export function useAddStream() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["STREAM", "ADD"],
        mutationFn: async ({ titleID, installmentID, label, streamNumber, synopsis, releaseDate, streamThumbnail }) =>
            await AddStream({ titleID, installmentID, label, streamNumber, synopsis, releaseDate, streamThumbnail }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["STREAM"] })
            queryClient.invalidateQueries({ queryKey: ["TITLE"] })
        },
    })
}

export function useUpdateStream() {
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["STREAM"] })
            queryClient.invalidateQueries({ queryKey: ["TITLE"] })
        },
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["USER", "LIKE", streamID] })
            queryClient.invalidateQueries({ queryKey: ["STREAM", streamID] })
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

// VIDEO
export function useAddVideoRender() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["STREAM", "VIDEO", "ADD"],
        mutationFn: async ({ streamID, tempFileID }) => await AddStreamVideo(streamID, tempFileID),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["STREAM"] })
            queryClient.invalidateQueries({ queryKey: ["TITLE"] })
        },
    })
}

export function useUpdateVideoRender() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["STREAM", "VIDEO", "UPDATE"],
        mutationFn: async ({ streamID, tempFileID }) => await UpdateStreamVideo(streamID, tempFileID),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["STREAM"] })
            queryClient.invalidateQueries({ queryKey: ["TITLE"] })
        },
    })
}

export function useDeleteVideoRender() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["STREAM", "VIDEO", "DELETE"],
        mutationFn: async ({ streamID }) => await DeleteStreamVideo(streamID, tempFileID),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["STREAM"] })
            queryClient.invalidateQueries({ queryKey: ["TITLE"] })
        },
    })
}

export function useStreamVideoRenderInfo(streamID, onStartCallback, onMessageCallback, onCompleteCallback, onErrorCallback) {
    return useQuery({
        queryKey: ["STREAM", "VIDEO", streamID, "RENDER_INFO"],
        queryFn: async () => await FetchStreamVideoRenderInfoEventSource(streamID, onStartCallback, onMessageCallback, onCompleteCallback, onErrorCallback),
        enabled: !!streamID,
    })
}

// AUDIO
export function useAddAudioRender() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["STREAM", "AUDIO", "ADD"],
        mutationFn: async ({ streamID, label, streamIndexAudioOnly, tempFileID }) => await AddStreamAudio(streamID, label, streamIndexAudioOnly, tempFileID),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["STREAM"] })
            queryClient.invalidateQueries({ queryKey: ["TITLE"] })
        },
    })
}

export function useUpdateAudioRender() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["STREAM", "AUDIO", "UPDATE"],
        mutationFn: async ({ streamID, label, newFile = null, newLabel = null }) => await UpdateStreamAudio(streamID, label, { newFile, newLabel }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["STREAM"] })
            queryClient.invalidateQueries({ queryKey: ["TITLE"] })
        },
    })
}

export function useDeleteAudioRender() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["STREAM", "AUDIO", "DELETE"],
        mutationFn: async ({ streamID, label }) => await DeleteStreamAudio(streamID, label),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["STREAM"] })
            queryClient.invalidateQueries({ queryKey: ["TITLE"] })
        },
    })
}

export function useStreamAudioRenderInfo(streamID, label, onStartCallback, onMessageCallback, onCompleteCallback, onErrorCallback) {
    return useQuery({
        queryKey: ["STREAM", streamID, "AUDIO", label, "RENDER_INFO"],
        queryFn: async () => await FetchStreamAudioRenderInfoEventSource(streamID, label, onStartCallback, onMessageCallback, onCompleteCallback, onErrorCallback),
        enabled: !!streamID,
    })
}

// SUBTITLE
export function useAddSubtitleRender() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["STREAM", "SUBTITLE", "ADD"],
        mutationFn: async ({ streamID, label, streamIndexSubtitleOnly, tempFileID }) => await AddStreamAudio(streamID, label, streamIndexSubtitleOnly, tempFileID),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["STREAM"] })
            queryClient.invalidateQueries({ queryKey: ["TITLE"] })
        },
    })
}

export function useUpdateSubtitleRender() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["STREAM", "SUBTITLE", "UPDATE"],
        mutationFn: async ({ streamID, label, newFile = null, newLabel = null }) => await UpdateStreamSubtitle(streamID, label, { newFile, newLabel }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["STREAM"] })
            queryClient.invalidateQueries({ queryKey: ["TITLE"] })
        },
    })
}

export function useDeleteSubtitleRender() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["STREAM", "SUBTITLE", "DELETE"],
        mutationFn: async ({ streamID, label }) => await DeleteStreamSubtitle(streamID, label),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["STREAM"] })
            queryClient.invalidateQueries({ queryKey: ["TITLE"] })
        },
    })
}

export function useStreamSubtitleRenderInfo(streamID, label, onStartCallback, onMessageCallback, onCompleteCallback, onErrorCallback) {
    return useQuery({
        queryKey: ["STREAM", streamID, "SUBTITLE", label, "RENDER_INFO"],
        queryFn: async () => await FetchStreamSubtitleRenderInfoEventSource(streamID, label, onStartCallback, onMessageCallback, onCompleteCallback, onErrorCallback),

        enabled: !!streamID,
    })
}
