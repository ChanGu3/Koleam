import "../../tailwind.css"
import { useEffect, useState, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import useUIConfig from "../../hooks/useUIConfig.jsx"
import { Search, CircleUser, CircleQuestionMark, Settings } from "lucide-react"
import useMember from "../../hooks/useMember.jsx"
import useAdmin from "../../hooks/useAdmin.jsx"
import { GetAllGenres } from "../../services/Titles/FetchGenre.js"
import NavbarDropdownTab from "./NavbarComponents/NavbarDropdownTab.jsx"
import { CircleArrowRight, Bolt, BookHeart, Cloud, ShieldUser } from "lucide-react"
import NavbarTab from "./NavbarComponents/NavbarTab.jsx"
import { VerticalQueryScrollable, VerticalScrollable } from "../Scrollable.jsx"
import { ACCESS_TYPE } from "../../../dev/constants.js"
import { FILLED_ROUTES, FULL_ROUTES, Z_INDEX } from "../../constants.js"

function Navbar({ SignOut = () => {} }) {
    const navRef = useRef(null)
    const [navOffsetHeight, SetNavOffsetHeight] = useState(0) // Force Re-render for Dropdown Vector Positioning on Window Resize

    // Contexts Data By Hooks
    const { WEBSITE_NAME, CURRENT_ACCESS_TYPE } = useUIConfig()
    const { memberIsSignedIn, memberAccountData } = useMember()
    const { adminIsSignedIn, adminAccountData } = useAdmin()

    useEffect(() => {
        SetNavOffsetHeight(navRef.current.offsetHeight)
    }, [navRef])

    return (
        <>
            {/* --- Navbar --- */}
            <nav
                ref={navRef}
                id="navbar"
                className="fixed top-0 left-0 w-full h-16 flex flex-row bg-s-dark-primary border-b-2 border-s-white"
                style={{ zIndex: Z_INDEX.NAVBAR }}
            >
                {/* Logo Tab */}

                <Link
                    id="logo"
                    className="sm:mx-2 px-1 flex flex-row items-center justify-center hover:brightness-0 hover:invert"
                    to={{
                        pathname: FULL_ROUTES.HOME,
                    }}
                >
                    <span className="text-s-primary font-bold text-xs sm:text-lg">{WEBSITE_NAME}</span>
                </Link>

                {/* Search Tab */}
                {(CURRENT_ACCESS_TYPE === ACCESS_TYPE.LOCAL && adminIsSignedIn) ||
                    (CURRENT_ACCESS_TYPE === ACCESS_TYPE.PUBLIC && (
                        <Link
                            className=""
                            to={{
                                pathname: FULL_ROUTES.DISCOVER_SEARCH,
                            }}
                        >
                            <NavbarTab>
                                <div className="px-2 sm:px-4">
                                    <Search
                                        size={16}
                                        className="w-6 sm:w-8 text-s-white pointer-events-none"
                                    />
                                </div>
                            </NavbarTab>
                        </Link>
                    ))}

                {/* Discover Dropdown Tab */}
                {(CURRENT_ACCESS_TYPE === ACCESS_TYPE.LOCAL && adminIsSignedIn) ||
                    (CURRENT_ACCESS_TYPE === ACCESS_TYPE.PUBLIC && (
                        <NavbarDropdownTab
                            dropdownClassName="px-2 w-[150px] sm:w-[250px] lg:w-[500px]"
                            label={<p className="text-s-white text-xs sm:text-sm">Discover</p>}
                            id="discover"
                            vectorOffset={{ x: 0, y: navOffsetHeight - 2 }}
                        >
                            <div
                                id="genres"
                                className="flex flex-col justify-start w-full px-2"
                            >
                                <a className="text-s-white font-semibold text-xs pt-1">Genres</a>{" "}
                                {/* hover:underline href="/discover/genres"  // bassically have a page with all genres in the future*/}
                                <div className="border-s-white border-b-2 h-2 w-full rounded-xs"></div>
                                <VerticalQueryScrollable
                                    queryKey={["navbar", "discover", "genres"]}
                                    queryFn={async ({ pageParam = 0 }) => await GetAllGenres(8, pageParam)}
                                    getNextPageParam={(lastPage, allPages) => (lastPage && lastPage.length === 8 ? allPages.length * 8 : undefined)}
                                    pxCutoffHeight={128}
                                    pxCutoffWidth={null}
                                    ItemRenderer={({ index, dataItem }) => {
                                        return (
                                            <Category
                                                key={index}
                                                categoryName={dataItem.name}
                                                pathname={FILLED_ROUTES.DISCOVER_GENRE(dataItem.name)}
                                            />
                                        )
                                    }}
                                    columnsCount={{ sm: 2 }}
                                    fixedRowHeight={32}
                                />
                            </div>

                            <div
                                id="other"
                                className="flex flex-col justify-start w-full px-2"
                            >
                                <a className="text-s-white font-semibold text-xs pt-1">Other</a> {/* hover:underline href="/discover/other" */}
                                <div className="border-s-white border-b-2 h-2 w-full rounded-xs"></div>
                                <VerticalScrollable
                                    itemCount={1}
                                    pxCutoffHeight={40}
                                    pxCutoffWidth={null}
                                    ItemRenderer={({ index }) => {
                                        return (
                                            <Category
                                                categoryName="Browse [A-Z]"
                                                pathname={FULL_ROUTES.DISCOVER_A_Z}
                                            />
                                        )
                                    }}
                                />
                            </div>
                        </NavbarDropdownTab>
                    ))}
                {/* --- Profile Dropdown Tab --- */}
                <NavbarDropdownTab
                    className="ml-auto"
                    dropdownClassName={`${memberIsSignedIn || adminIsSignedIn ? "w-32 sm:w-full" : "w-32"}`}
                    label={
                        <>
                            {}
                            <p className={`text-s-white text-xs font-semibold hidden sm:block`}>
                                {adminIsSignedIn ? adminAccountData.username : memberIsSignedIn ? memberAccountData.email : ""}
                            </p>
                            {adminIsSignedIn || memberIsSignedIn ? (
                                <CircleUser
                                    className="text-s-white"
                                    size={28}
                                />
                            ) : (
                                <CircleQuestionMark
                                    className="text-s-white"
                                    size={28}
                                />
                            )}
                        </>
                    }
                    id="profile"
                    isDropdownStartLeft={false}
                    vectorOffset={{ x: 0, y: navOffsetHeight - 2 }}
                >
                    {!memberIsSignedIn && !adminIsSignedIn ? (
                        <div className="flex flex-col space-y-1">
                            <GuestProfileDropdownRowTab
                                label="Sign In"
                                description="Welcome Back!"
                                pathname={FULL_ROUTES.SIGN_IN}
                            />
                            {CURRENT_ACCESS_TYPE === ACCESS_TYPE.PUBLIC && (
                                <GuestProfileDropdownRowTab
                                    label="Sign Up"
                                    description="Get Started!"
                                    pathname={FULL_ROUTES.SIGN_UP}
                                />
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col space-y-2 w-full">
                                <p className="border-b-2 border-s-white text-s-white font-semibold mx-2">Account</p>
                                {memberIsSignedIn && (
                                    <>
                                        <UserProfileDropdownRowTabLink
                                            label={"Safe Space"}
                                            Icon={Cloud}
                                            to="/safespace"
                                        />
                                        <UserProfileDropdownRowTabLink
                                            label={"Settings"}
                                            Icon={Settings}
                                            to="/settings/member/account"
                                        />
                                    </>
                                )}
                                {adminIsSignedIn && (
                                    <>
                                        <UserProfileDropdownRowTabLink
                                            label={"Settings"}
                                            Icon={Settings}
                                            to="/settings/admin/account"
                                        />
                                        <UserProfileDropdownRowTabLink
                                            label={"Administration"}
                                            Icon={ShieldUser}
                                            to="/administration/dashboard/titles"
                                        />
                                    </>
                                )}
                                {(memberIsSignedIn || adminIsSignedIn) && (
                                    <>
                                        <UserProfileDropdownRowTabButton
                                            label={"Sign Out"}
                                            Icon={CircleArrowRight}
                                            onClick={SignOut}
                                        />
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </NavbarDropdownTab>
            </nav>

            {/* NAVBAR MARGIN FITTING */}
            <div
                className="w-full"
                style={{ height: `${navOffsetHeight}px` }}
            ></div>
        </>
    )
}

function Category({ categoryName, pathname }) {
    return (
        <Link
            className="text-s-white block w-full self-center hover:bg-s-secondary active:bg-s-secondary rounded-xs text-xs py-2 px-1 truncate"
            to={{
                pathname: pathname,
            }}
            href={pathname}
            title={categoryName}
        >
            {categoryName}
        </Link>
    )
}

function GuestProfileDropdownRowTab({ label, description, pathname }) {
    return (
        <Link
            className="flex flex-col py-2 pl-2 pr-4 hover:bg-s-secondary active:bg-s-secondary space-y-0.25 h-full"
            to={{
                pathname: pathname,
            }}
        >
            <p className="text-s-white text-sm font-bold">{label}</p>
            <p className="text-xs font-semibold text-s-white">{description}</p>
        </Link>
    )
}

function UserProfileDropdownRowTabLink({ label, Icon, to }) {
    return (
        <Link
            className="text-s-white flex flex-row items-center hover:bg-s-secondary active:bg-s-secondary space-x-1 py-1.5 px-1"
            to={to}
        >
            <Icon
                className="text-black self-center"
                size={18}
            />
            <p className="text-xs md:text-sm font-semibold">{label}</p>
        </Link>
    )
}

function UserProfileDropdownRowTabButton({ label, Icon, onClick }) {
    return (
        <button
            className="flex flex-row items-center hover:bg-s-secondary active:bg-s-secondary space-x-1 py-1.5 px-1"
            onClick={onClick}
        >
            <Icon
                className="text-black"
                size={18}
            />
            <p className="text-s-white text-xs md:text-sm font-semibold">{label}</p>
        </button>
    )
}

export default Navbar
