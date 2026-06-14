import "../../tailwind.css"
import { Link } from "react-router-dom"
import { SquarePlay } from "lucide-react"

function StreamModule({ isMovie, titleLabel, label, srcIMG, description, dateReleased, href, installmentLabel, streamNumber }) {
    const streamInfo = `${isMovie ? "" : "E"}${streamNumber} - ${label}`

    return (
        <>
            <div className="w-32 md:w-56 h-auto relative">
                <Link
                    to={{ pathname: href }}
                    className="relative flex flex-col space-y-0.5 group"
                >
                    <img
                        src={srcIMG}
                        className="rounded-xs aspect-video"
                    ></img>
                    <div className="absolute top-0 left-0 rounded-xs aspect-video w-full group-active:bg-s-dark-secondary/30"></div>
                    <div className="flex flex-col">
                        <p className="font-semibold text-[10px] md:text-xs text-s-dark-secondary group-active:underline flex flex-row">{titleLabel}</p>
                        <p className="font-semibold text-[8px] md:text-[10px] text-s-white group-active:underline">
                            <span className="text-s-secondary font-bold w-[80%]">{streamInfo}</span>
                            <span className="text-s-white">{` | `}</span>
                            <span className="text-s-secondary font-bold">{installmentLabel}</span>
                        </p>
                    </div>
                </Link>

                {/* --HOVERING-- Discover */}
                <div className="rounded-xs absolute top-0 left-0 w-full h-full opacity-0 pointer-events-none md:pointer-events-auto md:hover:opacity-100">
                    <div className="absolute top-0 left-0 w-full h-full bg-s-dark-tertiary flex flex-col px-2 py-1">
                        <div className="w-full flex flex-row justify-between">
                            <p className="text-s-dark-secondary text-[10px] italic font-semibold truncate w-1/2">{titleLabel}</p>
                            <p className="text-s-dark-secondary text-[8px] italic font-semibold truncate flex flex-row gap-1">
                                <span className="text-s-secondary font-bold">Released</span>
                                {dateReleased}
                            </p>
                        </div>
                        <div className="w-full border-[0.5px] border-s-dark-secondary rounded-xs"></div>
                        <p className="py-1 text-s-white text-[16px] italic font-semibold truncate h-full">{streamInfo}</p>
                        <div className="w-full border-[0.5px] border-s-dark-secondary rounded-xs"></div>
                        <div className="my-1 w-full h-full">
                            <p className="w-full text-[10px] h-4 truncate text-s-secondary font-bold">Synopsis:</p>
                            <p className="w-full text-[10px] text-s-white h-8 line-clamp-2">{description}</p>
                        </div>
                        <div className="h-full flex items-center justify-center bg-s-white/30 rounded-xs">
                            <Link
                                to={{ pathname: href }}
                                className="text-sm text-s-tertiary hover:text-s-tertiary/60 active:text-s-tertiary/80 font-semibold truncate w-full h-full flex flex-row items-center justify-center gap-2"
                            >
                                Play <SquarePlay />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default StreamModule
