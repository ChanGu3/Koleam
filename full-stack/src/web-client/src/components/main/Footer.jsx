import TextLink, { TextButton } from "../text/TextLink"
import { COPYRIGHT_NAME, Z_INDEX } from "../../constants"

function FooterLinkTitle({ label }) {
    return <p className="text-xs md:text-sm text-s-white">{label}</p>
}

function FooterLink({ label, pathname }) {
    return (
        <TextLink
            className="text-[10px] md:text-xs"
            label={label}
            pathname={pathname}
        />
    )
}

function FooterButton({ label, onClick }) {
    return (
        <TextButton
            className="text-[10px] md:text-xs"
            label={label}
            onClick={onClick}
        />
    )
}

function FooterLinksColumn({ titleName, links }) {
    return (
        <div className="flex flex-col space-y-2 md:space-y-3">
            <FooterLinkTitle label={titleName} />
            <div className="flex flex-col space-y-1 md:space-y-2">
                {links.map((link) => {
                    if (link.href) {
                        return (
                            <FooterLink
                                key={link.id}
                                label={link.name}
                                pathname={link.href}
                            />
                        )
                    } else if (link.onClick) {
                        return (
                            <FooterButton
                                key={link.id}
                                label={link.name}
                                onClick={link.onClick}
                            />
                        )
                    }
                })}
            </div>
        </div>
    )
}

function FooterLinksRow({ isShowingAdminColumns = false, isShowingMemberColumns = false, isLoggedIn = false, SignOut = () => {} }) {
    const accountLinks = []

    if (isShowingMemberColumns) {
        accountLinks.push({ id: 1, name: "Favorites", href: "/favorites" })
        accountLinks.push({ id: 2, name: "Settings", href: "/settings/member/account" })
    }

    if (isShowingAdminColumns || isShowingMemberColumns) {
        accountLinks.push({ id: 2, name: "Settings", href: "/settings/admin/account" })
    }

    {
        /* {id: 1, name: "Safe Space", href:"#"}, */
    }
    if (!isLoggedIn) {
        accountLinks.push({ id: 3, name: "Sign In", href: "/auth/signin" })
        accountLinks.push({ id: 4, name: "Sign Up", href: "/auth/signup" })
    } else {
        accountLinks.push({ id: 3, name: "Sign Out", onClick: SignOut })
    }

    return (
        <div className="flex w-[90%] gap-6 sm:w-auto sm:px-0 sm:gap-0 sm:w-none flex-col sm:flex-row space-x-8 md:space-x-16 sm:mb-12 md:mb-16">
            <FooterLinksColumn
                titleName={`${COPYRIGHT_NAME} Dev`}
                links={[
                    { id: 1, name: "About Us", href: "/koleam/about" },
                    // probably make sections of these in the about us below
                    // { id: 2, name: "Support", href: "/Support" },
                    // { id: 3, name: "Contact", href: "/contact" },
                    // { id: 4, name: "Contribute?", href: "/contribute" },
                ]}
            />

            {/* {id: 2, name: "Genres", href:"/discover/genres"}, {id: 3, name: "Other", href:"/discover/other"} */}
            <FooterLinksColumn
                titleName="General"
                links={[{ id: 1, name: "Home", href: "/" }]}
            />

            <FooterLinksColumn
                titleName="Account"
                links={accountLinks}
            />

            {/* --- Admin Column --- */}
            {isShowingAdminColumns && (
                <FooterLinksColumn
                    titleName="Administration"
                    links={[{ id: 1, name: "Dashboard", href: "/administration/dashboard/titles" }]}
                />
            )}
        </div>
    )
}

function Footer({ isShowingAdminColumns = false, isShowingMemberColumns = false, isLoggedIn = false, SignOut = () => {} }) {
    return (
        <>
            <footer
                id="footer"
                className="mt-20 md:mt-36 flex flex-col justify-end items-center"
            >
                <div className="bg-linear-to-b from-transparent to-s-tertiary/40 w-full flex flex-col justify-end items-center">
                    <FooterLinksRow
                        isShowingAdminColumns={isShowingAdminColumns}
                        isShowingMemberColumns={isShowingMemberColumns}
                        isLoggedIn={isLoggedIn}
                        SignOut={SignOut}
                    />
                    <div className="py-4 w-full flex flex-col items-center">
                        <div className="w-[90%] border-t-2 border-s-white">
                            <p className="p-1 mt-2 font-semibold text-xs md:text-md text-s-white">&copy; {COPYRIGHT_NAME}</p>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    )
}

export default Footer
