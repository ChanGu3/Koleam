// TODO: FOR CATEGORY PAGE

function CategoryModule({ title, imageSrc, href }) {
    return (
        <>
            <a
                className="relative w-24 h-24 md:w-48 md:h-48 bg-transparent rounded-xs shadow-md shadow-os-white"
                href={href}
            >
                <img
                    src={imageSrc}
                    className="w-full h-full absolute top-0 left-0"
                ></img>
                <div className="w-full h-full absolute top-0 left-0 bg-os-blue-tertiary/50 hover:bg-os-blue-tertiary/10 active:bg-os-blue-tertiary/30 rounded-xs border-1 border-white flex flex-col justify-center items-center">
                    <p className="w-full text-xs md:text-2xl font-semibold text-os-white text-center">{title}</p>
                </div>
            </a>
        </>
    )
}

export default CategoryModule
