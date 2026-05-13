import { useEffect, useState } from "react"
import "../tailwind.css"
import { useNavigate } from "react-router-dom"

function LinksTitle({ titleName }) {
    return <p className="text-xs  md:text-sm text-os-white">{titleName}</p>
}

function Link({ linkName, href }) {
    return (
        <a
            className="text-[10px] md:text-xs text-os-dark-secondary hover:text-os-blue-tertiary active:text-os-blue-tertiary visited:text-os-visited-purple cursor-pointer"
            href={href}>
            {linkName}
        </a>
    )
}

function LinkTab({ titleName, links }) {
    return (
        <div className="flex flex-col space-y-2 md:space-y-3">
            <LinksTitle titleName={titleName} />
            <div className="flex flex-col space-y-1 md:space-y-2">
                {links.map((link) => {
                    return <Link key={link.id} linkName={link.name} href={link.href} />
                })}
            </div>
        </div>
    )
}

function FooterOS() {
    const navigate = useNavigate
    const [isMember, SetIsMember] = useState(false)
    const [isAdmin, SetIsAdmin] = useState(false)

    useEffect(() => {
        fetch("/api/authorize/member", {
            method: "GET",
            credentials: "include",
        })
            .then((response) => {
                if (response.ok) {
                    return response.json()
                }
            })
            .then((data) => {
                if (data.error === undefined) {
                    SetIsMember(true)
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
                if (data.error === undefined) {
                    SetIsAdmin(true)
                }
            })
            .catch()
    }, [])

    return (
        <>
            <footer id="footerOS" className="mt-12 md:mt-36 flex flex-col justify-end items-center">
                <div className="bg-linear-to-b from-transparent to-os-blue-tertiary/40 w-full flex flex-col justify-end items-center">
                    <div className="flex flex-row space-x-8 md:space-x-16 mb-16 md:mb-18">
                        {/* {id: 2, name: "Genres", href:"/discover/genres"}, {id: 3, name: "Other", href:"/discover/other"} */}
                        <LinkTab titleName="General" links={[{ id: 1, name: "Home", href: "/" }]} />
                        <LinkTab titleName="koleam" links={[{ id: 1, name: "About Us", href: "/about" }]} />
                        {/* <LinkTab titleName="Socials" links={[{id: 1, name: "Twitter", href:"#"}]} /> */}

                        {/* --- Admin Account --- */}
                        <div className={`${isAdmin ? "" : "hidden"}`}>
                            <LinkTab titleName="Administration" links={[{ id: 1, name: "Dashboard", href: "/admin" }]} />
                        </div>

                        {/* {id: 1, name: "Safe Space", href:"#"}, */}
                        {isMember ? (
                            <LinkTab
                                titleName="Account"
                                links={[
                                    { id: 1, name: "Favorites", href: "/favorites" },
                                    { id: 2, name: "Settings", href: "/settings/membership" },
                                    { id: 3, name: "Sign Out", href: "/auth/signout" },
                                ]}
                            />
                        ) : (
                            <LinkTab
                                titleName="Account"
                                links={[
                                    { id: 1, name: "Sign In", href: "/auth/signin" },
                                    { id: 2, name: "Sign Up", href: "/auth/signup" },
                                ]}
                            />
                        )}
                    </div>
                    <div className="p-2 w-full flex flex-col items-center">
                        <div className="w-[95%] border-t-1 border-os-white">
                            <p className="p-1 mt-2 font-semibold text-xs md:text-md text-os-white">© koleam CHANGE THIS TO BE POPULATED BY .env</p>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    )
}

export default FooterOS
