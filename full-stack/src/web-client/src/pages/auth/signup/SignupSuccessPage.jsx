import { useEffect } from "react"
import TextLink, { TextButton } from "../../../components/text/TextLink.jsx"
import useUIConfig from "../../../hooks/useUIConfig.jsx"
import useMember from "../../../hooks/useMember.jsx"
import { useLocation, useNavigate } from "react-router-dom"
import { FULL_ROUTES } from "../../../constants.js"
import { DefaultSpinner } from "../../../components/Spinners.jsx"

function SignupSuccessPage() {
    const {
        state: { sentfromsignup },
    } = useLocation()
    const { WEBSITE_NAME } = useUIConfig()
    const { memberIsSignedIn } = useMember()
    const navigate = useNavigate()

    useEffect(() => {
        document.title = "Sign Up Succeeded!"

        if (!sentfromsignup || !memberIsSignedIn) {
            navigate(FULL_ROUTES.NOT_FOUND)
        }
    }, [sentfromsignup, memberIsSignedIn, navigate])

    if (!sentfromsignup && !memberIsSignedIn) {
        return (
            <DefaultSpinner
                className="w-full py-10"
                size={{ default: 10 }}
            ></DefaultSpinner>
        )
    }

    return (
        <>
            <main className="flex flex-col items-center justify-center mt-20 space-y-20">
                <p className="font-bold text-3xl text-s-primary">{WEBSITE_NAME}</p>
                <div className="flex flex-col justify-center items-center space-y-6 w-65 md:w-100">
                    <p className="text-center text-os-blue-tertiary font-bold text-lg md:text-2xl">Account Created Successfully!</p>
                    <TextLink
                        className="text-lg md:text-3xl"
                        pathname={FULL_ROUTES.HOME}
                        label={"Home"}
                    />
                </div>
            </main>
        </>
    )
}

export default SignupSuccessPage
