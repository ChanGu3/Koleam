import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { FetchStreamByID } from "../services/Titles/FetchStream.js"
import { FetchMemberLikeOfStream, MemberUpdateLikeOfStream } from "../services/account/member.js"
import { FetchTitleInstallmentStreamHistory } from "../services/Titles/FetchTitle.js"

export function useGetStreamByID(streamID) {
    return useQuery({
        queryKey: ["STREAM", "BY_ID", streamID],
        queryFn: async () => await FetchStreamByID(streamID),
        enabled: !!streamID,
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
            queryClient.invalidateQueries({ queryKey: ["STREAM", "BY_ID", streamID] })
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
