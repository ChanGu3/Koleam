import "../../tailwind.css"
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import TextLink from "../../components/text/TextLink.jsx"
import ErrorMsg from "../../utils/errormsg.mjs"
import { ACCESS_TYPE } from "../../../dev/constants.js"
import { FULL_ROUTES } from "../../constants.js"
import useUIConfig from "../../hooks/useUIConfig.jsx"
import useMember from "../../hooks/useMember.jsx"
import useAdmin from "../../hooks/useAdmin.jsx"
import ConfirmationUI from "../../components/ConfirmationUI.jsx"
import ButtonUI from "../../components/ButtonUI.jsx"
import { AuthInputUI } from "../../components/InputUI.jsx"
import LoadingPage from "../other/LoadingPage.jsx"

function SignInPage() {
    const { CURRENT_ACCESS_TYPE } = useUIConfig()
    const { memberSignIn, memberIsSignedIn } = useMember()
    const { adminSignIn, adminIsSignedIn } = useAdmin()

    const navigate = useNavigate()

    const [loginName, SetLoginName] = useState("")
    const [password, SetPassword] = useState("")
    const [msg, SetMSG] = useState(null)

    const isSigningUpRef = useRef(false)

    const [isLoading, SetIsLoading] = useState(false)

    useEffect(() => {
        document.title = "Sign In"

        if ((memberIsSignedIn || adminIsSignedIn) && !isSigningUpRef.current) {
            navigate(FULL_ROUTES.NOT_FOUND)
        }
    }, [memberIsSignedIn, adminIsSignedIn, navigate, isLoading])

    function SignIn() {
        isSigningUpRef.current = true
        if (CURRENT_ACCESS_TYPE === ACCESS_TYPE.PUBLIC) {
            memberSignIn(loginName, password, SetIsLoading)
                .then((success) => {
                    if (!success) {
                        SetMSG(ErrorMsg.fallback)
                        isSigningUpRef.current = false
                    } else {
                        navigate(-1)
                    }
                })
                .catch((err) => {
                    SetMSG(err.message)
                    isSigningUpRef.current = false
                })
        } else if (CURRENT_ACCESS_TYPE === ACCESS_TYPE.LOCAL) {
            adminSignIn(loginName, password, SetIsLoading)
                .then((success) => {
                    if (!success) {
                        SetMSG(ErrorMsg.fallback)
                        isSigningUpRef.current = false
                    } else {
                        navigate(-1)
                    }
                })
                .catch((err) => {
                    SetMSG(err.message)
                    isSigningUpRef.current = false
                })
        } else {
            navigate(FULL_ROUTES.NOT_FOUND)
        }
    }

    // prevents naviagation when signed in and renders
    if (
        (CURRENT_ACCESS_TYPE === ACCESS_TYPE.PUBLIC && (memberIsSignedIn === null || memberIsSignedIn)) ||
        (CURRENT_ACCESS_TYPE === ACCESS_TYPE.LOCAL && (adminIsSignedIn === null || adminIsSignedIn))
    ) {
        return <LoadingPage />
    }

    return (
        <>
            <main className="flex flex-col items-center justify-center mt-20 space-y-20">
                <div className="flex flex-col justify-center items-center space-y-6 w-65 md:w-100">
                    <div className="flex flex-col items-center space-y-1 w-full">
                        <p className="text-s-white font-semibold text-xl">Sign In</p>
                        <p className="md:w-[55%] text-center text-s-white font-thin text-sm">Enter Your credentials to access your account!</p>
                    </div>

                    {/* Sign In Form */}
                    <form
                        id="signinForm"
                        name="signinForm"
                        className="w-full flex flex-col space-y-4 items-center justify-center"
                        onSubmit={async (e) => {
                            e.preventDefault()
                            SignIn()
                        }}
                        method="post"
                    >
                        <AuthInputUI
                            value={loginName}
                            onChange={(value) => {
                                SetLoginName(value)
                            }}
                            autoComplete={CURRENT_ACCESS_TYPE === ACCESS_TYPE.PUBLIC ? "email" : "username"}
                            placeholder={CURRENT_ACCESS_TYPE === ACCESS_TYPE.PUBLIC ? "Email" : "Username"}
                            isSecret={false}
                        />
                        <AuthInputUI
                            value={password}
                            onChange={(value) => {
                                SetPassword(value)
                            }}
                            autoComplete={"password"}
                            placeholder={"Password"}
                            isSecret={true}
                        />
                        <ButtonUI
                            className="rounded-sm p-1.5 font-semibold min-w-24 hover:bg-s-tertiary active:bg-s-tertiary/75 bg-s-secondary"
                            label="Sign In"
                            isFormButton={true}
                            isLoading={isLoading}
                        />
                    </form>

                    {/* Error Catching Placement */}
                    <ConfirmationUI msg={msg} />

                    {CURRENT_ACCESS_TYPE === ACCESS_TYPE.PUBLIC && (
                        <>
                            <div className="flex flex-row w-full items-center justify-center">
                                <div className="w-[10%] mt-0.5 border-b border-s-white"></div>
                                <p className="px-2 text-s-dark-secondary text-[10px] md:text-xs">are you not ready to sign in?</p>
                                <div className="w-[10%] mt-0.5 border-b border-s-white"></div>
                            </div>
                            <TextLink
                                className="text-sm"
                                pathname={FULL_ROUTES.SIGN_UP}
                                label={"Sign Up?"}
                            />
                        </>
                    )}
                </div>
            </main>
        </>
    )
}

export default SignInPage
