const {isMemberAuthorized, isAdminAuthorized} = require("../../services/auth/authorization.js")
import { Navigate } from "react-router-dom"

function MemberAccess({ children, redirectURL = "/404" }) {
    const [auth, setAuth] = useState(null)

    useEffect(async () => {
        const isMember = await isMemberAuthorized()
        setAuth(isMember)
    }, [])

    /* Loading Time */
    if (auth === null) {
        return <div></div> // TODO: Add Loading Spinner
    } 
    else if (auth) {
        return children
    } 
    else {
        return <Navigate to={redirectURL} replace />
    }
}

function AdminAccess({ children, redirectURL = "/404" }) {
    const [auth, setAuth] = useState(null)

    useEffect(async () => {
        const isAdmin = await isAdminAuthorized()
        setAuth(isAdmin)
    }, [])

    /* Loading Time */
    if (auth === null) {
        return <div></div> // TODO: Add Loading Spinner
    } 
    else if (auth) {
        return children
    } 
    else {
        return <Navigate to={redirectURL} replace />
    }
}

module.exports = {
    MemberAccess,
    AdminAccess,
}