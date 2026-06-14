import Navbar from "./Navbar"
import Footer from "./Footer"
import useUIConfig from "../../hooks/useUIConfig.jsx"
import useMember from "../../hooks/useMember.jsx"
import useAdmin from "../../hooks/useAdmin.jsx"
import { ACCESS_TYPE } from "../../constants.js"
import { useNavigate } from "react-router-dom"
import { FULL_ROUTES } from "../../constants.js"

function MainPageWrapper({ children }) {
    const { CURRENT_ACCESS_TYPE } = useUIConfig()
    const navigate = useNavigate()
    const { memberIsSignedIn, memberSignOut } = useMember()
    const { adminIsSignedIn, adminSignOut } = useAdmin()

    function SignOut() {
        if (memberIsSignedIn) {
            memberSignOut().then((success) => {
                if (success) {
                    navigate(FULL_ROUTES.SIGN_IN)
                }
            })
        } else if (adminIsSignedIn) {
            adminSignOut().then((success) => {
                if (success) {
                    navigate(FULL_ROUTES.SIGN_IN)
                }
            })
        }
    }

    return (
        <>
            <Navbar SignOut={SignOut} />
            <div className="flex-1">{children}</div>
            <Footer
                isShowingMemberColumns={CURRENT_ACCESS_TYPE === ACCESS_TYPE.PUBLIC && memberIsSignedIn}
                isShowingAdminColumns={CURRENT_ACCESS_TYPE === ACCESS_TYPE.LOCAL && adminIsSignedIn}
                isLoggedIn={adminIsSignedIn || memberIsSignedIn}
                SignOut={SignOut}
            />
        </>
    )
}

export default MainPageWrapper
