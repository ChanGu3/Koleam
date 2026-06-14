function NavbarTab({ className = "", children }) {
    return (
        <>
            <div className={`${className} relative h-full z-99`}>
                {/* --- Tab --- */}
                <div className={`rounded-xs px-2 flex flex-row items-center justify-center space-x-1 cursor-pointer hover:bg-gray-500 active:bg-gray-700 h-full`}>{children}</div>
            </div>
        </>
    )
}

export default NavbarTab
