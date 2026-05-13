import { useEffect, useRef } from "react"
import "../tailwind.css"
import FavoriteButton from "./FavoriteButton"

function SeriesModule({ titleID, title, imageSrc, seasonNum, episodeNum, movieNum, description, href }) {
    return (
        <>
            <div className="w-36 md:w-72 h-auto relative">
                <a href={href} className="relative flex flex-col gap-y-1 group">
                    <img src={imageSrc} className="rounded-xs aspect-[3/2]"></img>
                    <div className="absolute top-0 left-0 rounded-xs aspect-[3/2] w-full group-active:bg-os-dark-secondary/30"></div>
                    <p className="font-semibold text-sm md:text-lg text-os-dark-secondary group-active:underline">{title}</p>
                </a>

                {/* --HOVERING-- Discover */}
                <div className="absolute top-0 left-0 w-full h-full opacity-0 pointer-events-none md:pointer-events-auto md:hover:opacity-100">
                    <img src={imageSrc} className="absolute top-0 left-0 w-full h-full"></img>
                    <div className="absolute top-0 left-0 w-full h-full bg-os-dark-tertiary/90 flex flex-col px-3 py-1">
                        <div className="w-full flex flex-row justify-between">
                            <p className="text-os-white text-xl font-bold italic">{title}</p>
                            <FavoriteButton key={1} animeID={titleID} />
                        </div>
                        <div className="my-1 w-full border-[0.5px] border-os-dark-secondary rounded-xs"></div>
                        <div className="my-1 w-full flex flex-col">
                            <p className="text-xs italic text-os-dark-secondary">Seasons {seasonNum}</p>
                            <p className="text-xs italic text-os-dark-secondary">Episodes {episodeNum}</p>
                            <p className="text-xs italic text-os-dark-secondary">Movies {movieNum}</p>
                        </div>
                        <div className="my-1 w-full border-[0.5px] border-os-dark-secondary rounded-xs"></div>
                        <div className="my-1 flex flex-col gap-y-0.5">
                            <p className="text-xs h-4 line-clamp-3 text-os-blue-secondary italic font-bold">Description:</p>
                            <p className="text-xs text-os-white h-12 line-clamp-4">{description}</p>
                        </div>
                        <div className="p-1 w-full h-auto flex justify-center">
                            <a href={href} className="text-lg text-os-blue-tertiary hover:text-os-blue-tertiary/60 active:text-os-blue-tertiary/80 font-semibold">
                                {">"} Discover
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SeriesModule
