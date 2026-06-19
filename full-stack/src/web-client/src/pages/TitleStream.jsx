import "../tailwind.css"
import { useEffect, useRef, useState, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import FavoriteButton from "../components/FavoriteButton.jsx"
import LikeButton from "../components/LikeButton.jsx"
import StreamModule2 from "../components/modules/StreamModule2.jsx"
import { UpdateLogStream, FetchLogStream, FetchSubtitleByStreamIDLabelExt } from "../services/Titles/FetchStream.js"
import { useGetIntallmentsByTitleID } from "../hooks/useInstallment.jsx"
import { useGetStreamByID } from "../hooks/useStream.jsx"
import ImageUI from "../components/ImageUI.jsx"
import { FileQuestionMark, User } from "lucide-react"
import { useGetTitleByID } from "../hooks/useTitle.jsx"
import { DefaultSpinner } from "../components/Spinners.jsx"
import { Link } from "react-router-dom"
import { FILLED_ROUTES, FULL_ROUTES } from "../constants.js"
import VideoPlayer from "../components/media/VideoPlayer.jsx"
import useLocalStorage from "../hooks/useLocalStorage.jsx"
import useUIConfig from "../hooks/useUIConfig.jsx"
import { ACCESS_TYPE } from "../constants.js"

function getExtensionFromSubtitleCodec(codecName) {
    switch (codecName.toLowerCase()) {
        case "subrip":
            return "srt"
        case "ass":
            return "ass"
        case "ssa":
            return "ssa"
        case "webvtt":
        default:
            return "vtt"
    }
}

function TitleStream() {
    const { CURRENT_ACCESS_TYPE } = useUIConfig()
    const { streamID, label } = useParams()
    const navigate = useNavigate()
    const {
        video: { isAutoPlay, quality, audio, subtitle, volume, muted, SetIsAutoPlay, SetQuality, SetAudio, SetSubtitle, SetVolume, SetMuted },
    } = useLocalStorage()
    const isAutoPlayRef = useRef(isAutoPlay)
    const qualityRef = useRef(quality)
    const audioRef = useRef(audio)
    const subtitleRef = useRef(subtitle)
    const volumeRef = useRef(volume)
    const mutedRef = useRef(muted)

    const [isShowingDetails, SetIsShowingDetails] = useState(false)
    const [installment, SetInstallment] = useState(null)
    const [prevStream, SetPrevStream] = useState(null)
    const [prevStreamInstallment, SetPrevStreamInstallment] = useState(null)
    const [nextStream, SetNextStream] = useState(null)
    const [nextStreamInstallment, SetNextStreamInstallment] = useState(null)

    const [isDetailsOverflowing, SetIsDetailsOverflowing] = useState()
    const observerRef = useRef(null)
    const detailsRef = useCallback((node) => {
        if (observerRef.current) {
            observerRef.current.disconnect()
        }

        if (node) {
            observerRef.current = new ResizeObserver((entries) => {
                window.requestAnimationFrame(() => {
                    for (let entry of entries) {
                        const isOverflowing = entry.target.scrollHeight > entry.target.clientHeight + 2
                        SetIsDetailsOverflowing(isOverflowing)
                    }
                })
            })

            observerRef.current.observe(node)
        }
    }, []) // Empty dependency array ensures this only initializes once

    const [startTime, SetStartTime] = useState(0)

    //TODO: TIME
    async function UploadTimeStamp(totalTimeElapsedInSeconds) {
        if (ACCESS_TYPE.PUBLIC === CURRENT_ACCESS_TYPE) {
            await UpdateLogStream(streamID, totalTimeElapsedInSeconds)
        }
    }

    function onStreamEnd(streamID, totalTimeElapsedInSeconds) {
        UploadTimeStamp(totalTimeElapsedInSeconds)
        navigate(FILLED_ROUTES.STREAM_PAGE(streamID, label))
    }

    const { data: stream, error: isErrorStream, isLoading: isLoadingStreamData } = useGetStreamByID(streamID)

    const { data: title, error: isErrorTitle, isLoading: isLoadingTitle } = useGetTitleByID(stream?.titleID)

    const { data: installments, error: isErrorTitleInstallments, isLoading: isLoadingTitleInstallments } = useGetIntallmentsByTitleID(stream?.titleID)

    useEffect(() => {
        document.title = `${label}`

        if ((!stream && isErrorStream) || (!title && isErrorTitle) || (!installments && isErrorTitleInstallments)) {
            navigate(FULL_ROUTES.NOT_FOUND)
        }
    }, [stream, label])

    // setting next and previous streams/installments
    useEffect(() => {
        if (installments && !isErrorTitleInstallments) {
            let index = installments.findIndex((installment) => installment.id === stream.installmentID)
            const currentInstallment = installments[index]
            SetInstallment(currentInstallment)

            const prevStream = installments[index].TitleInstallmentStreams.find((s) => s.streamNumber === stream.streamNumber - 1)
            const nextStream = installments[index].TitleInstallmentStreams.find((s) => s.streamNumber === stream.streamNumber + 1)

            if (prevStream) {
                SetPrevStream(prevStream)
                SetPrevStreamInstallment(currentInstallment)
            } else if (index - 1 >= 0) {
                const prevInstallment = installments[index - 1]
                SetPrevStream(prevInstallment.TitleInstallmentStreams.slice(-1)[0])
                SetPrevStreamInstallment(prevInstallment)
            } else {
                SetPrevStream(null)
                SetPrevStreamInstallment(null)
            }

            if (nextStream) {
                SetNextStream(nextStream)
                SetNextStreamInstallment(currentInstallment)
            } else if (index + 1 < installments.length) {
                const nextInstallment = installments[index + 1]
                SetNextStream(nextInstallment.TitleInstallmentStreams[0])
                SetNextStreamInstallment(nextInstallment)
            } else {
                SetNextStream(null)
                SetNextStreamInstallment(null)
            }
        }
    }, [installments, streamID])

    useEffect(() => {
        // loggin time for watched streams
        if (ACCESS_TYPE.PUBLIC === CURRENT_ACCESS_TYPE) {
            FetchLogStream(streamID).then((data) => {
                if (data && data.lastTimeStampInSeconds) {
                    SetStartTime(data.lastTimeStampInSeconds)
                }
            })
        }
    }, [streamID, CURRENT_ACCESS_TYPE])

    if (isErrorStream || (!stream && !isLoadingStreamData)) {
        navigate(FULL_ROUTES.NOT_FOUND)
    }

    if (isLoadingStreamData || isLoadingTitle || isLoadingTitleInstallments || !installment || !stream) {
        return <DefaultSpinner className="py-10" />
    }

    return (
        <>
            <main className="">
                {/* Title Image */}
                <Link to={{ pathname: FILLED_ROUTES.TITLE_PAGE(title.id, title.label) }}>
                    <div className="relative w-full h-[16vw] ">
                        <div className="absolute top-0 left-0 z-2 w-full h-full flex justify-start items-center px-8">
                            <p className="text-lg md:text-4xl font-semibold text-s-white bg-black/60 rounded-sm px-4 py-2">{title.label}</p>
                        </div>
                        <div className="absolute top-0 left-0 object-cover object-top w-full h-full mask-b-from-55% mask-b-to-100% z-1">
                            <ImageUI
                                Src={`${`/api/title/${title.id}/cover.jpg`}`}
                                Fallback={FileQuestionMark}
                            />
                        </div>
                    </div>
                </Link>

                {/* Video Player */}
                <div className="relative flex flex-col items-center justify-center w-full h-[100%]">
                    <div className="absolute top-0 left-0 bg-s-dark-tertiary/80 w-[100%] h-[100%] z-0"></div>
                    <div className={`relative bg-s-dark-tertiary aspect-video w-[100%] xl:w-[70vw] h-[100%] z-10`}>
                        <div className="absolute top-0 left-0 flex flex-col justify-center items-center w-[100%] h-[100%]">
                            <VideoPlayer
                                src={`/api/title/stream/${stream.id}/master.m3u8`}
                                AutoPlay={{ firstRenderValue: isAutoPlayRef.current, OnValueChange: SetIsAutoPlay }}
                                Quality={{ firstRenderValue: qualityRef.current, OnValueChange: SetQuality }}
                                Audio={{ firstRenderValue: audioRef.current, OnValueChange: SetAudio }}
                                Subtitle={{ firstRenderValue: subtitleRef.current, OnValueChange: SetSubtitle }}
                                Volume={{ firstRenderValue: volumeRef.current, OnValueChange: SetVolume }}
                                Speed={{ firstRenderValue: 1, OnValueChange: () => {} }}
                                Muted={{ firstRenderValue: mutedRef.current, OnValueChange: SetMuted }}
                                endCountdown={5}
                                onStreamEnd={() => onStreamEnd(nextStream ? nextStream.id : stream.id)}
                                startTime={startTime}
                                periodicTimeUpdateInterval={5}
                                onPeriodicTimeUpdateInterval={(lastTimeElapsed) => {
                                    UploadTimeStamp(lastTimeElapsed)
                                }}
                                onChangeSubtitle={async (currentSubtitle) => {
                                    if (!currentSubtitle) {
                                        return null
                                    }
                                    const subtitleData = stream.StreamSubtitles.find((el) => el.label === currentSubtitle.name)
                                    if (!subtitleData) {
                                        return null
                                    }
                                    const ext = getExtensionFromSubtitleCodec(subtitleData.codec_name)
                                    if (ext !== "ssa" && ext !== "ass") {
                                        return null
                                    }

                                    const content = await FetchSubtitleByStreamIDLabelExt(stream.id, currentSubtitle.name, ext)

                                    return content
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="px-3 md:px-4 xl:mx-[6vw] mt-4 md:mt-8">
                    {/* Stream Title */}
                    <p className="self-center flex flex-row justify-between text-s-white font-semibold">
                        <span className="text-sm md:text-3xl font-semibold flex flex-col gap-2">
                            {stream.label}
                            <span className="text-xs md:text-lg">{installment.label}</span>
                        </span>
                        <span className="italic whitespace-nowrap text-[8px] md:text-lg">
                            <span className="text-s-secondary">Release Date: </span>
                            {new Date(stream.releaseDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                        </span>
                    </p>

                    {/* Like & Favorite */}
                    <div className="flex flex-row justify-between items-center py-2">
                        {
                            <LikeButton
                                streamID={stream.id}
                                totalLikeCount={stream.likes_count}
                            />
                        }
                        {
                            <FavoriteButton
                                className="w-10 h-10"
                                titleID={title.id}
                            />
                        }
                    </div>

                    {/* Description */}
                    <div className="flex flex-col w-[100%]">
                        <p className="text-s-secondary text-sm font-semibold py-2 underline underline-offset-4">Synopsis:</p>
                        <p
                            ref={detailsRef}
                            className={`whitespace-pre-wrap text-s-white text-xs w-[100%] ${isShowingDetails ? "" : "line-clamp-4"}`}
                        >{`${stream.synopsis}`}</p>

                        {/* DIVIDER */}

                        <div className={`border-2 border-s-dark-secondary w-45 self-center my-8 ${isShowingDetails ? "" : "hidden"}`}></div>

                        <div className="mt-4 border border-s-dark-secondary w-[100%]"></div>

                        {(isDetailsOverflowing || isShowingDetails) && (
                            <div className="w-full my-2 flex flex-row justify-start">
                                <button
                                    onClick={() => {
                                        SetIsShowingDetails(!isShowingDetails)
                                    }}
                                    type="button"
                                    className="text-s-tertiary text-sm text-end cursor-pointer mt-2"
                                >
                                    {isShowingDetails ? "Less Details" : "More Details"}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Next/Prev Episodes */}
                    <div className="flex flex-row justify-between">
                        {/* PREVIOUS STREAM */}
                        <div className={`flex flex-col ${prevStream ? "" : "invisible"}`}>
                            <p className="my-1 text-s-white font-semibold text-sm md:text-xl self-start">Previous Stream</p>
                            <div className="w-27.5 sm:w-35 md:w-60">
                                {prevStream && prevStreamInstallment ? (
                                    <StreamModule2
                                        installmentTitle={prevStreamInstallment.label}
                                        isMovie={!prevStreamInstallment.isSeason}
                                        streamTitle={prevStream.label}
                                        streamImageSrc={`${`/api/title/stream/${prevStream.id}/thumbnail.jpg`}`}
                                        dateReleased={new Date(prevStream.releaseDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                                        href={FILLED_ROUTES.STREAM_PAGE(prevStream.id, prevStream.label)}
                                        episodeNum={prevStream.streamNumber}
                                        flipBottomText={true}
                                    />
                                ) : (
                                    ""
                                )}
                            </div>
                        </div>

                        {/* NEXT STREAM */}
                        <div className={`flex flex-col ${nextStream ? "" : "invisible"}`}>
                            <p className="my-1 text-s-white font-semibold text-sm md:text-xl self-end">Next Stream</p>
                            <div className="w-27.5 sm:w-35 md:w-60">
                                {nextStream && nextStreamInstallment ? (
                                    <StreamModule2
                                        installmentTitle={nextStreamInstallment.label}
                                        isMovie={!nextStreamInstallment.isSeason}
                                        streamTitle={nextStream.label}
                                        streamImageSrc={`${`/api/title/stream/${nextStream.id}/thumbnail.jpg`}`}
                                        dateReleased={new Date(nextStream.releaseDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                                        href={FILLED_ROUTES.STREAM_PAGE(nextStream.id, nextStream.label)}
                                        episodeNum={nextStream.streamNumber}
                                    />
                                ) : (
                                    ""
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}

export default TitleStream
