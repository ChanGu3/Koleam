import { useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query"
import { GetAllGenres, AddGenre, DeleteGenre } from "../services/Titles/FetchGenre.js"

export function useGetGenres(searchGetLimit) {
    return useInfiniteQuery({
        queryKey: ["GENRE", "ALL", searchGetLimit],
        queryFn: async ({ pageParam = 0 }) => await GetAllGenres(searchGetLimit, pageParam),
        getNextPageParam: (lastPage, allPages) =>
            lastPage && lastPage.length === searchGetLimit ? allPages.length * searchGetLimit : undefined,
    })
}

export function useDeleteGenre({ onSuccess, onError }) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["GENRE", "DELETE", name],
        mutationFn: async (name) => await DeleteGenre(name),
        onSuccess: (data, variables, onMutateResult, context) => {
            queryClient.invalidateQueries({ queryKey: ["GENRE", "ALL"] })
            onSuccess(data, variables, onMutateResult, context)
        },
        onError,
    })
}

export function useAddGenre({ onSuccess, onError }) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["GENRE", "ADD"],
        mutationFn: async ({ name }) => await AddGenre({ name }),
        onSuccess: (data, variables, onMutateResult, context) => {
            queryClient.invalidateQueries({ queryKey: ["GENRE", "ALL"] })
            onSuccess(data, variables, onMutateResult, context)
        },
        onError,
    })
}
