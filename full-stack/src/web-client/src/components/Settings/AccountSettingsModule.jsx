function AccountSettingModule({ Icon, label, value = null, onClick = null }) {
    const textClassName = ""

    return (
        <button
            onClick={onClick}
            type="button"
            className="relative flex flex-row justify-between bg-s-dark-secondary hover:bg-s-dark-secondary/80 min-w-72 md:w-124 p-2 rounded-sm border border-s-white hover:border-s-white/80 gap-x-4 cursor-pointer"
        >
            <div className="flex flex-row gap-2">
                <Icon />
                <p className={textClassName}>{label}</p>
            </div>
            {value && <p className={`${textClassName} absolute inset-0 self-center hidden md:block`}>{value}</p>}
        </button>
    )
}

export default AccountSettingModule