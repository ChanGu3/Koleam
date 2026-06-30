import { useContext } from "react"
import { MemberContext } from "../contexts/createContext/MemberContext.jsx"
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query"
import { DeleteMember } from "../services/FetchMembers.js"

/** * Hook for member related functions and data.
 * @returns {{ memberAccountData: { email: string } | null, memberSignIn: function, memberSignOut: function, memberSignUp: function, memberIsSignedIn: boolean, changeEmail: function, changePassword: function }}
 * @throws Will throw an error if used outside of a MemberCTX provider.
 */
function useMember() {
    const memberRelatedData = useContext(MemberContext)

    if (memberRelatedData === undefined) {
        throw new Error(`${useMember.name} must be used within a ${MemberContext.name} Provider`)
    }

    return memberRelatedData
}

export function useDeleteMember() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (email) => await DeleteMember(email),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ADMINISTRATION", "MODERATION", "MEMBERS"] })
        },
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

export default useMember
