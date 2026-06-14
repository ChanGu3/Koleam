import { useEffect, useRef, useState } from "react"
import ConfirmationUI from "../../../components/ConfirmationUI.jsx"
import { AuthInputUI } from "../../../components/InputUI.jsx"
import ButtonUI from "../../../components/ButtonUI.jsx"
import { ACCESS_TYPE, FULL_ROUTES } from "../../../constants.js"
import TextLink from "../../../components/text/TextLink.jsx"
import ErrorMsg from "../../../utils/errormsg.mjs"
import { useNavigate } from "react-router-dom"
import useMember from "../../../hooks/useMember.jsx"
import useUIConfig from "../../../hooks/useUIConfig.jsx"
import LoadingPage from "../../other/LoadingPage.jsx"

function SignupPage() {
    const navigate = useNavigate()

    const { memberIsSignedIn, memberSignUp } = useMember()
    const { CURRENT_ACCESS_TYPE } = useUIConfig()
    const [loginName, SetLoginName] = useState("")
    const [password, SetPassword] = useState("")
    const [passwordAgain, SetPasswordAgain] = useState("")
    const [msg, SetMSG] = useState(null)
    const [isLoadingSignUp, SetIsLoadingSignUp] = useState(false)

    const isSigningUpRef = useRef(false)

    useEffect(() => {
        document.title = "Sign Up"

        if (memberIsSignedIn && !isSigningUpRef.current) {
            navigate(FULL_ROUTES.NOT_FOUND)
        }
    }, [memberIsSignedIn, navigate])

    function SignUp() {
        isSigningUpRef.current = true
        memberSignUp(loginName, password, passwordAgain, SetIsLoadingSignUp)
            .then((success) => {
                if (!success) {
                    SetMSG(ErrorMsg.fallback)
                    isSigningUpRef.current = false
                } else {
                    navigate(FULL_ROUTES.SIGN_UP_SUCCESS, { state: { sentfromsignup: true } })
                }
            })
            .catch((err) => {
                SetMSG(err.message)
                isSigningUpRef.current = false
            })
    }

    // prevents naviagation when signed in and renders
    if (CURRENT_ACCESS_TYPE === ACCESS_TYPE.PUBLIC && (memberIsSignedIn === null || memberIsSignedIn)) {
        return <LoadingPage />
    }

    return (
        <>
            <main className="flex flex-col items-center justify-center mt-40 space-y-20">
                <div className="flex flex-col justify-center items-center space-y-6 w-65 md:w-100">
                    <div className="flex flex-col items-center space-y-1 w-full">
                        <p className="text-s-white font-semibold text-xl">Create An Account</p>
                        <p className="md:w-[65%] text-center text-s-white font-thin text-sm">Enter your email and create a password to enable watching videos!</p>
                    </div>
                    <form
                        id="signinForm"
                        name="signinForm"
                        className="w-full flex flex-col space-y-4 items-center justify-center"
                        onSubmit={async (e) => {
                            e.preventDefault()
                            SignUp()
                        }}
                    >
                        <AuthInputUI
                            value={loginName}
                            onChange={(value) => {
                                SetLoginName(value)
                            }}
                            autoComplete={"email"}
                            placeholder={"Email"}
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
                        <AuthInputUI
                            value={passwordAgain}
                            onChange={(value) => {
                                SetPasswordAgain(value)
                            }}
                            autoComplete={"password"}
                            placeholder={"Type Password Again"}
                            isSecret={true}
                        />
                        <ButtonUI
                            className="rounded-sm p-1.5 font-semibold hover:bg-s-tertiary active:bg-s-tertiary/75 bg-s-secondary"
                            label="Sign Up"
                            isFormButton={true}
                            isLoading={isLoadingSignUp}
                        />
                    </form>

                    {/* Error Catching Placement */}
                    <ConfirmationUI msg={msg} />

                    <div className="flex flex-row w-full items-center justify-center">
                        <div className="w-[10%] mt-0.5 border-b border-s-white"></div>
                        <p className="px-2 text-s-dark-secondary text-xs">already have an account?</p>
                        <div className="w-[10%] mt-0.5 border-b border-s-white"></div>
                    </div>
                    <TextLink
                        className="text-sm"
                        label={"Sign In?"}
                        pathname={FULL_ROUTES.SIGN_IN}
                    />
                </div>
            </main>
        </>
    )
}

export default SignupPage
