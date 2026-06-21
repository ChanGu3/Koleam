import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { FetchTitleBySearchQuery, FetchTitleByID, DeleteTitleByID, AddTitle, UpdateTitle } from "../services/Titles/FetchTitle.js"
import { FetchMemberRatingOfTitle, MemberUpdateRatingOfTitle, FetchMemberFavoriteOfTitle, MemberUpdateFavoriteOfTitle } from "../services/account/member.js"

export function useGetTitleByID(titleID) {
    return useQuery({
        queryKey: ["TITLE", titleID],
        queryFn: async () => await FetchTitleByID(titleID),

        enabled: !!titleID,
    })
}

export function useGetTitles(searchGetLimit, newSearchQuery) {
    return useInfiniteQuery({
        queryKey: ["TITLE", "ALL", searchGetLimit, newSearchQuery],
        queryFn: async ({ pageParam = 0 }) => await FetchTitleBySearchQuery(newSearchQuery, searchGetLimit, pageParam),
        getNextageParam: (lastPage, allPages) => (lastPage && lastPage.length === searchGetLimit ? allPages.length * searchGetLimit : undefined),
    })
}

export function useDeleteTitle() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["TITLE", "DELETE"],
        mutationFn: async ({ titleID }) => await DeleteTitleByID(titleID),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["TITLE", "ALL"] })
        },
    })
}

export function useAddTitle() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["TITLE", "ADD"],
        mutationFn: async ({ label, originalTranslation, description, copyright, filmSuitability, filmAgeMin, genres, otherTranslations, contentAdvisories, titleCover }) =>
            await AddTitle({ label, originalTranslation, description, copyright, filmSuitability, filmAgeMin, genres, otherTranslations, contentAdvisories, titleCover }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["TITLE", "ALL"] })
        },
    })
}

export function useUpdateTitle() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["TITLE", "UPDATE"],
        mutationFn: async ({
            titleID,
            label = null,
            originalTranslation = null,
            description = null,
            copyright = null,
            filmSuitability = null,
            filmAgeMin = null,
            listData = null,
            titleCover = null,
        }) =>
            await UpdateTitle(titleID, {
                label,
                originalTranslation,
                description,
                copyright,
                filmSuitability,
                filmAgeMin,
                listData,
                titleCover,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["TITLE"] })
        },
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
