import "../../tailwind.css"
import FavoriteButton from "../FavoriteButton.jsx"
import { CircleChevronUp, FileQuestionMark } from "lucide-react"
import ImageUI from "../ImageUI.jsx"
import { Link } from "react-router-dom"

function SeriesModule({ titleID, label, imageSrc, seasonNum, episodeNum, movieNum, description, href }) {
    return (
        <>
            <div className="w-36 md:w-72 h-auto relative">
                <Link
                    to={{ pathname: href }}
                    className="relative flex flex-col gap-y-1 group"
                >
                    <div className="rounded-xs w-full aspect-[3/2] overflow-hidden">
                        <ImageUI
                            className="rounded-xs w-full h-full object-cover"
                            Src={imageSrc}
                            Fallback={FileQuestionMark}
                        />
                    </div>
                    <div className="absolute top-0 left-0 rounded-xs w-full aspect-[3/2] group-active:bg-s-dark-secondary/30 pointer-events-none"></div>
                    <p className="font-semibold text-sm md:text-lg text-s-dark-secondary group-active:underline truncate">{label}</p>
                </Link>

                {/* --HOVERING-- Discover */}
                <div className="absolute top-0 left-0 w-full h-full opacity-0 pointer-events-none md:pointer-events-auto md:hover:opacity-100">
                    <div className="rounded-xs w-full h-full aspect-[3/2] overflow-hidden">
                        <ImageUI
                            className="w-full h-full object-cover"
                            Src={imageSrc}
                            Fallback={FileQuestionMark}
                        />
                    </div>

                    <div className="absolute top-0 left-0 w-full h-full bg-s-dark-tertiary/90 flex flex-col px-3 py-1 overflow-hidden">
                        <div className="w-full flex flex-row justify-between gap-x-2">
                            <p className="w-full text-s-white text-xl font-bold italic truncate">{label}</p>
                            <FavoriteButton titleID={titleID} />
                        </div>
                        <div className="my-1 w-full border-[0.5px] border-s-dark-secondary rounded-xs"></div>
                        <div className="my-1 w-full flex flex-col">
                            <p className="w-[25%] text-xs italic text-s-secondary flex flex-row justify-between">
                                <span>Seasons</span> <span className="">{seasonNum}</span>
                            </p>
                            <p className="w-[25%] text-xs italic text-s-secondary flex flex-row justify-between">
                                <span>Episodes</span> <span className="">{episodeNum}</span>
                            </p>
                            <p className="w-[25%] text-xs italic text-s-secondary flex flex-row justify-between">
                                <span>Movies</span> <span className="">{movieNum}</span>
                            </p>
                        </div>
                        <div className="my-1 w-full border-[0.5px] border-s-dark-secondary rounded-xs"></div>
                        <div className="my-1 flex flex-col gap-y-0.5">
                            <p className="text-xs h-4 line-clamp-3 text-s-secondary italic font-bold">Description:</p>
                            <p className="text-xs text-s-white h-8 line-clamp-4">{description}</p>
                        </div>
                        <div className="py-1 w-full flex-1 flex items-center justify-center mt-auto">
                            <Link
                                to={{ pathname: href }}
                                className="w-full h-full bg-s-white/30 rounded-xs flex flex-row items-center justify-center gap-2 text-lg text-s-tertiary hover:text-s-tertiary/60 active:text-s-tertiary/80 font-semibold"
                            >
                                <CircleChevronUp /> Discover
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SeriesModule
