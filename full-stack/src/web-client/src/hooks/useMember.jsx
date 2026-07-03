import { useContext } from "react"
import { MemberContext } from "../contexts/createContext/MemberContext.jsx"
import { useQueryClient, useMutation } from "@tanstack/react-query"
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

export default useMember
