import {AdminSignOut, MemberSignOut} from "../../services/auth/authentification.cjs";
import { Navigate } from "react-router-dom"

function AdminSignOut() {
    const [navigatePoint, SetNavigatePoint] = useState(null)


    useEffect(async () => {
        const hasSignedOut = await AdminSignOut()

        if(hasSignedOut) {
            SetNavigatePoint("/auth/signin")
        }
        else {
            SetNavigatePoint("/")
        }
    }, [])

    if (navigatePoint === null) {
       return <div>Loading...</div> // TODO: Add Loading Spinner
    }

    return <Navigate to={navigatePoint} replace />
}

function MemberSignOut() {
    const [navigatePoint, SetNavigatePoint] = useState(null)


    useEffect(async () => {
        const hasSignedOut = await MemberSignOut()

        if(hasSignedOut) {
            SetNavigatePoint("/auth/signin")
        }
        else {
            SetNavigatePoint("/")
        }
    }, [])

    if (navigatePoint === null) {
       return <div>Loading...</div> // TODO: Add Loading Spinner
    }

    return <Navigate to={navigatePoint} replace />
}

module.exports = {
    AdminSignOut,
    MemberSignOut,
}