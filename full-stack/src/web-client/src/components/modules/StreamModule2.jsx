import { Link } from "react-router-dom"
import "../../tailwind.css"

function StreamModule2({
    isMovie,
    installmentTitle = undefined,
    streamTitle = "streamTitle",
    streamImageSrc,
    dateReleased,
    href,
    state = { autoPlay: false },
    episodeNum = 0,
    flipBottomText = false,
}) {
    const streamInfo = isMovie ? `${streamTitle}` : `E${episodeNum} - ${streamTitle}`

    return (
        <>
            <div className="relative">
                <Link
                    to={{ pathname: href }}
                    state={state}
                    href={href}
                    className="relative flex flex-col space-y-0.5 group"
                >
                    <img
                        src={streamImageSrc}
                        className="rounded-xs aspect-video object-cover"
                    ></img>
                    <div className="absolute top-0 left-0 rounded-xs aspect-video w-full group-hover:bg-s-dark-secondary/30 group-active:bg-s-dark-secondary/50"></div>
                    <div className={`flex flex-col ${flipBottomText ? "md:flex-row-reverse" : "md:flex-row"} justify-between `}>
                        <p className="font-semibold text-xs md:text-md text-s-white group-active:underline group-hover:underline truncate">{streamInfo}</p>
                        <p className="text-s-dark-secondary text-[6px] md:text-[8px] italic font-semibold whitespace-nowrap flex flex-col">
                            <span className="flex flex-row gap-1">
                                <span className="text-s-secondary font-bold w-full">Released</span> {dateReleased}
                            </span>
                            {installmentTitle && <span className={`w-full ${flipBottomText ? "text-start" : "text-end"}`}>{installmentTitle}</span>}
                        </p>
                    </div>
                </Link>
            </div>
        </>
    )
}

export default StreamModule2
