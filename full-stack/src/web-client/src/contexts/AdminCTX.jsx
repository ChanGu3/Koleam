import { createContext, useEffect, useState } from "react"
import { ACCESS_TYPE } from "../constants"
import useUIConfig from "../hooks/useUIConfig"
import { AdminSignOut, AdminSignIn } from "../services/auth/authentification"
import { isAdminAuthorized } from "../services/auth/authorization"
import { AdminData, AdminUpdatePassword } from "../services/account/admin"
import { useQueryClient } from "@tanstack/react-query"

export const AdminContext = createContext(undefined)

export function AdminCTX({ children }) {
    const queryClient = useQueryClient()
    const { CURRENT_ACCESS_TYPE } = useUIConfig()
    const [adminAccountData, SetAdminAccountData] = useState(null) // change data into a query hook
    const [adminIsSignedIn, SetAdminIsSignedIn] = useState(null)
    useEffect(() => {
        if (CURRENT_ACCESS_TYPE === ACCESS_TYPE.LOCAL) {
            if (!adminIsSignedIn) {
                isAdminAuthorized()
                    .then((authorized) => {
                        if (authorized) {
                            AdminData()
                                .then((data) => {
                                    SetAdminAccountData(data)
                                    SetAdminIsSignedIn(true)
                                })
                                .catch(() => {
                                    SetAdminIsSignedIn(false)
                                })
                        } else {
                            SetAdminIsSignedIn(false)
                        }
                    })
                    .catch(() => {
                        SetAdminIsSignedIn(false)
                    })
            } else {
                AdminData().then((data) => {
                    SetAdminAccountData(data)
                })
            }
        }
    }, [adminIsSignedIn, CURRENT_ACCESS_TYPE])

    useEffect(() => {
        if (!adminIsSignedIn) {
            queryClient.invalidateQueries({ queryKey: ["ADMIN"] }).then()
        }
    }, [adminIsSignedIn])

    async function adminSignIn(email, password, SetIsFetching = () => {}) {
        SetIsFetching(true)
        try {
            const signedIn = await AdminSignIn(email, password)

            if (signedIn) {
                const data = await AdminData()
                SetAdminAccountData(data)
                SetAdminIsSignedIn(signedIn)
            }

            SetIsFetching(false)

            return signedIn
        } catch (error) {
            SetAdminIsSignedIn(false)
            SetIsFetching(false)
            throw error
        }
    }

    async function adminSignOut(SetIsFetching = () => {}) {
        SetIsFetching(true)
        try {
            const signedOut = await AdminSignOut()

            SetAdminAccountData(null)
            SetAdminIsSignedIn(!signedOut)

            SetIsFetching(false)

            return signedOut
        } catch (error) {
            SetAdminIsSignedIn(false)
            SetAdminAccountData(null)
            SetIsFetching(false)
            throw error
        }
    }

    async function changePassword(currentPassword, newPassword, newPasswordAgain, SetLoading = () => {}) {
        SetLoading(true)
        try {
            const passwordChanged = await AdminUpdatePassword(currentPassword, newPassword, newPasswordAgain)

            SetLoading(false)

            return passwordChanged
        } catch (error) {
            SetLoading(false)
            throw error
        }
    }

    if (CURRENT_ACCESS_TYPE !== ACCESS_TYPE.LOCAL) {
        return (
            <AdminContext.Provider
                value={{
                    adminIsSignedIn: null,
                    adminAccountData: null,
                    adminSignIn: null,
                    adminSignOut: null,
                    changePassword: null,
                }}
            >
                {children}
            </AdminContext.Provider>
        )
    }

    return (
        <AdminContext.Provider
            value={{
                adminIsSignedIn,
                adminAccountData,
                adminSignIn,
                adminSignOut,
                changePassword,
            }}
        >
            {children}
        </AdminContext.Provider>
    )
}
