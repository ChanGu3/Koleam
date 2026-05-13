import "../tailwind.css"
import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"

function Category({ categoryName, href }) {
    return (
        <a className="hover:bg-[#59CFFF] active:bg-[#59CFFF] text-xs px-1 py-1 w-30" href={href}>
            {categoryName}
        </a>
    )
}

function NavbarOS({ reLoad }) {
    const navigate = useNavigate()

    const categoryDropdownRef = useRef(null)
    const categoriesTabRef = useRef(null)
    const [isCategoryDropped, SetIsCategoryDropped] = useState(false)
    const profileDropdownRef = useRef(null)
    const profileTabRef = useRef(null)
    const [isProfileDropped, SetIsProfileDropped] = useState(false)
    const [genreList, SetGenreList] = useState(null)

    const [isMember, SetIsMember] = useState(false)
    const [isAdmin, SetIsAdmin] = useState(false)
    const [email, SetEmail] = useState(false)

    useEffect(() => {
        fetch("/api/authorize/member/navbar", {
            method: "GET",
            credentials: "include",
        })
            .then((response) => {
                if (response.ok) {
                    return response.json()
                }
            })
            .then((data) => {
                if (data) {
                    if (data.error === undefined) {
                        SetEmail(data.user.email)
                        SetIsMember(true)
                    }
                }
            })
            .catch()

        fetch("/api/authorize/admin", {
            method: "GET",
            credentials: "include",
        })
            .then((response) => {
                if (response.ok) {
                    return response.json()
                }
            })
            .then((data) => {
                if (data.success) {
                    SetIsAdmin(true)
                }
            })
            .catch()

        fetch("/api/title/genre", {
            method: "GET",
        })
            .then((response) => {
                if (response.ok) {
                    return response.json()
                }
            })
            .then((data) => {
                if (data) {
                    SetGenreList(data)
                }
            })
            .catch()

        document.addEventListener("mousedown", OnMouseDown)

        return () => {
            document.removeEventListener("mousedown", OnMouseDown)
        }
    }, [reLoad])

    useEffect(() => {
        if (isCategoryDropped || isProfileDropped) {
            document.body.classList.add("overflow-hidden")
        } else {
            document.body.classList.remove("overflow-hidden")
        }
    }, [isCategoryDropped, isProfileDropped])

    function OnMouseDown(event) {
        if (!categoryDropdownRef.current.contains(event.target) && !categoriesTabRef.current.contains(event.target)) {
            SetIsCategoryDropped(false)
        }

        if (!profileDropdownRef.current.contains(event.target) && !profileTabRef.current.contains(event.target)) {
            SetIsProfileDropped(false)
        }
    }

    return (
        <>
            {/* --- Navbar --- */}
            <nav id="navbar" className="fixed top-0 left-0 w-full h-16 flex flex-row bg-os-dark-tertiary z-98">
                <div className="flex flex-row items-center z-100">
                    {/* Logo Tab */}
                    <a id="logo" className="mx-2 px-1 flex flex-row items-center justify-center hover:brightness-0 hover:invert" href="/">
                        <img className="min-w-6 w-6 mx-1 mt-1" type="image/png" src={"/png/brand-tv-logo.png"} alt="os-tv-logo" />
                        <p className="text-os-blue-primary font-bold text-md hidden md:block">koleam populate this with .env variable in the future</p>
                    </a>

                    {/* Search Tab */}
                    <a className="px-5 flex flex-row items-center cursor-pointer hover:bg-gray-800 active:bg-gray-700 h-full" href="/discover/search">
                        <img className="min-w-4 w-4 mt-0.75" src="/magnifying-glass-zoom-svgrepo-com.svg" alt="search-icon"></img>
                    </a>

                    <div className="relative h-full hidden md:block">
                        {/* Categories Tab */}
                        <button
                            ref={categoriesTabRef}
                            id="categoriestab"
                            name="categoriestab"
                            className={`px-3 ${isCategoryDropped ? "bg-os-blue-tertiary" : ""} flex flex-row items-center justify-center space-x-1 cursor-pointer hover:bg-gray-800 active:bg-gray-700 h-full`}
                            type="button"
                            onClick={() => SetIsCategoryDropped(!isCategoryDropped)}>
                            <p className="text-os-white text-sm">Categories</p>
                            <img className="w-2 mt-1" src="/triangle-filled-svgrepo-com.svg" alt="dropdown-icon"></img>
                        </button>

                        {/* --- Categories Dropdown --- */}
                        <div
                            ref={categoryDropdownRef}
                            id="categoriesdropdown"
                            name="categoriesdropdown"
                            className={`absolute bg-os-blue-tertiary p-2 flex-col gap-y-2  lg:gap-y-0 lg:flex-row ${isCategoryDropped ? "flex" : "hidden"}`}>
                            <div id="genres" className="flex flex-col justify-start">
                                <a className="font-semibold text-xs">Genres</a> {/* hover:underline href="/discover/genres" */}
                                <div className="my-1 border-os-white rounded-sm border-b-2 w-[95%]"></div>
                                <div className="grid grid-flow-col grid-rows-5 gap-y-2 gap-x-1">
                                    {genreList
                                        ? genreList.map((genreData, index) => {
                                              return <Category key={index} categoryName={genreData.name} href={`/discover/genre/${genreData.name}`} />
                                          })
                                        : ""}
                                </div>
                            </div>

                            <div className="m-6 my-0 border-os-white border-l-2 rounded-xs w-auto"></div>

                            <div id="other" className="flex flex-col justify-start">
                                <a className="font-semibold text-xs">Other</a> {/* hover:underline href="/discover/other" */}
                                <div className="my-1 border-os-white rounded-sm border-b-2 w-[95%]"></div>
                                <div className="grid grid-flow-col lg:grid-rows-5 grid-rows-2 gap-y-2 gap-x-1">
                                    <Category categoryName="Browse [A-Z]" href="/discover/other/A-Z" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-os-dark-secondary border-l-2 ml-[14px] rounded-xs h-1/2 w-4"></div>

                    {/* Support Tab */}
                    {/*
                    <a id="support" name="support" className="px-3 flex flex-row items-center justify-center space-x-1 cursor-pointer hover:bg-gray-800 active:bg-gray-700 h-full" href="/support">
                        <p className="text-os-white text-sm">Support</p>
                    </a>
                    */}

                    {/* About Us Tab */}
                    <a
                        id="aboutus"
                        name="aboutus"
                        className="px-3 flex-row items-center justify-center space-x-1 cursor-pointer hover:bg-gray-800 active:bg-gray-700 h-full hidden md:flex"
                        href="/about">
                        <p className="text-os-white text-sm">About Us</p>
                    </a>
                </div>
                <div className="relative h-full ml-auto z-100">
                    {/* Profile Tab */}
                    <button
                        ref={profileTabRef}
                        id="profiletab"
                        name="profiletab"
                        className={`px-4 ${isProfileDropped ? "bg-os-blue-tertiary" : ""} flex flex-row items-center justify-center gap-x-2 cursor-pointer hover:bg-gray-800 active:bg-gray-700 h-full`}
                        type="button"
                        onClick={() => SetIsProfileDropped(!isProfileDropped)}>
                        <p className={`text-os-white  text-[8px] md:text-sm font-semibold ${isMember ? "" : "hidden"}`}>{email}</p>
                        <img
                            className="min-w-7 w-7 mr-1 rounded-full border-1 border-os-white"
                            type="image/png"
                            src={isMember ? "/png/Signed-In-ProfileLogo.png" : "/png/Signed-Out-ProfileLogo.png"}
                            alt="os-tv-logo"
                        />
                        <img className="w-2" src="/triangle-filled-svgrepo-com.svg" alt="dropdown-icon"></img>
                    </button>

                    {/* --- Guest Profile Dropdown --- */}
                    <div
                        ref={(el) => {
                            return !isMember ? (profileDropdownRef.current = el) : null
                        }}
                        id="profiledropdown"
                        name="profiledropdown"
                        className={`absolute right-0 w-35 md:w-60 bg-os-blue-tertiary py-4 px-2 ${isProfileDropped && !isMember ? "flex" : "hidden"} flex-col space-y-4`}>
                        <a className="flex flex-col py-2 pl-2 pr-4 hover:bg-os-blue-secondary active:bg-os-blue-secondary rounded-xs space-y-0.25" href="/auth/signin">
                            <p className="text-sm font-bold">Sign In</p>
                            <p className="text-xs font-semibold text-os-white">
                                Welcome Back! <span className="hidden md:inline">Can't wait to see what your into now!</span>
                            </p>
                        </a>
                        <a className="flex flex-col py-2 pl-2 pr-4 hover:bg-os-blue-secondary active:bg-os-blue-secondary rounded-xs space-y-0.25" href="/auth/signup">
                            <p className="text-sm font-bold">Sign Up</p>
                            <p className="text-xs font-semibold text-os-white">New here? Join now and dive into the world of shows!</p>
                        </a>
                    </div>

                    {/* --- Member Profile Dropdown --- */}
                    <div
                        ref={(el) => {
                            isMember ? (profileDropdownRef.current = el) : null
                        }}
                        id="memberprofiledropdown"
                        name="memberprofiledropdown"
                        className={`absolute right-0 w-[100%] bg-os-blue-tertiary py-4 px-2 ${isProfileDropped && isMember ? "flex" : "hidden"} flex-col space-y-4`}>
                        <div className="flex flex-col space-y-2">
                            <p className="border-b-2 border-os-white text-os-white">Account</p>

                            {/*
                            <a className="flex flex-row items-center hover:bg-os-blue-secondary active:bg-os-blue-secondary rounded-xs space-x-1 px-1 py-1.5 w-[60%]" href="#">
                                <img className="w-5" src="/bed-svgrepo-com.svg" alt="safespace-icon"></img>
                                <p className="text-sm font-semibold">Safe Space</p>
                            </a>
                            */}
                            <Link
                                className="flex flex-row items-center hover:bg-os-blue-secondary active:bg-os-blue-secondary rounded-xs space-x-1 px-1 py-1.5 w-[85%]"
                                to="/favorites">
                                <img className="w-5" src="/star-sharp-svgrepo-com.svg" alt="safespace-icon"></img>
                                <p className="text-xs md:text-sm font-semibold">Favorites</p>
                            </Link>

                            {/*
                            <a className="flex flex-row items-center hover:bg-os-blue-secondary rounded-xs space-x-1 px-1 py-1.5 w-[85%]" href="#">
                                <img className="w-5" src="/profile-1335-svgrepo-com.svg" alt="safespace-icon"></img>
                                <p className="text-xs md:text-sm font-semibold">Profile</p>
                            </a>
                            */}
                            <Link className="flex flex-row items-center hover:bg-os-blue-secondary rounded-xs space-x-1 px-1 py-1.5 w-[85%]" to="/settings/membership">
                                <img className="w-5" src="/gear-1-svgrepo-com.svg" alt="safespace-icon" />
                                <p className="text-xs md:text-sm font-semibold">Settings</p>
                            </Link>
                        </div>

                        {/* ------------ADMIN ONLY-------------- */}
                        <div className={`flex flex-col space-y-2 ${isAdmin ? "" : "hidden"}`}>
                            <p className="border-b-2 border-os-white text-os-white">Admin</p>
                            <Link
                                className="flex flex-row items-center hover:bg-os-blue-secondary active:bg-os-blue-secondary rounded-xs space-x-1 px-1 py-1.5 w-[85%]"
                                to="/admin">
                                <img className="w-5" src="/dashboard-alt-3-svgrepo-com.svg" alt="dashboard-icon"></img>
                                <p className="text-xs md:text-sm font-semibold">Dashboard</p>
                            </Link>
                        </div>
                        {/* ----------------------------------- */}

                        <div className="flex flex-row justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    navigate("/auth/signout")
                                }}
                                className="flex flex-row hover:bg-os-blue-secondary active:bg-os-blue-secondary rounded-xs px-3 py-2 cursor-pointer">
                                <img className="w-5" src="/logout-svgrepo-com.svg" alt="signout-icon"></img>
                                <p className="text-xs md:text-sm font-semibold">Sign Out</p>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* --- Dark Overlay --- */}
            <div id="darkoverlay" className={`fixed bg-black/30 w-full h-[100vh] z-90 ${isCategoryDropped || isProfileDropped ? "" : "hidden"}`}></div>

            {/* NAVBAR MARGIN FITTING */}
            <div className="w-full h-16"> </div>
        </>
    )
}

export default NavbarOS
