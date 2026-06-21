import { useQuery } from "@tanstack/react-query"
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
        queryKey: ["INSTALLMENT", "BY_ID", titleID],
        queryFn: async () => await FetchIntallmentsByTitleID(titleID),
        enabled: !!titleID,
    })
}

export function useDeleteInstallment() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["INSTALLMENT", "DELETE"],
        mutationFn: async ({ installmentID }) => await DeleteInstallmentByID(installmentID),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["TITLE"] })
            queryClient.invalidateQueries({ queryKey: ["INSTALLMENT"] })
        },
    })
}

export function useAddInstallment() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["INSTALLMENT", "ADD"],
        mutationFn: async ({ titleID, label, isSeason }) => await AddInstallment({ titleID, label, isSeason }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["TITLE"] })
            queryClient.invalidateQueries({ queryKey: ["INSTALLMENT"] })
        },
    })
}

export function useUpdateInstallment() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["INSTALLMENT", "UPDATE"],
        mutationFn: async ({ installmentID, label = null, isSeason = null, installmentNumber = null }) =>
            await UpdateInstallment(installmentID, {
                label,
                installmentNumber,
                isSeason,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["TITLE"] })
            queryClient.invalidateQueries({ queryKey: ["INSTALLMENT"] })
        },
    })
}
