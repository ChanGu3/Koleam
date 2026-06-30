import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query"
import { FetchTitleBySearchQuery, FetchTitleByID, DeleteTitleByID, AddTitle, UpdateTitle } from "../services/Titles/FetchTitle.js"
import { FetchMemberRatingOfTitle, MemberUpdateRatingOfTitle, FetchMemberFavoriteOfTitle, MemberUpdateFavoriteOfTitle } from "../services/account/member.js"

export function useGetTitleByID(titleID) {
    return useQuery({
        queryKey: ["TITLE", titleID],
        queryFn: async () => await FetchTitleByID(titleID),

        enabled: !!titleID,
    })
}

export function getCoverTitleURL(titleID, coverVersion) {
    return `/api/title/${titleID}/cover.jpg?v=${coverVersion}`
}

export function useGetTitleCoverVersion(titleID) {
    return useQuery({
        queryKey: ["TITLE", "COVER_VERSION", titleID],
        queryFn: () => Date.now(),
        enabled: !!titleID,
        staleTime: Infinity,
    })
}

export function useGetTitles(searchGetLimit, newSearchQuery) {
    return useInfiniteQuery({
        queryKey: ["TITLE", "ALL", searchGetLimit, newSearchQuery],
        queryFn: async ({ pageParam = 0 }) => await FetchTitleBySearchQuery(newSearchQuery, searchGetLimit, pageParam),
        getNextPageParam: (lastPage, allPages) => (lastPage && lastPage.length === searchGetLimit ? allPages.length * searchGetLimit : undefined),
    })
}

export function useDeleteTitle({ onSuccess, onError }) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["TITLE", "DELETE"],
        mutationFn: async (titleID) => await DeleteTitleByID(titleID),
        onSuccess: async (data, variables, onMutateResult, context) => {
            await queryClient.invalidateQueries({ queryKey: ["TITLE", "ADMINISTRATION", "SEARCH"] })
            onSuccess(data, variables, onMutateResult, context)
        },
        onError,
    })
}

export function useAddTitle({ onError, onSuccess }) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["TITLE", "ADD"],
        mutationFn: async ({ label, originalTranslation, description, copyright, filmSuitability, filmAgeMin, genres, otherTranslations, contentAdvisories, titleCover }) =>
            await AddTitle({ label, originalTranslation, description, copyright, filmSuitability, filmAgeMin, genres, otherTranslations, contentAdvisories, titleCover }),
        onSuccess: async (data, variables, onMutateResult, context) => {
            await queryClient.invalidateQueries({ queryKey: ["TITLE", "ADMINISTRATION", "SEARCH"] })
            await queryClient.invalidateQueries({ queryKey: ["TITLE", "ALL"] })
            onSuccess(data, variables, onMutateResult, context)
        },
        onError,
    })
}

export function useUpdateTitle({ onError, onSuccess }) {
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
        onSuccess: async (data, variables, onMutateResult, context) => {
            await queryClient.invalidateQueries({ queryKey: ["TITLE", variables.titleID] })
            await queryClient.invalidateQueries({ queryKey: ["TITLE", "ADMINISTRATION", "SEARCH"] })
            await queryClient.invalidateQueries({ queryKey: ["TITLE", "COVER_VERSION", variables.titleID] })
            onSuccess(data, variables, onMutateResult, context)
        },
        onError,
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
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["TITLE", "BY_ID", titleID] })
            await queryClient.invalidateQueries({ queryKey: ["USER", "RATING", titleID] })
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
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["USER", "FAVORITE", titleID] })
            await queryClient.invalidateQueries({ queryKey: ["USER", "FAVORITES"] })
        },
    })
}
