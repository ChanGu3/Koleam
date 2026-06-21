import { useMutation, useQueryClient } from "@tanstack/react-query"
import { GetAllGenres, AddGenre, DeleteGenre } from "../services/Titles/FetchGenre.js"

export function useGetGenres(searchGetLimit) {
    return useInfiniteQuery({
        queryKey: ["GENRE", "ALL", searchGetLimit],
        queryFn: async ({ pageParam = 0 }) => await GetAllGenres(searchGetLimit, pageParam),
        getNextageParam: (lastPage, allPages) => (lastPage && lastPage.length === searchGetLimit ? allPages.length * searchGetLimit : undefined),
    })
}

export function useDeleteGenre(name) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["GENRE", "DELETE", name],
        mutationFn: async () => await DeleteGenre(name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["GENRE", "ALL"] })
        },
    })
}

export function useAddGenre() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["GENRE", "ADD"],
        mutationFn: async ({ name }) => await AddTitle({ name }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["GENRE", "ALL"] })
        },
    })
}
