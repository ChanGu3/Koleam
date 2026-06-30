import { useContext } from "react"
import { AdminContext } from "../contexts/createContext/AdminContext.jsx"

/** * Hook for member related functions and data.
 * @returns {{ adminccountData: { username: string } | null, adminSignIn: function, adminSignOut: function, adminIsSignedIn: boolean, changePassword: function }}
 * @throws Will throw an error if used outside of a MemberCTX provider.
 */
function useAdmin() {
    const adminRelatedData = useContext(AdminContext)

    if (adminRelatedData === undefined) {
        throw new Error(`${useAdmin.name} must be used within a ${AdminContext.name} Provider`)
    }

    return adminRelatedData
}

export default useAdmin
