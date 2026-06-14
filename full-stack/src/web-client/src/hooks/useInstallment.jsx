import { useQuery } from "@tanstack/react-query"
import { FetchIntallmentsByTitleID, FetchIntallmentByID } from "../services/Titles/FetchInstallment"

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
