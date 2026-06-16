import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom"

import { COPYRIGHT_NAME, ACCESS_TYPE } from "./constants.js"

import useUIConfig from "./hooks/useUIConfig.jsx"
import useMember from "./hooks/useMember.jsx"
import useAdmin from "./hooks/useAdmin.jsx"

import MainPageWrapper from "./components/main/MainPageWrapper.jsx"

import NotFoundPage from "./pages/NotFoundPage.jsx"
import AboutPage from "./pages/AboutPage.jsx"
import CategoryResultPage from "./pages/discovery/CategoryResultPage.jsx"
import LoadingPage from "./pages/other/LoadingPage.jsx"
import SignupPage from "./pages/auth/signup/SignupPage.jsx"
import HomePage from "./pages/discovery/HomePage.jsx"
import SignInPage from "./pages/auth/SignInPage.jsx"
import SignupSuccessPage from "./pages/auth/signup/SignupSuccessPage.jsx"
import SearchPage from "./pages/discovery/SearchPage.jsx"
import TitleDetailsPage from "./pages/TitleDetailsPage.jsx"
import SafeSpacePage from "./pages/member-only/SafeSpacePage.jsx"

import AnimeStream from "./pages/AnimeStream.jsx"

import MemberAccountPage from "./pages/member-only/MemberAccountPage/MemberAccountPage.jsx"
import AdminAccountPage from "./pages/admin-only/AdminAccountPage/AdminAccountPage.jsx"

import AdminDashboard from "./pages/admin-only/AdminDashboard.jsx"
import AdminTitles from "./pages/admin-only/AdminTitles.jsx"
import AdminMembersControl from "./pages/admin-only/AdminMembersControl.jsx"

import HomeSignOutLocalPage from "./pages/admin-only/HomeSignOutLocalPage.jsx"

function App() {
    const { CURRENT_ACCESS_TYPE } = useUIConfig()
    const { adminIsSignedIn } = useAdmin()

    if (!CURRENT_ACCESS_TYPE || adminIsSignedIn === null) {
        return <LoadingPage />
    }

    return (
        <Router>
            <MainPageWrapper>
                <Routes>
                    {/*Root URL*/}
                    <Route
                        path="/"
                        element={CURRENT_ACCESS_TYPE === ACCESS_TYPE.LOCAL && !adminIsSignedIn ? <HomeSignOutLocalPage /> : <HomePage />} // TODO: NEED TO TEST WITH MEMBER
                    />
                    <Route
                        path="/404"
                        element={<NotFoundPage />}
                    />
                    <Route
                        path="*"
                        element={
                            <Navigate
                                to="/404"
                                replace
                            />
                        }
                    />
                    {/* Koleam Specific */}
                    <Route path={COPYRIGHT_NAME.toLowerCase()}>
                        <Route
                            path="about"
                            element={<AboutPage />}
                        />
                    </Route>

                    <Route element={<RestrictIfLocalAdminSignedOut />}>
                        {/* Discovering */}
                        <Route path="discover">
                            <Route
                                path=""
                                element={
                                    <Navigate
                                        to="/404"
                                        replace
                                    />
                                }
                            />
                            <Route
                                path="search"
                                element={<SearchPage />}
                            />
                            <Route
                                path="genre/:genre"
                                element={<CategoryResultPage isGenre={true} />}
                            />
                            <Route
                                path="A-Z"
                                element={<CategoryResultPage isAZ={true} />}
                            />
                        </Route>

                        {/* Title */}
                        <Route path="title">
                            <Route
                                path=""
                                element={
                                    <Navigate
                                        to="/404"
                                        replace
                                    />
                                }
                            />
                            <Route
                                path=":titleID/:label"
                                element={<TitleDetailsPage />} // TODO STILL GOT TO FIX THIS WAY MORE AND TEST WITH MEMBER
                            />
                        </Route>

                        {/* Streams */}
                        <Route path="stream">
                            <Route
                                path=""
                                element={
                                    <Navigate
                                        to="/404"
                                        replace
                                    />
                                }
                            />
                            <Route
                                path=":streamID/:label"
                                element={<AnimeStream />} // TODO STILL GOT TO FIX THIS WAY MORE AND TEST WITH MEMBER
                            />
                        </Route>
                    </Route>

                    {/* Authentication */}
                    <Route path="auth">
                        <Route
                            path=""
                            element={
                                <Navigate
                                    to="/404"
                                    replace
                                />
                            }
                        />
                        <Route
                            path="signup"
                            element={
                                CURRENT_ACCESS_TYPE === ACCESS_TYPE.PUBLIC ? (
                                    <SignupPage />
                                ) : (
                                    <Navigate
                                        to="/404"
                                        replace
                                    />
                                )
                            }
                        />
                        <Route
                            path="signup/success"
                            element={
                                CURRENT_ACCESS_TYPE === ACCESS_TYPE.PUBLIC ? (
                                    <SignupSuccessPage />
                                ) : (
                                    <Navigate
                                        to="/404"
                                        replace
                                    />
                                )
                            }
                        />
                        <Route
                            path="signin"
                            element={<SignInPage />}
                        />
                    </Route>

                    {/* Member Protected Routes */}
                    <Route element={<RequireMember />}>
                        <Route
                            path="safespace"
                            element={<SafeSpacePage />}
                        />
                        <Route
                            path="settings/member/account"
                            element={<MemberAccountPage />}
                        />
                    </Route>

                    {/* Admin Protected Routes */}
                    <Route element={<RequireAdmin />}>
                        <Route
                            path="settings/admin/account"
                            element={<AdminAccountPage />}
                        />

                        <Route path="administration">
                            <Route
                                path=""
                                element={
                                    <Navigate
                                        to="/404"
                                        replace
                                    />
                                }
                            />
                            <Route
                                path="dashboard"
                                element={<AdminDashboard />}
                            >
                                <Route
                                    path="members"
                                    element={<AdminMembersControl />}
                                />
                                <Route
                                    path="titles"
                                    element={<AdminTitles />}
                                />
                            </Route>
                        </Route>
                    </Route>
                </Routes>
            </MainPageWrapper>
        </Router>
    )
}

export default App

function RequireMember() {
    const { CURRENT_ACCESS_TYPE } = useUIConfig()
    const { memberIsSignedIn } = useMember()

    if (CURRENT_ACCESS_TYPE !== ACCESS_TYPE.PUBLIC)
        return (
            <Navigate
                to="/404"
                replace
            />
        )
    if (memberIsSignedIn === null) return <LoadingPage />
    if (!memberIsSignedIn)
        return (
            <Navigate
                to="/auth/signin"
                replace
            />
        )

    return <Outlet />
}

function RequireAdmin() {
    const { CURRENT_ACCESS_TYPE } = useUIConfig()
    const { adminIsSignedIn } = useAdmin()

    if (CURRENT_ACCESS_TYPE !== ACCESS_TYPE.LOCAL)
        return (
            <Navigate
                to="/404"
                replace
            />
        )
    if (adminIsSignedIn === null) return <LoadingPage />
    if (!adminIsSignedIn)
        return (
            <Navigate
                to="/auth/signin"
                replace
            />
        )

    return <Outlet />
}

function RestrictIfLocalAdminSignedOut() {
    const { CURRENT_ACCESS_TYPE } = useUIConfig()
    const { adminIsSignedIn } = useAdmin()

    if (adminIsSignedIn === null) return <LoadingPage />

    if (CURRENT_ACCESS_TYPE === ACCESS_TYPE.LOCAL && !adminIsSignedIn) {
        console.log("Restricting access to local admin signed out users")
        return (
            <Navigate
                to="/404"
                replace
            />
        )
    }

    return <Outlet />
}
