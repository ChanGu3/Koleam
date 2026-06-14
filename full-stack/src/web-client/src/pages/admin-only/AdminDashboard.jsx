import React from "react"
import { NavLink, Outlet } from "react-router-dom"

const tabs = [
    { name: "Members", path: "/administration/dashboard/members" },
    { name: "Titles", path: "/administration/dashboard/titles" },
]

function AdminDashboard() {
    return (
        <>
            <main className="flex flex-col items-center">
                <div className="rounded-xs my-2 px-2 flex justify-center w-full min-h-screen">
                    <div className="w-full items-center flex flex-col">
                        <h1 className="text-center text-s-white font-bold text-lg md:text-2xl py-3">Admin Dashboard</h1>
                        <div className="text-s-white flex gap-3 md:gap-5 justify-center mb-8 bg-linear-to-t from-s-tertiary/75 to-25% to-s-primary/85 rounded-tl-xl rounded-br-xl rounded-bl-sm rounded-tr-sm px-6 md:px-10 py-3 md:py-5 w-fit">
                            {tabs.map((tab) => (
                                <NavLink
                                    key={tab.name}
                                    to={tab.path}
                                    className={({ isActive }) =>
                                        `${isActive ? "bg-s-dark-secondary scale-115 pointer-events-none" : "bg-s-dark-tertiary hover:text-s-dark-tertiary active:text-s-dark-tertiary active:bg-s-secondary/75 hover:bg-s-secondary"} rounded-bl-md rounded-tr-md px-2 py-1 md:px-5 md:py-2 w-18 md:w-26 text-center text-s-white shadow-sm md:shadow-lg shadow-s-white/80 border-2 border-s-white text-xs md:text-sm`
                                    }
                                    end={tab.path === "/administration"}
                                >
                                    {tab.name}
                                </NavLink>
                            ))}
                        </div>
                        <div className="h-full w-full">
                            <Outlet />
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}

export default AdminDashboard
