import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { FetchIntallmentsByTitleID, FetchIntallmentByID, DeleteInstallmentByID, AddInstallment, UpdateInstallment } from "../services/Titles/FetchInstallment"

export function useGetIntallmentByID(installmentID) {
    return useQuery({
        queryKey: ["INSTALLMENT", "BY_ID", installmentID],
        queryFn: async () => await FetchIntallmentByID(installmentID),
        enabled: !!installmentID,
    })
}

export function useGetIntallmentsByTitleID(titleID) {
    return useQuery({
        queryKey: ["INSTALLMENT", "BY_TITLE", "ALL", titleID],
        queryFn: async () => await FetchIntallmentsByTitleID(titleID),
        enabled: !!titleID,
    })
}

export function useDeleteInstallment({ onSuccess = () => {}, onError = () => {} }) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["INSTALLMENT", "DELETE"],
        mutationFn: async ({ installmentID }) => await DeleteInstallmentByID(installmentID),
        onSuccess: async (data, variables, onMutateResult, context) => {
            await queryClient.invalidateQueries({ queryKey: ["TITLE"] })
            await queryClient.invalidateQueries({ queryKey: ["INSTALLMENT"] })
            onSuccess(data, variables, onMutateResult, context)
        },
        onError,
    })
}

export function useAddInstallment({ onSuccess = () => {}, onError = () => {} }) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["INSTALLMENT", "ADD"],
        mutationFn: async ({ titleID, label, isSeason }) => await AddInstallment({ titleID, label, isSeason }),
        onSuccess: async (data, variables, onMutateResult, context) => {
            await queryClient.invalidateQueries({ queryKey: ["TITLE"] })
            await queryClient.invalidateQueries({ queryKey: ["INSTALLMENT"] })
            onSuccess(data, variables, onMutateResult, context)
        },
        onError,
    })
}

export function useUpdateInstallment({ onSuccess = () => {}, onError = () => {} }) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["INSTALLMENT", "UPDATE"],
        mutationFn: async ({ installmentID, label = null, isSeason = null, installmentNumber = null }) =>
            await UpdateInstallment(installmentID, {
                label,
                installmentNumber,
                isSeason,
            }),
        onSuccess: async (data, variables, onMutateResult, context) => {
            await queryClient.invalidateQueries({ queryKey: ["TITLE"] })
            await queryClient.invalidateQueries({ queryKey: ["INSTALLMENT"] })
            onSuccess(data, variables, onMutateResult, context)
        },
        onError,
    })
}
