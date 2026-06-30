import { useEffect, useState } from "react"
import { ACCESS_TYPE } from "../../dev/constants.js"
import useUIConfig from "../hooks/useUIConfig"
import { MemberData, MemberUpdateEmail, MemberUpdatePassword } from "../services/account/member"
import { MemberSignIn, MemberSignOut, MemberSignUp } from "../services/auth/authentification"
import { isMemberAuthorized } from "../services/auth/authorization"
import { useQueryClient } from "@tanstack/react-query"
import { MemberContext } from "./createContext/MemberContext.jsx"

export function MemberCTX({ children }) {
    const queryClient = useQueryClient()
    const { CURRENT_ACCESS_TYPE } = useUIConfig()
    const [memberAccountData, SetMemberAccountData] = useState(null)
    const [memberIsSignedIn, SetMemberIsSignedIn] = useState(null)

    useEffect(() => {
        if (CURRENT_ACCESS_TYPE === ACCESS_TYPE.PUBLIC) {
            if (!memberIsSignedIn) {
                isMemberAuthorized()
                    .then((authorized) => {
                        if (authorized) {
                            MemberData()
                                .then((data) => {
                                    SetMemberAccountData(data)
                                    SetMemberIsSignedIn(true)
                                })
                                .catch(() => {
                                    SetMemberIsSignedIn(false)
                                })
                        } else {
                            SetMemberIsSignedIn(false)
                        }
                    })
                    .catch(() => {
                        SetMemberIsSignedIn(false)
                    })
            } else {
                MemberData().then((data) => {
                    SetMemberAccountData(data)
                })
            }
        }
    }, [memberIsSignedIn, CURRENT_ACCESS_TYPE])

    useEffect(() => {
        if (!memberIsSignedIn) {
            queryClient.invalidateQueries({ queryKey: ["USER"] }).then()
        }
    }, [memberIsSignedIn])

    async function memberSignIn(email, password, SetIsFetching = () => {}) {
        SetIsFetching(true)
        try {
            const signedIn = await MemberSignIn(email, password)

            if (signedIn) {
                const data = await MemberData()
                SetMemberAccountData(data)
                SetMemberIsSignedIn(signedIn)
            }

            SetIsFetching(false)

            return signedIn
        } catch (error) {
            SetMemberIsSignedIn(false)
            SetIsFetching(false)
            throw error
        }
    }

    async function memberSignOut(SetIsFetching = () => {}) {
        SetIsFetching(true)
        try {
            const signedOut = await MemberSignOut()

            SetMemberAccountData(null)
            SetMemberIsSignedIn(!signedOut)

            SetIsFetching(false)

            return signedOut
        } catch (error) {
            SetMemberIsSignedIn(false)
            SetMemberAccountData(null)
            SetIsFetching(false)
            throw error
        }
    }

    async function memberSignUp(email, password, passwordAgain, SetIsFetching = () => {}) {
        SetIsFetching(true)
        try {
            const signedUp = await MemberSignUp(email, password, passwordAgain)

            if (signedUp) {
                const data = await MemberData()
                SetMemberAccountData(data)
                SetMemberIsSignedIn(signedUp)
            }

            SetIsFetching(false)

            return signedUp
        } catch (error) {
            SetMemberIsSignedIn(false)
            SetIsFetching(false)
            throw error
        }
    }

    async function changeEmail(newEmail, SetLoading = () => {}) {
        SetLoading(true)
        try {
            const emailChanged = await MemberUpdateEmail(newEmail)

            if (emailChanged) {
                const data = await MemberData()
                SetMemberAccountData(data)
            }

            SetLoading(false)

            return emailChanged
        } catch (error) {
            SetLoading(false)
            throw error
        }
    }

    async function changePassword(currentPassword, newPassword, newPasswordAgain, SetLoading = () => {}) {
        SetLoading(true)
        try {
            const passwordChanged = await MemberUpdatePassword(currentPassword, newPassword, newPasswordAgain)

            SetLoading(false)

            return passwordChanged
        } catch (error) {
            SetLoading(false)
            throw error
        }
    }

    if (CURRENT_ACCESS_TYPE !== ACCESS_TYPE.PUBLIC) {
        return (
            <MemberContext.Provider
                value={{
                    memberIsSignedIn: null,
                    memberAccountData: null,
                    memberSignIn: null,
                    memberSignOut: null,
                    memberSignUp: null,
                    changeEmail: null,
                    changePassword: null,
                }}
            >
                {children}
            </MemberContext.Provider>
        )
    }

    return (
        <MemberContext.Provider
            value={{
                memberIsSignedIn,
                memberAccountData,
                memberSignIn,
                memberSignOut,
                memberSignUp,
                changeEmail,
                changePassword,
            }}
        >
            {children}
        </MemberContext.Provider>
    )
}
