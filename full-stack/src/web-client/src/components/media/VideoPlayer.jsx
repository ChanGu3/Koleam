import React, { useEffect, useRef, useState } from "react"
import Hls from "hls.js"
import { getCalendarDateAndTime, getTimeNowWithSecondChange, runOnTheMinute } from "../../utils/Time.js"
import {
    FastForward,
    Maximize2,
    Minimize2,
    Pause,
    Play,
    Rewind,
    Settings,
    Volume as Volume0,
    Volume1,
    Volume2,
    VolumeX,
    SquareChevronLeft,
    SquareChevronRight,
    CircleX,
} from "lucide-react"
import { VerticalScrollable } from "../Scrollable.jsx"
import { useMediaQuery } from "react-responsive"
import { DefaultSpinner } from "../Spinners.jsx"
import SubtitlesOctopus from "libass-wasm"

// TODO: Move Out All Parts as components so this isnt such a god function component plus resueabilits is nice

function getMouseToRectPercentage(rect, e) {
    let clientX = e.clientX
    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX
    } else if (e.changedTouches && e.changedTouches.length > 0) {
        clientX = e.changedTouches[0].clientX
    }
    const clickX = clientX - rect.left
    return Math.max(0, Math.min(1, clickX / rect.width))
}

function formatTime(seconds) {
    if (isNaN(seconds) || seconds === undefined) return "00:00"
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${minutes < 10 ? "0" : ""}${minutes}:${secs < 10 ? "0" : ""}${secs}`
}

/**
 * Note: For Subtitles To Transfer Over To Next Video must be the same --> name (Example: English, Spanish, Japanses, Korean, etc.) TODO: default settings these transfer over using the refs and the correct names so its possible as long as that is done
 * @prop src: string - the source URL of the video to play
 * @prop AutoPlay: { firstRenderValue : boolean, OnValueChange: function } - on value change contains as a input new value
 * @prop Quality: { firstRenderValue : { height: number }, OnValueChange: function } - on value change contains as a input new value
 * @prop Audio: { firstRenderValue : { name: string }, OnValueChange: function } - on value change contains as a input new value
 * @prop Volume: { firstRenderValue : number, OnValueChange: function } - on value change contains as a input new value
 * @prop Muted: { firstRenderValue : boolean, OnValueChange: function } - on value change contains as a input new value
 * @prop Speed: { firstRenderValue : number, OnValueChange: function } - on value change contains as a input new value
 * @prop isAutoPlayRef: React ref object - a ref that holds a boolean value indicating whether the video should autoplay or not. This allows the parent component to control autoplay behavior across different video instances.
 * @prop endCountdown: number (optional) - if provided will show a countdown at the end of the video and call onStreamEnd when it reaches 0 (hence if its 0 it will call onStreamEnd immediately when the video ends)
 * @porp onChangeSubtitle(subtitle) => string || null - allows outside logic to send message to video player of the url of the subtitle or null if no such ssa or ass subtitles exist
 */
function VideoPlayer({
    src,
    AutoPlay = { firstRenderValue: true, OnValueChange: () => {} },
    Quality = { firstRenderValue: { height: "auto" }, OnValueChange: () => {} },
    Audio = { firstRenderValue: { name: "default" }, OnValueChange: () => {} },
    Subtitle = { firstRenderValue: { name: "none" }, OnValueChange: () => {} },
    Volume = { firstRenderValue: 0.45, OnValueChange: () => {} },
    Muted = { firstRenderValue: false, OnValueChange: () => {} },
    Speed = { firstRenderValue: 1, OnValueChange: () => {} },
    startTime = null,
    periodicTimeUpdateInterval = null,
    onPeriodicTimeUpdateInterval = async (totalTimeElapsedInSeconds) => {},
    endCountdown = null,
    onStreamEnd = () => {},
    onChangeSubtitle = async (currentSubtitle) => null,
}) {
    const workerUrl = "/libasswasm/subtitles-octopus-worker.js"
    const workerLegacyUrl = "/libasswasm/subtitles-octopus-worker-legacy.js"

    const videoPlayerZ = 10
    const videoPlayerTouch = videoPlayerZ + 1
    const videoPlayerOpsZ = videoPlayerZ + 10

    const videoRef = useRef(null)
    const hlsRef = useRef(null)

    const timeElapsedFromPlay = useRef(0)
    const lastCurrentTime = useRef(startTime ? startTime : 0)

    const [autoPlay, SetAutoPlay] = useState(AutoPlay.firstRenderValue)
    useEffect(() => {
        AutoPlay.OnValueChange(autoPlay)
    }, [autoPlay])
    const [quality, SetQuality] = useState(Quality.firstRenderValue)
    useEffect(() => {
        Quality.OnValueChange(quality)
    }, [quality])
    const [audio, SetAudio] = useState(Audio.firstRenderValue)
    useEffect(() => {
        Audio.OnValueChange(audio)
    }, [audio])
    const [subtitle, SetSubtitle] = useState(Subtitle.firstRenderValue)
    useEffect(() => {
        Subtitle.OnValueChange(subtitle)
    }, [subtitle])
    const [speed, SetSpeed] = useState(Speed.firstRenderValue)
    useEffect(() => {
        Speed.OnValueChange(speed)
    }, [speed])

    const [isPlayingVideo, setIsPlayingVideo] = useState(false)

    const [isVideoContainerFullScreen, setIsVideoContainerFullScreen] = useState(false)

    const [qualities, setQualities] = useState([])
    const [audios, setAudios] = useState([])
    const [subtitles, SetSubtitles] = useState([])

    function isLoading() {
        return isLoadingVideoData || isLoadingOctopus
    }

    function OnVideoPlayToggle(play = null) {
        if (isLoading()) {
            return
        }

        if (play !== null) {
            play ? videoRef.current.play() : videoRef.current.pause()
            setIsPlayingVideo(play)
            return
        }

        if (!isPlayingVideo) {
            videoRef.current.play()
            setIsPlayingVideo(true)
        } else {
            videoRef.current.pause()
            setIsPlayingVideo(false)
        }
    }

    const videoContainerRef = useRef(null)
    function handleVideoOnFullScreen() {
        if (isVideoContainerFullScreen) {
            if (document.exitFullscreen) {
                document.exitFullscreen()
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen()
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen()
            }

            setIsVideoContainerFullScreen(false)
        } else {
            if (videoContainerRef.current.requestFullscreen) {
                /*  standard method */
                videoContainerRef.current.requestFullscreen()
            } else if (videoContainerRef.current.webkitRequestFullscreen) {
                /* Safari */
                videoContainerRef.current.webkitRequestFullscreen()
            } else if (videoContainerRef.current.msRequestFullscreen) {
                /* IE11 */
                videoContainerRef.current.msRequestFullscreen()
            }
            setIsVideoContainerFullScreen(true)
        }
    }

    const videoScreenclickTimeoutRef = useRef(null)
    function onVideoMiddleOptionsScreenClick(e) {
        if (e.detail === 1) {
            videoScreenclickTimeoutRef.current = setTimeout(() => {
                OnVideoPlayToggle()
            }, 250) // Wait 250ms to see if it's a double click
        } else if (e.detail === 2) {
            clearTimeout(videoScreenclickTimeoutRef.current)
            handleVideoOnFullScreen()
        }
    }

    function onVideoScreenSeekClick(e, seconds) {
        if (isLoading()) {
            return
        }

        if (e.detail >= 2) {
            videoRef.current.currentTime += seconds
            timeChangedUIAlert(seconds)
        }
    }

    const [timeChangedAlertAmount, setTimeChangedAlertAmount] = useState(0)
    const timeChangedAlertTimeoutRef = useRef(null)
    function timeChangedUIAlert(seconds) {
        setTimeChangedAlertAmount(seconds)

        if (timeChangedAlertTimeoutRef.current) {
            clearTimeout(timeChangedAlertTimeoutRef.current)
        }

        timeChangedAlertTimeoutRef.current = setTimeout(() => {
            setTimeChangedAlertAmount(0)
        }, 500)
    }

    /* Subtitles */
    const isAdvancedSubtitleMode = useRef(false)
    const octopusRef = useRef(null)
    const [isLoadingOctopus, SetIsLoadingOctopus] = useState(true)
    const [octopusError, SetIsOctopusError] = useState(false)
    const [activeCues, setActiveCues] = useState([])

    useEffect(() => {
        let isMounted = true

        async function InitializeOctopus() {
            const options = {
                video: videoRef.current,
                workerUrl: workerUrl,
                legacyWorkerUrl: workerLegacyUrl,
                subContent: "[Script Info]\nScriptType: v4.00+",
                onReady: () => {
                    if (isMounted) SetIsLoadingOctopus(false)
                },
                fallbackFont: "/fonts/OpenSans-Regular-webfont.woff2",
                fonts: [
                    "/fonts/GandhiSans-Regular.otf",
                    "/fonts/GandhiSans-Bold.otf",
                    "/fonts/GandhiSans-Italic.otf",
                    "/fonts/GandhiSans-BoldItalic.otf",
                    "/fonts/Noto-Sans-regular.woff2",
                    "/fonts/NotoColorEmoji.woff2",
                    "/fonts/Roboto-Regular.woff2",
                    "/fonts/Trebuchet-MS.ttf",
                ],
            }
            const instance = new SubtitlesOctopus(options)
            instance.canvas.style.display = "none"

            return instance
        }

        InitializeOctopus()
            .then((instance) => {
                if (!isMounted) {
                    instance.dispose()
                    return
                }

                octopusRef.current = instance
            })
            .catch(() => {
                if (!isMounted) return

                SetIsLoadingOctopus(false)
                octopusRef.current = null
                SetIsOctopusError(true)
                console.error("Failed to initialize Octopus")
            })

        return () => {
            isMounted = false

            if (octopusRef.current) {
                octopusRef.current.dispose()
                octopusRef.current = null
            }
        }
    }, [])

    function updateUISubtitleInfo() {
        if (videoRef.current) {
            if (isAdvancedSubtitleMode.current) {
                if (hlsRef.current.subtitleTrack !== -1) {
                    hlsRef.current.subtitleTrack = -1
                    setActiveCues([])
                }
                return
            }

            let currentTexts = []
            for (let i = 0; i < videoRef.current.textTracks.length; i++) {
                const track = videoRef.current.textTracks[i]

                if (track.mode === "showing") {
                    track.mode = "hidden"
                }
                if (track.mode === "hidden" && track.activeCues) {
                    for (let j = 0; j < track.activeCues.length; j++) {
                        currentTexts.push(track.activeCues[j].text)
                    }
                }
            }
            setActiveCues((prev) => {
                if (prev.length === currentTexts.length && prev.every((val, index) => val === currentTexts[index])) {
                    return prev
                }
                return currentTexts
            })
        }
    }

    // HLS video setup
    const [isLoadingVideoData, setIsLoadingVideoData] = useState(true)
    const [isErrorLoadingVideoData, setIsErrorLoadingVideoData] = useState(false)
    const [fragmentsLoadedList, setFragmentsLoadedList] = useState([])
    const isNonAutoLevelSwitch = useRef(false)
    function handleLevelChange(newLevel) {
        const levelIndex = hlsRef.current.levels.findIndex((l) => l.height === newLevel.height)
        if (hlsRef.current) {
            if (levelIndex === -1) {
                SetQuality({ height: "auto" })
            } else {
                isNonAutoLevelSwitch.current = true
            }

            if (hlsRef.current.currentLevel !== levelIndex) {
                hlsRef.current.currentLevel = levelIndex
            } else {
                SetQuality({ height: newLevel.height })
            }
        }
    }

    function handleAudioChange(newAudio) {
        const audioIndex = hlsRef.current.audioTracks.findIndex((a) => a.name === newAudio.name)
        if (hlsRef.current) {
            hlsRef.current.audioTrack = audioIndex
        }
    }

    async function handleSubtitleChange(newSubtitle) {
        const subtitleIndex = hlsRef.current.subtitleTracks.findIndex((s) => s.name === newSubtitle.name)
        if (hlsRef.current) {
            hlsRef.current.subtitleTrack = subtitleIndex

            SetIsLoadingOctopus(true)
            const content = await onChangeSubtitle(newSubtitle)

            if (content && !octopusError) {
                if (isAdvancedSubtitleMode.current) {
                    octopusRef.current.freeTrack()
                } else {
                    isAdvancedSubtitleMode.current = true
                    octopusRef.current.canvas.style.display = "block"
                }

                octopusRef.current.setTrack(content)
            } else {
                if (isAdvancedSubtitleMode.current) {
                    isAdvancedSubtitleMode.current = false
                    octopusRef.current.freeTrack()
                    octopusRef.current.canvas.style.display = "none"
                }
            }
            SetIsLoadingOctopus(false)

            updateUISubtitleInfo()
        }
    }

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        if (periodicTimeUpdateInterval && onPeriodicTimeUpdateInterval) {
            video.addEventListener("timeupdate", () => {
                timeElapsedFromPlay.current += video.currentTime - lastCurrentTime.current
                lastCurrentTime.current = video.currentTime

                if (timeElapsedFromPlay.current >= periodicTimeUpdateInterval) {
                    onPeriodicTimeUpdateInterval(lastCurrentTime.current)
                    timeElapsedFromPlay.current = 0
                }
            })
        }

        setVolume(Volume.firstRenderValue)
        handleMuteToggle(Muted.firstRenderValue)

        let hls

        if (Hls.isSupported()) {
            setIsLoadingVideoData(true)

            hls = new Hls()
            hlsRef.current = hls
            hls.loadSource(src)
            hls.attachMedia(video)

            hls.on(Hls.Events.ERROR, (event, data) => {
                const isManifestError =
                    data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR || data.details === Hls.ErrorDetails.MANIFEST_LOAD_TIMEOUT || data.type === Hls.ErrorTypes.NETWORK_ERROR

                if (isManifestError || data.fatal) {
                    setIsLoadingVideoData(false)
                    setIsErrorLoadingVideoData(true)
                    updateUITimeInfo()
                    hls.destroy()
                    hls = null
                }

                if (octopusRef.current) {
                    octopusRef.current.freeTrack()
                }

                console.error("HLS.js error:", event, data)
            })

            hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
                setIsErrorLoadingVideoData(false)
                setIsLoadingVideoData(false)
                setFragmentsLoadedList([])
                setQualities(hls.levels || [])
                if (octopusRef.current) {
                    octopusRef.current.freeTrack()
                }

                // AUTO SLECTING VALUES BASSED ON LAST VALUE GOING BACK TO DEFAULT VALUES IF THEY DO NOT WORK WITH NEW SET OF VALUES OTHERWISE KEEP THEM THE SAME FOR NEXT VIDEO (keep audio local storage as default but the actual value to what its suppose to be during default)
                if (autoPlay) {
                    OnVideoPlayToggle(true)
                }

                handleLevelChange(quality)
                handleAudioChange(audio)
                handleSubtitleChange(subtitle)
            })

            hls.on(Hls.Events.FRAG_BUFFERED, (event, data) => {
                setFragmentsLoadedList((prev) => {
                    const newList = [...prev]
                    newList[data.fragmentIndex] = true
                    return newList
                })
                setIsLoadingVideoData(false)
                if (startTime && lastCurrentTime) {
                    video.currentTime = lastCurrentTime.current
                }
            })

            hls.on(Hls.Events.BUFFER_STALLED, () => {
                setIsLoadingVideoData(true)
            })

            hls.on(Hls.Events.LEVEL_UPDATED, (event, data) => {
                const newList = new Array(data.details.fragments.length).fill(false)
                setFragmentsLoadedList(newList)
            })

            hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, (event, data) => {
                setAudios(data.audioTracks || [])
            })

            hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, (event, data) => {
                SetSubtitles(data.subtitleTracks || [])
            })

            hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
                if (isNonAutoLevelSwitch.current) {
                    if (hls.levels[data.level] !== quality) {
                        const { height, ...rest } = hls.levels[data.level]
                        SetQuality({ height: height })
                    }
                    isNonAutoLevelSwitch.current = false
                }
            })

            hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, (event, data) => {
                if (hls.audioTracks[data.id] !== audio) {
                    const { name, ...rest } = hls.audioTracks[data.id]
                    SetAudio({ name: name })
                }
            })

            hls.on(Hls.Events.SUBTITLE_TRACK_SWITCH, (event, data) => {
                if (data.id === -1) {
                    if (isAdvancedSubtitleMode.current) {
                        return
                    }
                    SetSubtitle({ name: "none" })
                } else if (hls.subtitleTracks[data.id] !== subtitle) {
                    const { name, ...rest } = hls.subtitleTracks[data.id]
                    SetSubtitle({ name: name })
                }
            })
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = src
            if (autoPlay) {
                video.addEventListener("loadedmetadata", () => {
                    if (autoPlay) {
                        OnVideoPlayToggle(true)
                    }
                })
            }
        }

        function onVideoWaiting() {
            setIsLoadingVideoData(true)
        }

        function onVideoPlaying() {
            setIsLoadingVideoData(false)
        }

        video.addEventListener("waiting", onVideoWaiting)

        video.addEventListener("playing", onVideoPlaying)

        return () => {
            if (hls) {
                hls.destroy()
            }
            if (video) {
                video.removeEventListener("waiting", onVideoWaiting)
                video.removeEventListener("playing", onVideoPlaying)
            }
        }
    }, [src])

    // Focusing Video && KeyDown Events
    const [isVideoFocused, setIsVideoFocused] = useState(true)
    function onVideoScreenClick(e) {
        setIsVideoFocused(true)

        if (endCountdownRef.current) {
            CancelEndCountdown()
        }
    }

    useEffect(() => {
        function onVideoClickOutside(e) {
            if (videoContainerRef.current && !videoContainerRef.current.contains(e.target)) {
                setIsVideoFocused(false)
            }
        }

        document.addEventListener("click", onVideoClickOutside)

        function handleKeyDown(e) {
            if (isVideoFocused) {
                if (e.code === "Space") {
                    e.preventDefault()
                    CancelEndCountdown()
                    OnVideoPlayToggle()
                } else if (e.code === "ArrowRight") {
                    e.preventDefault()
                    CancelEndCountdown()
                    videoRef.current.currentTime += 5
                    timeChangedUIAlert(5)
                } else if (e.code === "ArrowLeft") {
                    e.preventDefault()
                    CancelEndCountdown()
                    videoRef.current.currentTime -= 5
                    timeChangedUIAlert(-5)
                } else if (e.code === "KeyF") {
                    e.preventDefault()
                    handleVideoOnFullScreen()
                }
            }
        }

        document.addEventListener("keydown", handleKeyDown)

        return () => {
            document.removeEventListener("keydown", handleKeyDown)
            document.removeEventListener("click", onVideoClickOutside)
        }
    }, [isVideoFocused, videoContainerRef.current, OnVideoPlayToggle])

    // Speed of video
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = speed
        }
    }, [speed])

    // EndCountdown Setup
    const endCountdownRef = useRef(null)
    const [currentCountdown, setCurrentCountdown] = useState(null)

    function CancelEndCountdown() {
        if (endCountdownRef.current) {
            clearTimeout(endCountdownRef.current)
            endCountdownRef.current = null
        }
        setCurrentCountdown(null)
    }

    useEffect(() => {
        function handleVideoEnded() {
            setIsPlayingVideo(false)
            if (autoPlay) {
                setCurrentCountdown(endCountdown)
            }
        }

        if (videoRef.current) {
            videoRef.current.addEventListener("ended", handleVideoEnded)
        }

        return () => {
            if (videoRef.current) {
                videoRef.current.removeEventListener("ended", handleVideoEnded)
            }
        }
    }, [videoRef, endCountdown, autoPlay])

    useEffect(() => {
        if (currentCountdown === null) {
            return
        } else if (currentCountdown <= 0) {
            onStreamEnd()
            return
        } else {
            endCountdownRef.current = setTimeout(() => {
                setCurrentCountdown((prev) => prev - 1)
            }, 1000)
        }

        return () => {
            clearTimeout(endCountdownRef.current)
        }
    }, [currentCountdown, onStreamEnd])

    function handleVideoOnTimeUpdate() {
        updateUITimeInfo()
        updateUISubtitleInfo()
    }

    function handleLoadedMetadata() {
        if (videoRef.current) {
            runOnTheMinute(() => {
                if (timeEnding.current) {
                    timeEnding.current.innerText = getCalendarDateAndTime(
                        getTimeNowWithSecondChange(videoRef.current ? videoRef.current.duration - videoRef.current.currentTime : 0)
                    )
                }
            })

            videoRef.current.currentTime = 0
            updateUITimeInfo()
        }
    }

    /*          */
    /*  Volume  */
    /*          */
    const volumeBarRef = useRef(null)
    const volumeBarAmountRef = useRef(0)
    const [volumePercentage, setVolumePercentage] = useState(Volume.firstRenderValue)
    useEffect(() => {
        Volume.OnValueChange(volumePercentage)
    }, [volumePercentage])
    const [isMuted, setIsMuted] = useState(Muted.firstRenderValue)
    useEffect(() => {
        Muted.OnValueChange(isMuted)
    }, [isMuted])

    function setVolume(percentage) {
        if (videoRef.current && volumeBarAmountRef.current) {
            if (percentage === 0) {
                videoRef.current.muted = true
                setIsMuted(videoRef.current.muted)
            } else {
                videoRef.current.muted = false
                setIsMuted(videoRef.current.muted)
            }

            videoRef.current.volume = percentage
            volumeBarAmountRef.current.style.width = `${videoRef.current.volume * 100}%`
            setVolumePercentage(videoRef.current.volume)
        }
    }

    function handleVolumeDown(e) {
        if (videoRef.current && volumeBarRef.current && volumeBarAmountRef.current) {
            const rect = volumeBarRef.current.getBoundingClientRect()
            function updateVolume(e) {
                const percentage = getMouseToRectPercentage(rect, e)
                setVolume(percentage)
            }

            function handleVolumeMove(e) {
                if (e.cancelable && e.type !== "touchmove") {
                    e.preventDefault()
                }
                updateVolume(e)
                handleMouseMoveOnVideo() // to prevent hover UI from disappearing when adjusting volume
            }

            function handleRemoveListeners() {
                window.removeEventListener("mousemove", handleVolumeMove)
                window.removeEventListener("mouseup", handleRemoveListeners)
                window.removeEventListener("touchmove", handleVolumeMove)
                window.removeEventListener("touchend", handleRemoveListeners)
            }

            updateVolume(e)

            window.addEventListener("mousemove", handleVolumeMove)
            window.addEventListener("mouseup", handleRemoveListeners)
            window.addEventListener("touchmove", handleVolumeMove, { passive: false })
            window.addEventListener("touchend", handleRemoveListeners)
        }
    }

    function handleMuteToggle(mute = null) {
        if (videoRef.current && volumeBarAmountRef.current) {
            if (mute !== null) {
                videoRef.current.muted = mute
            } else {
                videoRef.current.muted = !videoRef.current.muted
            }

            setIsMuted(videoRef.current.muted)

            if (!videoRef.current.muted && videoRef.current.volume === 0) {
                setVolume(0.45)
            }
        }
    }

    /*          */
    /* Timeline */
    /*          */
    const timeCurrent = useRef(null)
    const timeLeft = useRef(null)
    const timeEnding = useRef(null)
    const timeline = useRef(null)
    const timelineSurf = useRef(null)
    const timelinePlay = useRef(null)

    function updateUITimeInfo() {
        timelinePlay.current.style.width = `${(videoRef.current.currentTime / videoRef.current.duration) * 100}%`

        // update all time related states
        timeCurrent.current.innerText = formatTime(videoRef.current.currentTime)
        timeLeft.current.innerText = formatTime(videoRef.current.duration - videoRef.current.currentTime)
        timeEnding.current.innerText = getCalendarDateAndTime(getTimeNowWithSecondChange(videoRef.current.duration - videoRef.current.currentTime))
    }

    function handleTimelineDown(e) {
        if (isLoading()) {
            return
        }

        if (videoRef.current && videoRef.current.duration > 0 && timeline.current && timelinePlay.current) {
            const rect = timeline.current.getBoundingClientRect()

            function updatePlayTimeline(e) {
                const percentage = getMouseToRectPercentage(rect, e)
                videoRef.current.currentTime = percentage * videoRef.current.duration
                updateUITimeInfo()
            }

            function handleTimelineMove(e) {
                if (e.cancelable && e.type !== "touchmove") {
                    e.preventDefault()
                }
                updatePlayTimeline(e)
                handleMouseMoveOnVideo() // to prevent hover UI from disappearing when dragging timeline
            }

            function handleRemoveListeners() {
                window.removeEventListener("mousemove", handleTimelineMove)
                window.removeEventListener("mouseup", handleRemoveListeners)
                window.removeEventListener("touchmove", handleTimelineMove)
                window.removeEventListener("touchend", handleRemoveListeners)
            }

            updatePlayTimeline(e)

            window.addEventListener("mousemove", handleTimelineMove)
            window.addEventListener("mouseup", handleRemoveListeners)
            window.addEventListener("touchmove", handleTimelineMove, { passive: false })
            window.addEventListener("touchend", handleRemoveListeners)
        }
    }

    function handleTimelineHover(e) {
        if (timelineSurf.current && timeline.current) {
            const rect = timeline.current.getBoundingClientRect()
            const percentage = getMouseToRectPercentage(rect, e)
            timelineSurf.current.style.width = `${percentage * 100}%`
        }
    }

    function handleTimelineLeave() {
        if (timelineSurf.current) {
            timelineSurf.current.style.width = "0%"
        }
    }

    /*         */
    /* Options */
    /*         */
    const [isShowingOptions, setIsShowingOptions] = useState(false)
    function ToggleGearOptions(show = null) {
        if (isErrorLoadingVideoData) {
            return
        }

        if (show !== null) {
            setIsShowingOptions(show)
        } else {
            setIsShowingOptions((prev) => !prev)
        }
    }

    /* Showing UI */
    const [mouseMovingOnVideo, setMouseMovingOnVideo] = useState(false)
    const mouseMovingOnVideoTimerRef = useRef(null)
    const [hoverUIFirstAppear, setHoverUIFirstAppear] = useState(true)
    const hoverUIFirstAppearTimerRef = useRef(null)
    const [hoverUILastAppear, setHoverUILastAppear] = useState(true)
    const hoverUILastAppearTimerRef = useRef(null)
    const [mouseIsInsideVideo, setMouseIsInsideVideo] = useState(false)

    function handleMouseMoveOnVideo() {
        setMouseMovingOnVideo(true)

        if (mouseMovingOnVideoTimerRef.current) {
            clearTimeout(mouseMovingOnVideoTimerRef.current)
        }

        mouseMovingOnVideoTimerRef.current = setTimeout(() => {
            setMouseMovingOnVideo(false)
        }, 1000 * 2)
    }

    useEffect(() => {
        function onHoverUIFirstAppearDisappear() {
            setHoverUIFirstAppear(false)
            clearTimeout(hoverUIFirstAppearTimerRef.current)
            hoverUIFirstAppearTimerRef.current = null
            if (isPlayingVideo) {
                ToggleGearOptions(false)
            }
        }

        function onHoverUILastAppearDisappear() {
            setHoverUILastAppear(false)
            clearTimeout(hoverUILastAppearTimerRef.current)
            hoverUILastAppearTimerRef.current = null
        }

        if (!mouseMovingOnVideo) {
            hoverUIFirstAppearTimerRef.current = setTimeout(onHoverUIFirstAppearDisappear, 1000 * 0.5)
            hoverUILastAppearTimerRef.current = setTimeout(onHoverUILastAppearDisappear, 1000 * 1)
        } else {
            setHoverUIFirstAppear(true)
            setHoverUILastAppear(true)
        }

        return () => {
            if (hoverUIFirstAppearTimerRef.current) {
                clearTimeout(hoverUIFirstAppearTimerRef.current)
                hoverUIFirstAppearTimerRef.current = null
            }
            if (hoverUILastAppearTimerRef.current) {
                clearTimeout(hoverUILastAppearTimerRef.current)
                hoverUILastAppearTimerRef.current = null
            }
        }
    }, [mouseMovingOnVideo])

    return (
        <div
            ref={videoContainerRef}
            onClick={onVideoScreenClick}
            onMouseMove={handleMouseMoveOnVideo}
            onMouseEnter={() => {
                setMouseIsInsideVideo(true)
            }}
            onMouseLeave={() => {
                setMouseIsInsideVideo(false)
            }}
            style={{ zIndex: videoPlayerZ }}
            className={`flex flex-col w-full h-full items-center justify-center bg-black relative group ${mouseIsInsideVideo && !hoverUILastAppear && isPlayingVideo ? "cursor-none" : "cursor-default"}`}
        >
            {/* Overview Controls Click */}
            <div
                style={{ zIndex: videoPlayerTouch }}
                className={`flex flex-row absolute w-full h-full`}
            >
                {/* Left */}
                <div
                    onClick={(e) => {
                        onVideoScreenSeekClick(e, -5)
                    }}
                    className="w-[25%] h-full"
                ></div>
                {/* Middle */}
                <div
                    onClick={onVideoMiddleOptionsScreenClick}
                    className="w-full h-full flex items-center justify-center touch-manipulation"
                >
                    {isLoadingVideoData || isLoadingOctopus ? (
                        <div className="group/middleplay p-3 md:p-4 rounded-full cursor-pointer">
                            <DefaultSpinner
                                className="group-hover/middleplay:text-s-white"
                                size={{ default: 24, md: 48 }}
                            />
                        </div>
                    ) : isErrorLoadingVideoData ? (
                        <div className="p-3 md:p-4 rounded-full cursor-pointer">
                            <CircleX
                                className="text-s-white/60 group-hover/middleplay:text-s-white"
                                size={48}
                            />
                        </div>
                    ) : (
                        <>
                            {timeChangedAlertAmount !== 0 && currentCountdown <= 0 && (
                                <div className="flex justify-center items-center flex-row gap-2 bg-black/60 px-3 py-2 rounded-full select-none">
                                    {timeChangedAlertAmount < 0 && <Rewind className="w-7 h-7 text-s-white select-none" />}
                                    <p className="text-s-white text-xl font-bold px-2 py-1 select-none">
                                        {timeChangedAlertAmount > 0 ? "+" : "-"} {Math.abs(timeChangedAlertAmount)}s
                                    </p>
                                    {timeChangedAlertAmount > 0 && <FastForward className="w-7 h-7 text-s-white select-none" />}
                                </div>
                            )}
                            {timeChangedAlertAmount === 0 &&
                                currentCountdown <= 0 &&
                                (isPlayingVideo ? (
                                    <div className="group/middleplay p-3 md:p-4 bg-black/35 hover:bg-black/60 rounded-full cursor-pointer transition duration-600 ease-in-out opacity-0 group-hover/middleplay:opacity-100">
                                        <Pause className="text-s-white/60 group-hover/middleplay:text-s-white w-7 h-7 md:w-12 md:h-12" />
                                    </div>
                                ) : (
                                    <div className="group/middleplay p-3 md:p-4 bg-black/35 hover:bg-black/60 rounded-full cursor-pointer">
                                        <Play className="text-s-white/60 group-hover/middleplay:text-s-white w-7 h-7 md:w-12 md:h-12" />
                                    </div>
                                ))}
                            {timeChangedAlertAmount === 0 && currentCountdown && (
                                <div className="p-3 md:p-4 bg-black/35 hover:bg-black/60 rounded-full cursor-pointer flex items-center justify-center">
                                    <p className="w-8 h-8 md:w-12 md:h-12 text-s-white/80 text-center text-lg md:text-3xl flex items-center justify-center">{currentCountdown}</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
                {/* Right */}
                <div
                    onClick={(e) => {
                        onVideoScreenSeekClick(e, 5)
                    }}
                    className="w-[25%] h-full"
                ></div>
            </div>

            {/* Video & Subtitles Wrapper */}
            <div className="absolute top-0 left-0 w-full h-full">
                <video
                    ref={videoRef}
                    controls={false}
                    loop={false}
                    onTimeUpdate={handleVideoOnTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onPlay={() => OnVideoPlayToggle(true)}
                    onPause={() => OnVideoPlayToggle(false)}
                    className="w-full h-full object-contain"
                />
            </div>

            {/* Custom Subtitle Renderer */}
            <div
                style={{ zIndex: videoPlayerOpsZ - 1 }}
                className={`absolute w-full flex flex-col items-center select-none transition-all duration-150 ease-in-out ${isPlayingVideo && !hoverUIFirstAppear && !hoverUILastAppear ? "bottom-3" : hoverUIFirstAppear && !hoverUILastAppear ? "bottom-6 md:bottom-8" : "bottom-14 md:bottom-20"}`}
            >
                {activeCues.map((cue, idx) => (
                    <p
                        key={idx}
                        className="bg-black/55 text-s-white px-2 py-1 rounded-xs text-center text-md font-medium mb-1 drop-shadow-md whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: cue }}
                    />
                ))}
            </div>

            {/* Complete At Text */}
            <div
                style={{ zIndex: videoPlayerOpsZ }}
                className={`absolute top-2 select-none w-full flex justify-end ${(isPlayingVideo && !hoverUILastAppear) || (timeEnding.current && timeEnding.current.innerText.length === 0) ? "opacity-0" : "opacity-100"} transition-opacity duration-300 ease-in-out`}
            >
                <div className="px-1 py-0.5 mx-2 rounded-xs bg-black/80 group-hover:bg-black">
                    <p className="text-s-white text-[8px] md:text-xs font-medium">
                        Complete At:{" "}
                        <span
                            className="text-s-secondary"
                            ref={timeEnding}
                        ></span>
                    </p>
                </div>
            </div>

            {/* Options */}
            <div
                style={{ zIndex: videoPlayerOpsZ }}
                className={`absolute bottom-6.5 md:bottom-10 left-0 w-full h-8 flex flex-row items-center justify-between px-4 ${isPlayingVideo && !hoverUIFirstAppear ? "opacity-0" : "opacity-100"} transition-opacity duration-300 ease-in-out`}
            >
                <div className="flex flex-row items-center gap-2">
                    {/* Play/Pause */}
                    <button
                        onClick={() => {
                            OnVideoPlayToggle()
                        }}
                        className="p-1.5 hover:rounded-xs hover:bg-s-tertiary/40 cursor-pointer bg-black/60 rounded-full"
                    >
                        {!isPlayingVideo ? (
                            <Play
                                fill="black"
                                className="w-4 h-4 md:h-7 md:w-7 text-s-white cursor-pointer"
                            />
                        ) : (
                            <Pause
                                fill="black"
                                className="w-4 h-4 md:h-7 md:w-7 text-s-white cursor-pointer"
                            />
                        )}
                    </button>

                    {/* Settings */}
                    <div className="min-[320px]:block hidden">
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                if (isLoading()) {
                                    return
                                }
                                ToggleGearOptions()
                            }}
                            className={`p-1.5 ${isShowingOptions ? "bg-s-primary rounded-xs" : "hover:bg-s-tertiary/40 bg-black/60 rounded-full hover:rounded-xs"} cursor-pointer`}
                        >
                            <Settings
                                fill="black"
                                className="w-4 h-4 md:h-7 md:w-7 text-s-white"
                            />
                        </button>
                    </div>

                    {/* Volume */}
                    <div className="flex items-center justify-center relative mx-1 gap-1 md:gap-2 touch-none bg-black/60 rounded-full pl-2 pr-4">
                        <button
                            onClick={() => {
                                handleMuteToggle()
                            }}
                            className="p-1 hover:rounded-xs hover:bg-s-tertiary/40 cursor-pointer"
                        >
                            {isMuted || volumePercentage <= 0 ? (
                                <VolumeX
                                    fill="black"
                                    className="w-4 h-4 md:h-7 md:w-7 text-s-white"
                                />
                            ) : volumePercentage < 0.2 ? (
                                <Volume0
                                    fill="black"
                                    className="w-4 h-4 md:h-7 md:w-7 text-s-white"
                                />
                            ) : volumePercentage < 0.7 ? (
                                <Volume1
                                    fill="black"
                                    className="w-4 h-4 md:h-7 md:w-7 text-s-white"
                                />
                            ) : (
                                <Volume2
                                    fill="black"
                                    className="w-4 h-4 md:h-7 md:w-7 text-s-white"
                                />
                            )}
                        </button>
                        <div
                            ref={volumeBarRef}
                            className="w-full h-6 md:h-8 flex items-center group/volume mx-1 touch-none cursor-pointer"
                            onMouseDown={handleVolumeDown}
                            onTouchStart={handleVolumeDown}
                        >
                            <div className="w-12 md:w-24 h-1.5 group-hover/volume:h-2 bg-s-dark-secondary/60 self-center rounded-4xl">
                                <div
                                    ref={volumeBarAmountRef}
                                    style={{ width: 0 }}
                                    className={`relative h-full bg-s-primary rounded-4xl flex items-center`}
                                >
                                    <div
                                        onMouseDown={handleVolumeDown}
                                        onTouchStart={handleVolumeDown}
                                        className="absolute cursor-pointer -right-2 w-3 h-3 md:w-4 md:h-4 rounded-full bg-s-secondary group-hover/volume:bg-s-white"
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <button
                        onClick={handleVideoOnFullScreen}
                        className="p-1.5 hover:rounded-xs hover:bg-s-tertiary/40 cursor-pointer bg-black/60 rounded-full"
                    >
                        {isVideoContainerFullScreen ? <Minimize2 className="w-4 h-4 md:h-7 md:w-7 text-s-white" /> : <Maximize2 className="w-4 h-4 md:h-7 md:w-7 text-s-white" />}
                    </button>
                </div>
            </div>

            {/* Settings Pop Up */}
            <>
                <div
                    style={{ zIndex: videoPlayerOpsZ + 2 }}
                    className={`absolute md:bottom-19 bottom-14.25 md:left-16 md:px-0 h-fit w-full md:w-92`}
                >
                    <VideoPlayerOptions
                        qualities={qualities}
                        quality={quality}
                        SetQuality={handleLevelChange}
                        audios={audios}
                        SetAudio={handleAudioChange}
                        audio={audio}
                        subtitles={subtitles}
                        SetSubtitle={async (sub) => {
                            await handleSubtitleChange(sub)
                        }}
                        subtitle={subtitle}
                        speed={speed}
                        SetSpeed={SetSpeed}
                        SetAutoPlay={SetAutoPlay}
                        autoPlay={autoPlay}
                        isHidden={!isShowingOptions || (isPlayingVideo && !hoverUIFirstAppear)}
                    />
                </div>
                <div
                    style={{ zIndex: videoPlayerTouch - 1 }}
                    onClick={() => ToggleGearOptions()}
                    className={`fixed inset-0 ${isShowingOptions ? "" : "hidden"}`}
                ></div>
                <div
                    style={{ zIndex: -1 }}
                    className={`fixed inset-0 bg-black/60 md:bg-black/0 ${isShowingOptions ? "" : "hidden"}`}
                ></div>
            </>

            {/* Timeline */}
            <div
                style={{ zIndex: videoPlayerOpsZ }}
                className={`absolute bottom-0 left-0 w-full h-8 flex flex-row items-center justify-center px-2 ${isPlayingVideo && !hoverUILastAppear ? "opacity-0" : "opacity-100"} transition-opacity duration-300 ease-in-out`}
            >
                <p
                    ref={timeCurrent}
                    className="text-s-white text-xs md:text-sm px-1 py-0.5 mx-2 font-thin rounded-xs bg-black/80 group-hover:bg-black select-none"
                >
                    {formatTime(0)}
                </p>
                <div
                    ref={timeline}
                    className="w-full h-[75%] group/timeline flex items-center relative cursor-pointer mx-1 touch-none"
                    onMouseDown={handleTimelineDown}
                    onTouchStart={handleTimelineDown}
                    onMouseMove={handleTimelineHover}
                    onTouchMove={handleTimelineHover}
                    onMouseLeave={handleTimelineLeave}
                    onTouchEnd={handleTimelineLeave}
                    onTouchCancel={handleTimelineLeave}
                >
                    <div className="absolute bottom-2.5 group-hover/timeline:bottom-2 w-full h-1 group-hover/timeline:h-2 bg-s-dark-secondary/60 self-center rounded-4xl">
                        <div className={`absolute w-full h-full rounded-4xl flex items-center`}>
                            {fragmentsLoadedList.map((isLoaded, index) => {
                                const isStartFragment = index === 0
                                const isEndFragment = index === fragmentsLoadedList.length - 1
                                return (
                                    <div
                                        key={index}
                                        style={{ width: `${100 / fragmentsLoadedList.length}%` }}
                                        className={`h-full bg-amber-50 ${isStartFragment ? "rounded-l-4xl" : isEndFragment ? "rounded-r-4xl" : ""}`}
                                    ></div>
                                )
                            })}
                        </div>
                        <div
                            ref={timelineSurf}
                            style={{ width: 0 }}
                            className={`absolute h-full bg-s-dark-secondary rounded-4xl flex items-center`}
                        ></div>
                        <div
                            ref={timelinePlay}
                            style={{ width: 0 }}
                            className={`absolute h-full bg-s-primary rounded-4xl flex items-center`}
                        >
                            <div
                                onMouseDown={handleTimelineDown}
                                onTouchStart={handleTimelineDown}
                                className="absolute -right-2 w-4 h-4 rounded-full bg-s-secondary group-hover/timeline:bg-s-white cursor-pointer"
                            ></div>
                        </div>
                    </div>
                </div>
                <p
                    ref={timeLeft}
                    className="text-s-white text-xs md:text-sm px-1 py-0.5 mx-2 font-thin rounded-xs bg-black/80 group-hover:bg-black select-none"
                >
                    {formatTime(0)}
                </p>
            </div>
        </div>
    )
}

function VideoPlayerOptions({
    qualities,
    SetQuality,
    quality,
    audios,
    SetAudio,
    audio,
    subtitles,
    SetSubtitle,
    subtitle,
    speed,
    SetSpeed,
    SetAutoPlay,
    autoPlay,
    isHidden = false,
}) {
    const isSm = useMediaQuery({ minWidth: 640 })
    const [isQualityOptionsOpen, setIsQualityOptionsOpen] = useState(false)
    const [isAudioOptionsOpen, setIsAudioOptionsOpen] = useState(false)
    const [isSubtitleOptionsOpen, setIsSubtitleOptionsOpen] = useState(false)
    const [isSpeedOptionsOpen, setIsSpeedOptionsOpen] = useState(false)

    function handleOptionOpenClick(isOptionsOpen = null, setOptionOpen = null) {
        if (isQualityOptionsOpen) {
            setIsQualityOptionsOpen(false)
        } else if (isAudioOptionsOpen) {
            setIsAudioOptionsOpen(false)
        } else if (isSubtitleOptionsOpen) {
            setIsSubtitleOptionsOpen(false)
        } else if (isSpeedOptionsOpen) {
            setIsSpeedOptionsOpen(false)
        }

        if (setOptionOpen !== null) {
            setOptionOpen(!isOptionsOpen)
        }
    }

    useEffect(() => {
        if (isHidden) {
            handleOptionOpenClick()
        }
    })

    const [currentQualityToggle, setCurrentQualityToggle] = useState(false)
    const [currentAudioToggle, setCurrentAudioToggle] = useState(false)
    const [currentSubtitleToggle, setCurrentSubtitleToggle] = useState(false)
    const [currentSpeedToggle, setCurrentSpeedToggle] = useState(false)
    return (
        <div className={`relative ${isHidden ? "hidden" : "min-[320px]:flex hidden"} flex-col bg-s-dark-primary rounded-xs px-1 border border-s-primary py-1`}>
            {/* All Options Categories */}
            <VerticalScrollable
                itemCount={5}
                pxCutoffHeight={isSm ? 172 : 112}
                pxCutoffWidth={null}
                ItemRenderer={({ index }) => {
                    const isAutoPlay = 0
                    const isQuality = 1
                    const isAudio = 2
                    const isSubtitle = 3
                    const isSpeed = 4
                    switch (index) {
                        case isAutoPlay:
                            return (
                                <VideoPlayerOptionSelectionCheckSlider
                                    label={"Autoplay"}
                                    startingToggled={autoPlay}
                                    onClick={(isChecked) => {
                                        SetAutoPlay(isChecked)
                                    }}
                                />
                            )
                        case isQuality:
                            return (
                                <VideoPlayerOptionSelectionNext
                                    label={"Quality"}
                                    isDefault={quality ? quality.height === "auto" : true}
                                    selectedLabel={
                                        <ResolutionLabel
                                            height={quality && quality.height !== "auto" ? quality.height : "Auto"}
                                            isHD={quality ? quality.height > 720 : false}
                                            isAuto={quality ? quality.height === "auto" : true}
                                        />
                                    }
                                    onClick={() => handleOptionOpenClick(isQualityOptionsOpen, setIsQualityOptionsOpen)}
                                />
                            )
                        case isAudio:
                            return (
                                <VideoPlayerOptionSelectionNext
                                    label={"Audio"}
                                    isDefault={false}
                                    selectedLabel={<Label>{audio && audio.name ? audio.name : "None"}</Label>}
                                    onClick={() => handleOptionOpenClick(isAudioOptionsOpen, setIsAudioOptionsOpen)}
                                />
                            )
                        case isSubtitle:
                            return (
                                <VideoPlayerOptionSelectionNext
                                    label={"Subtitle"}
                                    isDefault={false}
                                    selectedLabel={
                                        <SubtitleLabel
                                            label={subtitle && subtitle.name !== "none" ? subtitle.name : "None"}
                                            isCC={false}
                                        />
                                    }
                                    onClick={() => handleOptionOpenClick(isSubtitleOptionsOpen, setIsSubtitleOptionsOpen)}
                                />
                            )
                        case isSpeed:
                            return (
                                <VideoPlayerOptionSelectionNext
                                    label={"Speed"}
                                    isDefault={false}
                                    selectedLabel={<Label>{speed}x</Label>}
                                    onClick={() => handleOptionOpenClick(isSpeedOptionsOpen, setIsSpeedOptionsOpen)}
                                />
                            )
                    }
                }}
            />

            {/* Quality Options */}
            {isQualityOptionsOpen && (
                <VideoPlayerOptionDropDownTemplate
                    label={"Quality"}
                    onBack={() => setIsQualityOptionsOpen(false)}
                >
                    <VerticalScrollable
                        itemCount={qualities && qualities.length + 1}
                        pxCutoffHeight={isSm ? 132 : 80}
                        pxCutoffWidth={null}
                        ItemRenderer={({ index }) => {
                            const qualityIndex = qualities.length - index
                            return index === 0 ? (
                                <VideoPlayerOptionSelectionCheckbox
                                    key={index}
                                    label={
                                        <ResolutionLabel
                                            height={"Auto"}
                                            isHD={false}
                                            isAuto={true}
                                        />
                                    }
                                    onToggle={(isChecked, toggle) => {
                                        if (quality && quality.height !== "auto") {
                                            if (currentQualityToggle) {
                                                currentQualityToggle()
                                            }
                                            setCurrentQualityToggle(() => toggle)
                                            SetQuality({ height: "auto" })
                                        }
                                        if (!isChecked) {
                                            toggle()
                                        }
                                    }}
                                    stopOnClickPropagation={true}
                                    startingToggled={quality && quality.height === "auto"}
                                />
                            ) : (
                                <VideoPlayerOptionSelectionCheckbox
                                    key={index}
                                    label={
                                        <ResolutionLabel
                                            height={qualities[qualityIndex].height}
                                            isHD={qualities[qualityIndex].height > 720}
                                        />
                                    }
                                    onToggle={(isChecked, toggle) => {
                                        if (quality && quality.height !== qualities[qualityIndex].height) {
                                            if (currentQualityToggle) {
                                                currentQualityToggle()
                                            }
                                            setCurrentQualityToggle(() => toggle)
                                            SetQuality(qualities[qualityIndex])
                                        }
                                        if (!isChecked) {
                                            toggle()
                                        }
                                    }}
                                    stopOnClickPropagation={true}
                                    startingToggled={quality && qualities[qualityIndex].height === quality.height}
                                />
                            )
                        }}
                    />
                </VideoPlayerOptionDropDownTemplate>
            )}

            {/* Audio Options */}
            {isAudioOptionsOpen && (
                <VideoPlayerOptionDropDownTemplate
                    label={"Audio"}
                    onBack={() => setIsAudioOptionsOpen(false)}
                >
                    <VerticalScrollable
                        itemCount={audios ? audios.length : 0}
                        pxCutoffHeight={isSm ? 132 : 80}
                        pxCutoffWidth={null}
                        ItemRenderer={({ index }) => {
                            const track = audios[index]
                            return (
                                <VideoPlayerOptionSelectionCheckbox
                                    key={index}
                                    label={<Label>{track?.name}</Label>}
                                    onToggle={(isChecked, toggle) => {
                                        if (audio && track && audio.name !== track.name) {
                                            if (currentAudioToggle) {
                                                currentAudioToggle()
                                            }
                                            setCurrentAudioToggle(() => toggle)
                                            SetAudio(track)
                                        }
                                        if (!isChecked) {
                                            toggle()
                                        }
                                    }}
                                    stopOnClickPropagation={true}
                                    startingToggled={audio && track && track.name === audio.name}
                                />
                            )
                        }}
                    />
                </VideoPlayerOptionDropDownTemplate>
            )}

            {/* Subtitle Options */}
            {isSubtitleOptionsOpen && (
                <VideoPlayerOptionDropDownTemplate
                    label={"Subtitle"}
                    onBack={() => setIsSubtitleOptionsOpen(false)}
                >
                    <VerticalScrollable
                        itemCount={subtitles ? subtitles.length + 1 : 0}
                        pxCutoffHeight={isSm ? 132 : 80}
                        pxCutoffWidth={null}
                        ItemRenderer={({ index }) => {
                            const trackIndex = index - 1
                            let track = { name: "none" }
                            if (index !== 0) {
                                track = subtitles[trackIndex]
                            }
                            return track.name === "none" ? (
                                <VideoPlayerOptionSelectionCheckbox
                                    key={index}
                                    label={
                                        <SubtitleLabel
                                            label={"None"}
                                            isCC={false}
                                        />
                                    }
                                    onToggle={(isChecked, toggle) => {
                                        if (subtitle && track && subtitle.name !== track.name) {
                                            if (currentSubtitleToggle) {
                                                currentSubtitleToggle()
                                            }
                                            setCurrentSubtitleToggle(() => toggle)
                                            SetSubtitle({ name: "none" })
                                        }
                                        if (!isChecked) {
                                            toggle()
                                        }
                                    }}
                                    stopOnClickPropagation={true}
                                    startingToggled={subtitle && track && track.name === subtitle.name}
                                />
                            ) : (
                                <VideoPlayerOptionSelectionCheckbox
                                    key={index}
                                    label={
                                        <SubtitleLabel
                                            label={track && track.name}
                                            isCC={
                                                track.attrs && track.attrs.CHARACTERISTICS && track.attrs.CHARACTERISTICS.includes("public.accessibility.describes-music-and-sound")
                                            }
                                        />
                                    }
                                    onToggle={(isChecked, toggle) => {
                                        if (subtitle && track && subtitle.name !== track.name) {
                                            if (currentSubtitleToggle) {
                                                currentSubtitleToggle()
                                            }
                                            setCurrentSubtitleToggle(() => toggle)
                                            SetSubtitle(track)
                                        }
                                        if (!isChecked) {
                                            toggle()
                                        }
                                    }}
                                    stopOnClickPropagation={true}
                                    startingToggled={subtitle && track && track.name === subtitle.name}
                                />
                            )
                        }}
                    />
                </VideoPlayerOptionDropDownTemplate>
            )}

            {/* Speed Options */}
            {isSpeedOptionsOpen && (
                <VideoPlayerOptionDropDownTemplate
                    label={"Speed"}
                    onBack={() => setIsSpeedOptionsOpen(false)}
                >
                    <VerticalScrollable
                        itemCount={12}
                        pxCutoffHeight={isSm ? 132 : 80}
                        pxCutoffWidth={null}
                        ItemRenderer={({ index }) => {
                            let speedOption = 0
                            if (index === 0) {
                                speedOption = 0.1
                            } else if (index >= 1 && index <= 8) {
                                speedOption = index / 4
                            } else {
                                speedOption = index - 8 + 2
                            }

                            return (
                                <VideoPlayerOptionSelectionCheckbox
                                    key={index}
                                    label={<SpeedLabel label={speedOption} />}
                                    onToggle={(isChecked, toggle) => {
                                        if (speed && speedOption !== speed) {
                                            if (currentSpeedToggle) {
                                                currentSpeedToggle()
                                            }
                                            setCurrentSpeedToggle(() => toggle)
                                            SetSpeed(speedOption)
                                        }
                                        if (!isChecked) {
                                            toggle()
                                        }
                                    }}
                                    stopOnClickPropagation={true}
                                    startingToggled={speed && speedOption === speed}
                                />
                            )
                        }}
                    />
                </VideoPlayerOptionDropDownTemplate>
            )}
        </div>
    )
}

function VideoPlayerOptionSelectionTemplate({ children, isHover = false, label = null, onClick = null }) {
    return (
        <div
            onClick={(e) => {
                onClick && onClick(e)
            }}
            className={`${isHover ? "hover:bg-s-dark-secondary" : ""} ${onClick ? "cursor-pointer" : ""} relative flex flex-row items-center justify-between rounded-xs w-full min-[320px] h-10 px-1 my-0.5 bg-s-dark-secondary/10`}
        >
            {label ? <p className="text-s-white text-[10px] md:text-sm font-semibold text-center select-none">{label}</p> : <div></div>}
            {children}
        </div>
    )
}

function VideoPlayerOptionSelectionCheckSlider({ label, startingToggled = false, stopOnClickPropagation = false, onClick = (isChecked, toggle) => {} }) {
    const [isChecked, setIsChecked] = useState(startingToggled)

    function toggle() {
        setIsChecked((prev) => !prev)
    }

    function handleClick(e) {
        if (stopOnClickPropagation && e) {
            e.stopPropagation()
        }

        onClick && onClick(!isChecked, toggle)
        toggle()
    }

    return (
        <VideoPlayerOptionSelectionTemplate
            label={label}
            onClick={handleClick}
            isHover={true}
        >
            <div className="relative w-8 h-4 md:w-10 md:h-4.5 rounded-xs outline-[1.5px] outline-s-primary p-px pointer-events-none">
                <div className="w-full h-full rounded-full bg-s-dark-secondary/30 pointer-events-none">
                    <div
                        style={{ width: isChecked ? "100%" : 0 }}
                        className="relative w-full h-full rounded-full bg-s-tertiary"
                    >
                        <div className={`absolute ${isChecked ? "right-0" : "left-0"} rounded-full w-3.5 h-3.5 md:w-4 md:h-4 bg-s-secondary`}></div>
                    </div>
                </div>
            </div>
        </VideoPlayerOptionSelectionTemplate>
    )
}

function VideoPlayerOptionSelectionCheckbox({ label, startingToggled = false, onToggle = (isChecked, toggle) => {}, stopOnClickPropagation = false }) {
    const [isChecked, setIsChecked] = useState(startingToggled)

    useEffect(() => {
        if (startingToggled) {
            onToggle && onToggle(true, toggle)
        }
    }, [])

    function toggle() {
        setIsChecked((prev) => !prev)
    }

    function handleClick(e) {
        if (stopOnClickPropagation && e) {
            e.stopPropagation()
        }

        onToggle && onToggle(!isChecked, toggle)
        toggle()
    }

    return (
        <VideoPlayerOptionSelectionTemplate
            label={null}
            onClick={handleClick}
            isHover={true}
        >
            <div className="flex flex-row items-center gap-2 pointer-events-none">
                {label}
                <div className={`outline-2 outline-s-primary rounded-xs w-4 h-4 p-0.75 pointer-events-none`}>
                    {isChecked && <div className={"w-full h-full rounded-xs bg-s-primary"}></div>}
                </div>
            </div>
        </VideoPlayerOptionSelectionTemplate>
    )
}

function VideoPlayerOptionSelectionNext({ label, startingToggled = false, isDefault, selectedLabel, onClick = (isNext, toggle) => {}, stopOnClickPropagation = false }) {
    const [isNext, setIsNext] = useState(startingToggled)

    function toggle() {
        setIsNext((prev) => !prev)
    }

    function handleClick(e) {
        if (stopOnClickPropagation && e) {
            e.stopPropagation()
        }

        onClick && onClick(!isNext, toggle)
        toggle()
    }

    return (
        <VideoPlayerOptionSelectionTemplate
            isHover={true}
            label={label}
            onClick={handleClick}
        >
            <div className="w-full flex flex-row justify-end items-center gap-2">
                {isDefault && <p className="text-gray-500 text-[8px] md:text-xs">Default</p>}
                {selectedLabel}

                <SquareChevronRight className=" w-4 h-4 text-s-primary" />
            </div>
        </VideoPlayerOptionSelectionTemplate>
    )
}

function VideoPlayerOptionDropDownTemplate({ label, onBack = () => {}, children }) {
    return (
        <div className="absolute left-0 top-0 w-full h-full bg-s-dark-primary">
            <div className="flex flex-row items-center justify-between gap-2 p-1">
                <SquareChevronLeft
                    className={"text-s-white cursor-pointer mx-1 my-0.5 w-6 h-6"}
                    onClick={onBack}
                />
                <p className={"text-s-dark-secondary font-bold text-sm"}>{label}</p>
            </div>
            {children}
        </div>
    )
}

function Label({ children }) {
    return <p className="text-s-white text-sm flex flex-row gap-1 select-none">{children}</p>
}

function ResolutionLabel({ height, isHD, isAuto = false }) {
    return (
        <Label>
            {height}
            {isAuto ? "" : "p"}
            {isHD && <span className={"text-s-secondary font-bold select-none"}>HD</span>}
        </Label>
    )
}

function SubtitleLabel({ label, isCC = false }) {
    return (
        <Label>
            {label} {isCC && <span className={"text-s-secondary font-semibold select-none"}>[CC]</span>}
        </Label>
    )
}

function SpeedLabel({ label }) {
    return <Label>{label}x</Label>
}

export default VideoPlayer
