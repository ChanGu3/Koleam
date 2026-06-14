import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { FetchTitleByID } from "../services/Titles/FetchTitle.js"
import { FetchMemberRatingOfTitle, MemberUpdateRatingOfTitle, FetchMemberFavoriteOfTitle, MemberUpdateFavoriteOfTitle } from "../services/account/member.js"

export function useGetTitleByID(titleID) {
    return useQuery({
        queryKey: ["TITLE", "BY_ID", titleID],
        queryFn: async () => await FetchTitleByID(titleID),

        enabled: !!titleID,
    })
}

export function useMemberGetRating(titleID, memberIsSignedIn) {
    return useQuery({
        queryKey: ["USER", "RATING", titleID],
        queryFn: async () => await FetchMemberRatingOfTitle(titleID),
        enabled: !!titleID && !!memberIsSignedIn,
    })
}

export function useMemberUpdateRating(titleID) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["USER", "RATING", titleID],
        mutationFn: async (rating) => await MemberUpdateRatingOfTitle(titleID, rating),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["TITLE", "BY_ID", titleID] })
            queryClient.invalidateQueries({ queryKey: ["USER", "RATING", titleID] })
        },
    })
}

export function useMemberGetFavorite(titleID, memberIsSignedIn) {
    return useQuery({
        queryKey: ["USER", "FAVORITE", titleID],
        queryFn: async () => await FetchMemberFavoriteOfTitle(titleID),
        enabled: !!titleID && !!memberIsSignedIn,
    })
}

export function useMemberUpdateFavorite(titleID) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["USER", "FAVORITE", titleID],
        mutationFn: async () => await MemberUpdateFavoriteOfTitle(titleID),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["USER", "FAVORITE", titleID] })
            queryClient.invalidateQueries({ queryKey: ["USER", "FAVORITES"] })
        },
    })
}
