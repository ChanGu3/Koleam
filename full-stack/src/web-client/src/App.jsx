import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import NotFound from "./pages/NotFound.jsx"
import Home from "./pages/Home.jsx"
import Signin from "./pages/Signin.jsx"
import Signup from "./pages/signup/Signup.jsx"
import SignupSuccess from "./pages/signup/SignupSuccess.jsx"
import About from "./pages/About.jsx"
import Search from "./pages/Search.jsx"
//import SafeSpace from './pages/SafeSpace.jsx'
import CategoryResult from "./pages/CategoryResult.jsx"
//import Categories from './pages/Categories.jsx'
import AnimeDetails from "./pages/AnimeDetails.jsx"
import AnimeStream from "./pages/AnimeStream.jsx"
import ForgotPassword from "./pages/forgotpassword/ForgotPassword"
import ManageMembership from "./pages/settings/ManageMembership"
import EmailPassword from "./pages/settings/EmailPassword"
import PreferredLanguage from "./pages/settings/PreferredLanguage"
import PaymentInfo from "./pages/settings/PaymentInfo"
import BillingHistory from "./pages/settings/BillingHistory"
import Favorites from "./pages/Favorites"
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminMembers from "./pages/admin/AdminMembers"
import AdminTitle from "./pages/admin/AdminTitle.jsx"
import AdminAnalytics from "./pages/admin/AdminAnalytics"

function MemberAuthorization({ children, hideFromMember = false, redirectURL = "/404", restrictIfBanned = false }) {
    const [auth, setAuth] = useState(null)

    useEffect(() => {
        fetch("/api/authorize/member?getData=true", {
            method: "GET",
            credentials: "include",
        })
            .then((response) => {
                if (response.ok) {
                    return response.json()
                } else {
                    setAuth(false)
                }
            })
            .then((data) => {
                if (data.user) {
                    setAuth(true)
                    if (restrictIfBanned) {
                        if (data.user.banned === true) {
                            setAuth(false)
                        }
                    }
                } else {
                    setAuth(false)
                }
            })
            .catch((error) => {
                setAuth(false)
            })
    }, [])

    if (auth === null) {
        return <div></div>
    }

    if (auth && !hideFromMember) {
        return children
    } else if (!auth && hideFromMember) {
        return children
    } else {
        return <Navigate to={redirectURL} replace />
    }
}

function AdminAuthorization({ children, hideFromAdmin = false, redirectURL = "/404" }) {
    const [auth, setAuth] = useState(null)

    useEffect(() => {
        fetch("/api/authorize/admin", {
            method: "GET",
            credentials: "include",
        })
            .then((response) => {
                if (response.ok) {
                    return response.json()
                } else {
                    setAuth(false)
                }
            })
            .then((data) => {
                if (data.success) {
                    setAuth(true)
                } else {
                    setAuth(false)
                }
            })
            .catch((error) => {
                setAuth(false)
            })
    }, [])

    if (auth === null) {
        return <div></div>
    }

    if (auth && !hideFromAdmin) {
        return children
    } else if (!auth && hideFromAdmin) {
        return children
    } else {
        return <Navigate to={redirectURL} replace />
    }
}

function SignOut() {
    const [navigateURL, SetIsNavigate] = useState(null)

    useEffect(() => {
        fetch("/api/authentify/signout", {
            method: "POST",
            headers: { "Content-type": "application/json" },
            credentials: "include",
        })
            .then((response) => {
                if (response.ok) {
                    if (response.status === 200) {
                        SetIsNavigate("/auth/signin")
                    }
                } else {
                    SetIsNavigate("/")
                }
            })
            .catch((err) => {
                SetIsNavigate("/")
            })
    }, [])

    if (navigateURL !== null) {
        return <Navigate to={navigateURL} replace />
    }

    return <div>Loading...</div>
}

function App() {
    return (
        <Router>
            <Routes>
                {/*Root URL*/}
                <Route path="/" element={<Home />} />
                <Route path="/404" element={<NotFound />} />
                <Route path="/about" element={<About />} />
                <Route path="*" element={<Navigate to="/404" replace />} />

                <Route path="discover">
                    <Route path="" element={<Navigate to="/404" replace />} />
                    <Route path="search" element={<Search />} />
                    <Route path="genre/:genre" element={<CategoryResult isGenre={true} isAZ={true} />} />
                    <Route path="other/A-Z" element={<CategoryResult isGenre={false} isAZ={true} />} />
                    {/*<Route path="genres" element={<Categories typeTitle="Genres"/>} />*/}
                    {/*<Route path="other" element={<Categories typeTitle="Other"/>} />*/}
                </Route>

                <Route path="series">
                    <Route path="" element={<Navigate to="/404" replace />} />
                    <Route path=":animeID/:title" element={<AnimeDetails />} />
                </Route>

                <Route path="stream">
                    <Route
                        path=":streamID/:title"
                        element={
                            <MemberAuthorization hideFromMember={false} redirectURL={"/auth/signin"}>
                                <MemberAuthorization restrictIfBanned={true} redirectURL={"/"}>
                                    <AnimeStream />
                                </MemberAuthorization>
                            </MemberAuthorization>
                        }
                    />
                </Route>

                {/* Authentication */}
                <Route path="auth">
                    <Route path="" element={<Navigate to="/404" replace />} />
                    <Route
                        path="signin"
                        element={
                            <MemberAuthorization hideFromMember={true}>
                                <Signin />
                            </MemberAuthorization>
                        }
                    />
                    <Route
                        path="signup"
                        element={
                            <MemberAuthorization hideFromMember={true}>
                                <Signup />
                            </MemberAuthorization>
                        }
                    />
                    <Route path="signup/success" element={<SignupSuccess />} />
                    <Route path="signout" element={<SignOut />} />
                    <Route path="forgot-password" element={<ForgotPassword />} />
                </Route>

                <Route
                    path="/settings/membership"
                    element={
                        <MemberAuthorization>
                            <ManageMembership />
                        </MemberAuthorization>
                    }
                />
                <Route
                    path="/settings/email-password"
                    element={
                        <MemberAuthorization>
                            <EmailPassword />
                        </MemberAuthorization>
                    }
                />
                <Route
                    path="/settings/language"
                    element={
                        <MemberAuthorization>
                            <PreferredLanguage />
                        </MemberAuthorization>
                    }
                />
                <Route
                    path="/settings/payment-info"
                    element={
                        <MemberAuthorization>
                            <PaymentInfo />
                        </MemberAuthorization>
                    }
                />
                <Route
                    path="/settings/billing-history"
                    element={
                        <MemberAuthorization>
                            <BillingHistory />
                        </MemberAuthorization>
                    }
                />
                <Route
                    path="/favorites"
                    element={
                        <MemberAuthorization>
                            <Favorites />
                        </MemberAuthorization>
                    }
                />

                <Route
                    path="/admin"
                    element={
                        <AdminAuthorization>
                            <AdminDashboard />
                        </AdminAuthorization>
                    }>
                    <Route
                        index
                        element={
                            <AdminAuthorization>
                                <AdminMembers />
                            </AdminAuthorization>
                        }
                    />
                    <Route
                        path="title"
                        element={
                            <AdminAuthorization>
                                <AdminTitle />
                            </AdminAuthorization>
                        }
                    />
                    <Route
                        path="analytics"
                        element={
                            <AdminAuthorization>
                                <AdminAnalytics />
                            </AdminAuthorization>
                        }
                    />
                </Route>
            </Routes>
        </Router>
    )
}

export default App
