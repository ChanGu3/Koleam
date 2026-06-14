// all files created are located relative to this file

const minimist = require("minimist")
const argv = minimist(process.argv.slice(2))
const isDev = argv.dev === true || argv.d === true

const { Logging, errormsg } = require("./server-logging.cjs")
const path = require("path")
const fs = require("fs").promises

const pathDatabase = path.join(__dirname, "data", "database")
const pathUploads = path.join(__dirname, "data", "uploads")
const pathTitles = path.join(pathUploads, "titles")
const pathTemp = path.join(pathUploads, "temp")

const relativePathUpload = path.join("uploads")
const relativePathTitles = path.join(relativePathUpload, "titles")
const relativePathTemp = path.join(relativePathUpload, "temp")

const hrefPathTemp = "/uploads/temp"
const hrefPathTitle = "/uploads/titles"

const COVER_FILENAME = "cover.jpg"
const THUMBNAIL_FILENAME = "thumbnail.jpg"

function getTitlePath(relativePath) {
    return path.join(pathTitles, relativePath)
}

function getUploadPath(relativePath) {
    return path.join(pathUploads, relativePath)
}

function getTempPath(relativePath) {
    return path.join(pathTemp, relativePath)
}

//
// true or false if found
//
async function doesUploadsPathExist(relativePat = "") {
    try {
        const fullPath = path.join(pathUploads, relativePath)
        await fs.access(fullPath)
        return true
    } catch (err) {
        //Logging.LogWarning(`could not find if path ${dirpath} exists in uploads`);
        return false
    }
}

//
// true or false if found
//
async function doesTitlesPathExist(relativePath = "") {
    try {
        const fullPath = path.join(pathTitles, relativePath)
        await fs.access(fullPath)
        return true
    } catch (err) {
        //Logging.LogWarning(`could not find if path ${dirpath} exists in uploads`);
        return false
    }
}

//
// true or false if found
//
async function doesTempFileExist(filename = "") {
    try {
        const fullPath = path.join(pathTemp, filename)
        await fs.access(fullPath)
        return true
    } catch (err) {
        return false
    }
}

//
// dirpath should be a path starting from upload so to make a directory in upload called hello just do "test" nested must be path.join("test","child");
//
async function mkDir(relativePath) {
    try {
        if (!(await doesTitlesPathExist(relativePath))) {
            const fullPath = path.join(pathTitles, relativePath)
            await fs.mkdir(fullPath, { recursive: true })
            return relativePath
        }
    } catch (err) {
        Logging.LogError(`could not make directory for ${relativePath} ${err}`)
        throw new Error(`${err}`)
    }
}

//
// rename a directory
//
async function rnDir(prevRelativePath, relativePath) {
    try {
        if (await doesTitlesPathExist(prevRelativePath)) {
            const oldFullPath = path.join(pathTitles, prevRelativePath)
            const newFullPath = path.join(pathTitles, relativePath)
            await fs.rename(oldFullPath, newFullPath)
            return relativePath
        }
    } catch (err) {
        Logging.LogError(`could not rename directory from ${prevRelativePath} to ${relativePath} ${err}`)
        throw new Error(`${err}`)
    }
}

//
// deletes a directory recursively
//
async function recursiveDirDeleteInTitles(relativePath) {
    try {
        if (!relativePath.includes("..") && relativePath.length !== 0 && (await doesTitlesPathExist(relativePath))) {
            const fullpath = path.join(pathTitles, relativePath)
            await fs.rm(fullpath, { recursive: true, force: true })
        } else {
            Logging.LogError(`could not delete path ${relativePath} in titles --- invalid path or path does not exist`)
        }
    } catch (err) {
        Logging.LogError(`could not delete path ${relativePath} --- ${err}`)
        throw err
    }
}

//
// deletes title file
//
async function deleteTitleFile(relativePath, filename) {
    try {
        if (await doesTitlesPathExist(path.join(relativePath))) {
            const fullPath = path.join(pathTitles, relativePath, filename)
            await fs.rm(fullPath, { force: true })
            return fullPath
        } else {
            return "file does not exist"
        }
    } catch (err) {
        Logging.LogError(`could not delete from relativepath:${relativePath} --- ${err}`)
        throw err
    }
}

//
// deletes temp file
//
async function deleteTempFile(filename) {
    try {
        if (await doesTempFileExist(filename)) {
            const fullPath = path.join(pathTemp, filename)
            await fs.rm(fullPath, { force: true })
            return fullPath
        } else {
            return "file does not exist in temp"
        }
    } catch (err) {
        Logging.LogError(`could not delete ${filename} --- ${err}`)
        throw err
    }
}

//
// uploads title file
//
async function uploadTitleFile(relativePath, filename, buffer) {
    try {
        if (await doesTitlesPathExist(relativePath)) {
            const fullPath = path.join(pathTitles, relativePath, filename)
            await fs.writeFile(fullPath, buffer, { flush: true })
            return fullPath
        }
    } catch (err) {
        Logging.LogError(`could not upload file to relativepath:${relativePath} --- ${err}`)
        throw err
    }
}

//
// uploads temp file
//
async function uploadTempFile(filename, buffer) {
    try {
        if (!(await doesTempFileExist(filename))) {
            const fullPath = path.join(pathTemp, filename)
            await fs.writeFile(fullPath, buffer, { flush: true })
            return fullPath
        }
    } catch (err) {
        Logging.LogError(`could not upload file to relativepath:${relativePath} --- ${err}`)
        throw err
    }
}

//
// uploads Chunck to temp file
//
async function uploadChuckToTempFile(filename, buffer) {
    try {
        await fs.appendFile(fullPath, buffer)
        return fullPath
    } catch (err) {
        Logging.LogError(`could not upload file to relativepath:${relativePath} --- ${err}`)
        throw err
    }
}

// Currently everything needs to be generated before its able to be served
// can change this in the futrue to allow lower res version available while higher res versions are still being generated later though
const ffmpeg = require("fluent-ffmpeg")
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg")
const ffprobeInstaller = require("@ffprobe-installer/ffprobe")

ffmpeg.setFfmpegPath(ffmpegInstaller.path)
ffmpeg.setFfprobePath(ffprobeInstaller.path)

const globalSegmentSeconds = 2
const videoResolutionsHeight = [144, 240, 360, 480, 720, 1080, 1440, 2160]
const videoResolutionsWidth = [256, 432, 640, 854, 1280, 1920, 2560, 3840]
const videoResolutions = videoResolutionsHeight.map((height, index) => `${videoResolutionsWidth[index]}x${height}`)
const videoBandwidths = { 144: 10000, 240: 50000, 360: 150000, 480: 500000, 720: 2000000, 1080: 5000000, 1440: 20000000, 2160: 50000000 }

/**
 * Extracts metadata from a given media file.
 * @param {string} filePath - The path to the video file
 * @returns {Promise<Object>} - Resolves with the ffprobe metadata object
 */
function probeMediaFileInfo(filePath) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) {
                reject(err)
            } else {
                resolve(metadata)
            }
        })
    })
}

function extractRequiredVideoMetadata(videoStream) {
    if (!videoStream) {
        return null
    }

    return {
        width: videoStream.width,
        height: videoStream.height,
        codec_name: videoStream.codec_name,
        bit_rate: videoStream.bit_rate,
        profile: videoStream.profile,
        level: videoStream.level,
        avg_frame_rate: videoStream.avg_frame_rate,
        duration: videoStream.duration,
        pix_fmt: videoStream.pix_fmt,
        color_space: videoStream.color_space,
        start_time: videoStream.start_time,
        display_aspect_ratio: videoStream.display_aspect_ratio,
    }
}

function extractRequiredAudioMetadata(audioStream) {
    if (!audioStream) {
        return null
    }

    return {
        codec_name: audioStream.codec_name,
        profile: audioStream.profile,
        sample_fmt: audioStream.sample_fmt,
        sample_rate: audioStream.sample_rate,
        channels: audioStream.channels,
        channel_layout: audioStream.channel_layout,
        avg_frame_rate: audioStream.avg_frame_rate,
        start_time: audioStream.start_time,
        duration: audioStream.duration,
        bit_rate: audioStream.bit_rate,
        tags: audioStream.tags,
    }
}

function extractRequiredSubtitleMetadata(subtitleStream) {
    if (!subtitleStream) {
        return null
    }

    return {
        codec_name: subtitleStream.codec_name,
        profile: subtitleStream.profile,
        avg_frame_rate: subtitleStream.avg_frame_rate,
        start_time: subtitleStream.start_time,
        bit_rate: subtitleStream.bit_rate,
        tags: subtitleStream.tags,
    }
}

/**
 * Returns the extension without the "."
 */
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

function generateSingleVideo(inputFile, outputPlaylist, videoIndex = 0, videoResolution = 1080, onProgress = (progress) => {}, onComplete = () => {}) {
    return new Promise((resolve, reject) => {
        const outputDir = path.dirname(outputPlaylist)
        const segmentFilename = path.join(outputDir, `segment_video_${videoResolution}_%06d.ts`).replace(/\\/g, "/")
        const videoBandwidth = videoBandwidths[videoResolution]

        probeMediaFileInfo(inputFile)
            .then((metadata) => {
                ffmpeg(inputFile)
                    .outputOptions([
                        "-map",
                        `0:v:${videoIndex}`,
                        "-an",
                        "-sn",
                        "-hls_time",
                        `${globalSegmentSeconds}`,
                        "-hls_list_size",
                        "0",
                        "-hls_segment_filename",
                        segmentFilename,
                        "-maxrate",
                        `${videoBandwidth}`,
                        "-bufsize",
                        `${videoBandwidth * 2}`,
                        "-b:v",
                        `${videoBandwidth}`,
                    ])
                    .videoFilters(`scale=-2:${videoResolution}`)
                    .videoCodec("libx264")
                    .format("hls")
                    .on("progress", (progress) => onProgress(progress))
                    .on("end", () => {
                        onComplete()
                        resolve(extractRequiredVideoMetadata(metadata.streams.filter((s) => s.codec_type === "video")[videoIndex]))
                    })
                    .on("error", (err) => reject(err))
                    .save(outputPlaylist)
            })
            .catch((err) => {
                reject(err)
            })
    })
}

async function generateAllResFromCap(inputFile, relativePath, onProgress = (progress) => {}, onComplete = () => {}) {
    const metadata = await probeMediaFileInfo(inputFile)
    const streamVideoData = metadata.streams.filter((s) => s.codec_type === "video")[0]
    if (!streamVideoData || !streamVideoData.height) {
        throw new Error(`could not process video data | video not found at index 0`)
    }

    let indexRes = videoResolutionsHeight.findIndex((res) => res === streamVideoData.height)
    if (!videoResolutionsHeight.includes(streamVideoData.height)) {
        indexRes = videoResolutionsHeight.findIndex((res) => res > streamVideoData.height)
    }

    if (indexRes < 0) {
        throw new Error(`video resolution ${streamVideoData.height} is too low to be processed`)
    }

    const videosToGenerateCount = indexRes + 1

    let videoResCompleted = 0

    for (let i = indexRes; i >= 0; i--) {
        function onSingleVideoProgress(progress) {
            const indexOverallProgress = progress.percent / videosToGenerateCount
            const indexPreviousOverallProgress = ((indexRes - i) * 100) / videosToGenerateCount
            const overallProgress = indexOverallProgress + indexPreviousOverallProgress
            onProgress(overallProgress)
        }
        const pathVideoPlaylistDirRelativeComplete = path.join(relativePath, "video", `${videoResolutionsHeight[i]}`)
        const pathVideoPlaylistDir = path.join(pathTitles, pathVideoPlaylistDirRelativeComplete)
        try {
            if (await doesTitlesPathExist(pathVideoPlaylistDirRelativeComplete)) {
                await recursiveDirDeleteInTitles(pathVideoPlaylistDirRelativeComplete)
            }
            await mkDir(pathVideoPlaylistDirRelativeComplete)
            await generateSingleVideo(inputFile, path.join(pathVideoPlaylistDir, "video_playlist.m3u8"), 0, videoResolutionsHeight[i], onSingleVideoProgress, () => {
                videoResCompleted++
                if (videoResCompleted === videosToGenerateCount) {
                    onComplete()
                }
            })
        } catch (err) {
            Logging.LogError(`could not generate video at resolution ${videoResolutionsHeight[i]} --- ${err}`)
            throw new Error(`${err}`)
        }
    }
    return extractRequiredVideoMetadata(streamVideoData)
}

async function deleteAllRes(relativePath) {
    const videoRelativePath = path.join(relativePath, "video")

    if (await doesTitlesPathExist(videoRelativePath)) {
        await recursiveDirDeleteInTitles(videoRelativePath)
    }
}

// generate aac only for now since its the most widely supported audio codec for hls, support more later
function generateSingleAudio(inputFile, outputPlaylist, streamIndex = 0, onProgress = (progress) => {}, onComplete = () => {}) {
    return new Promise((resolve, reject) => {
        const outputDir = path.dirname(outputPlaylist)
        const segmentFilename = path.join(outputDir, `segment_audio_${streamIndex}_%06d.ts`).replace(/\\/g, "/")

        probeMediaFileInfo(inputFile)
            .then((metadata) => {
                ffmpeg(inputFile)
                    .outputOptions(["-map", `0:a:${streamIndex}`, "-vn", "-sn", "-hls_time", "2", "-hls_list_size", "0", "-hls_segment_filename", segmentFilename])
                    .audioCodec("aac")
                    .format("hls")
                    .on("progress", (progress) => onProgress(progress))
                    .on("end", () => {
                        onComplete()
                        resolve(extractRequiredAudioMetadata(metadata.streams.filter((s) => s.codec_type === "audio")[streamIndex]))
                    })
                    .on("error", (err) => reject(err))
                    .save(outputPlaylist)
            })
            .catch((err) => {
                reject(err)
            })
    })
}

async function generateAudio(inputFile, relativePath, streamIndex, audioName, onProgress = (progress) => {}, onComplete = () => {}) {
    const relativePathDirComplete = path.join(relativePath, "audio", audioName)
    if (await doesTitlesPathExist(relativePathDirComplete)) {
        await recursiveDirDeleteInTitles(relativePathDirComplete)
    }

    const pathAudioPlaylistDir = path.join(pathTitles, relativePathDirComplete)
    await mkDir(relativePathDirComplete)
    return await generateSingleAudio(inputFile, path.join(pathAudioPlaylistDir, "audio_playlist.m3u8"), streamIndex, onProgress, onComplete)
}

async function deleteAudio(relativePath, audioName) {
    const audioRelativePath = path.join(relativePath, "audio", audioName)
    if (await doesTitlesPathExist(audioRelativePath)) {
        await recursiveDirDeleteInTitles(audioRelativePath)
    }
}

async function renameAudio(relativePath, previousAudioName, audioName) {
    if (await doesTitlesPathExist(path.join(relativePath, "audio", previousAudioName))) {
        const oldAudioRelativePath = path.join(relativePath, "audio", previousAudioName)
        const newAudioRelativePath = path.join(relativePath, "audio", audioName)
        await rnDir(oldAudioRelativePath, newAudioRelativePath)
    }
}

function generateSingleSubtitle(inputFile, outputFolder, subName, streamIndex = 0, onProgress = (progress) => {}, onComplete = () => {}) {
    return new Promise((resolve, reject) => {
        probeMediaFileInfo(inputFile)
            .then((metadata) => {
                const subtitleMetaData = metadata.streams.filter((s) => s.codec_type === "subtitle")[streamIndex]
                const nativeExt = getExtensionFromSubtitleCodec(subtitleMetaData.codec_name)

                const webvttPath = path.join(outputFolder, `${subName}.vtt`)
                const nativePath = path.join(outputFolder, `${subName}.${nativeExt}`)

                let command = ffmpeg(inputFile)
                    // Output 1: Always extract a WebVTT fallback for the HLS player
                    .output(webvttPath)
                    .outputOptions(["-map", `0:s:${streamIndex}`, "-f", "webvtt"])

                // Output 2: If the native format isn't WebVTT, extract it untouched!
                if (nativeExt !== ".vtt") {
                    command = command.output(nativePath).outputOptions(["-map", `0:s:${streamIndex}`, "-c:s", "copy"])
                }

                command
                    .on("progress", (progress) => {
                        onProgress(progress)
                    })
                    .on("end", () => {
                        onComplete()
                        resolve(extractRequiredSubtitleMetadata(subtitleMetaData))
                    })
                    .on("error", (err) => reject(err))
                    .run() // Use .run() instead of .save() because we have multiple outputs
            })
            .catch((err) => {
                reject(err)
            })
    })
}

async function generateSubtitle(inputFile, relativePath, streamIndex, subName, onProgress = (progress) => {}, onComplete = () => {}) {
    const relativePathDirComplete = path.join(relativePath, "subs")
    const relativePlaylistComplete = path.join(relativePathDirComplete, `${subName}.m3u8`)

    if (await doesTitlesPathExist(relativePlaylistComplete)) {
        await recursiveDirDeleteInTitles(relativePlaylistComplete)
    }

    await mkDir(relativePathDirComplete)
    const pathSubDir = path.join(pathTitles, relativePathDirComplete)
    const webvttPath = path.join(pathSubDir, `${subName}.vtt`)
    const metadataSubtitle = await generateSingleSubtitle(inputFile, pathSubDir, subName, streamIndex, onProgress, onComplete)

    let exactDuration = 86400

    // Read the file that FFmpeg is currently writing to
    let hasAccess = false
    try {
        await fs.access(webvttPath)
        hasAccess = true
    } catch (err) {}

    if (hasAccess) {
        const fileContent = await fs.readFile(webvttPath, "utf-8")

        const timestampRegex = /(?:(\d{2}):)?(\d{2}):(\d{2})(?:\.(\d{3}))?/g
        const allMatches = Array.from(fileContent.matchAll(timestampRegex))

        if (allMatches && allMatches.length > 0) {
            const lastTimestamp = allMatches[allMatches.length - 1]

            const hours = parseInt(lastTimestamp[1] ? lastTimestamp[1] : 0, 10) * 3600
            const minutes = parseInt(lastTimestamp[2] ? lastTimestamp[2] : 0, 10) * 60
            const seconds = parseInt(lastTimestamp[3] ? lastTimestamp[3] : 0, 10)
            const ms = parseInt(lastTimestamp[4] ? lastTimestamp[4] : 0, 10) / 1000

            exactDuration = hours + minutes + seconds + ms
        }
    }

    const duration = exactDuration ? Math.ceil(exactDuration) : 86400
    const encodedSubName = encodeURIComponent(`${subName}.vtt`) // Force HLS Playlist to use the WebVTT file
    const m3u8Content = `#EXTM3U\n#EXT-X-TARGETDURATION:${Math.ceil(duration)}\n#EXT-X-VERSION:3\n#EXT-X-PLAYLIST-TYPE:VOD\n#EXTINF:${duration},\n${encodedSubName}\n#EXT-X-ENDLIST\n`

    await fs.writeFile(path.join(pathSubDir, `${subName}.m3u8`), m3u8Content, { encoding: "utf-8", flag: "w" })

    return metadataSubtitle
}

async function deleteSubtitle(relativePath, subName, codecName) {
    const extension = getExtensionFromSubtitleCodec(codecName)

    // Delete Native File
    const nativeRelativePath = path.join(relativePath, "subs", `${subName}.${extension}`)
    if (await doesTitlesPathExist(nativeRelativePath)) {
        await recursiveDirDeleteInTitles(nativeRelativePath)
    }
    // Delete WebVTT File
    const vttRelativePath = path.join(relativePath, "subs", `${subName}.vtt`)
    if (await doesTitlesPathExist(vttRelativePath)) {
        await recursiveDirDeleteInTitles(vttRelativePath)
    }
    const subPlaylistPath = path.join(relativePath, "subs", `${subName}.m3u8`)
    if (await doesTitlesPathExist(subPlaylistPath)) {
        await recursiveDirDeleteInTitles(subPlaylistPath)
    }
}

async function renameSubtitle(relativePath, previousSubName, subName, codecName) {
    const extension = getExtensionFromSubtitleCodec(codecName)

    // Rename Native File
    const oldNativeRelativePath = path.join(relativePath, "subs", `${previousSubName}.${extension}`)
    if (await doesTitlesPathExist(oldNativeRelativePath)) {
        const newNativeRelativePath = path.join(relativePath, "subs", `${subName}.${extension}`)
        await rnDir(oldNativeRelativePath, newNativeRelativePath)
    }
    // Rename WebVTT File
    const oldVttRelativePath = path.join(relativePath, "subs", `${previousSubName}.vtt`)
    if (await doesTitlesPathExist(oldVttRelativePath)) {
        const newVttRelativePath = path.join(relativePath, "subs", `${subName}.vtt`)
        await rnDir(oldVttRelativePath, newVttRelativePath)
    }
    const oldSubPlaylistPath = path.join(relativePath, "subs", `${previousSubName}.m3u8`)
    if (await doesTitlesPathExist(oldSubPlaylistPath)) {
        const newSubPlaylistPath = path.join(relativePath, "subs", `${subName}.m3u8`)
        await rnDir(oldSubPlaylistPath, newSubPlaylistPath)
    }
}

async function generateMasterPlaylist(videoStreams, audioStreams, subStreams, relativePath) {
    let m3u8Content = `#EXTM3U\n#EXT-X-VERSION:3\n\n`

    // Subtitles
    m3u8Content += `# Subtitles\n`
    subStreams.forEach((sub) => {
        m3u8Content += `#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",LANGUAGE="${sub.lang}",NAME="${sub.name}",DEFAULT=${sub.default ? "YES" : "NO"},AUTOSELECT=YES,URI="${sub.uri}"\n`
    })
    m3u8Content += `\n`

    // Audio
    m3u8Content += `# Audio\n`
    audioStreams.forEach((audio) => {
        m3u8Content += `#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio",LANGUAGE="${audio.lang}",NAME="${audio.name}",DEFAULT=${audio.default ? "YES" : "NO"},URI="${audio.uri}"\n`
    })
    m3u8Content += `\n`

    // Video
    m3u8Content += `# Video\n`
    videoStreams.forEach((video) => {
        m3u8Content += `#EXT-X-STREAM-INF:BANDWIDTH=${video.bandwidth},RESOLUTION=${video.resolution},AUDIO="audio",SUBTITLES="subs"\n${video.uri}\n`
    })

    await fs.writeFile(path.join(pathTitles, relativePath, "master.m3u8"), m3u8Content, { flush: true, encoding: "utf-8", flag: "w" })
}

const uploads = {
    pathDatabase,
    mkDir,
    rnDir,
    relativePathTitles,
    doesTitlesPathExist,
    doesUploadsPathExist,
    recursiveDirDeleteInTitles,
    getUploadPath,
    getTitlePath,
    deleteTitleFile,
    uploadTitleFile,
    hrefPathTitle,
    COVER_FILENAME,
    THUMBNAIL_FILENAME,
    temp: {
        relativePathTemp,
        getTempPath,
        hrefPathTemp,
        doesTempFileExist,
        deleteTempFile,
        uploadTempFile,
        uploadChuckToTempFile,
    },
    media: {
        videoResolutionsHeight,
        videoResolutionsWidth,
        videoResolutions,
        videoBandwidths,
        generateAllResFromCap,
        deleteAllRes,
        generateAudio,
        deleteAudio,
        renameAudio,
        generateSubtitle,
        deleteSubtitle,
        renameSubtitle,
        generateMasterPlaylist,
        probeMediaFileInfo,
        getExtensionFromSubtitleCodec,
        extractRequiredVideoMetadata,
        extractRequiredAudioMetadata,
        extractRequiredSubtitleMetadata,
    },
}

module.exports.uploads = uploads

if (isDev) {
    const pathDevImages = path.join(__dirname, "dev", "images")

    //
    // Clears the Title Folder in Uploads leaving it empty
    //
    async function clearEntireTitlesFolder() {
        try {
            // safety check to make sure . is not used to delete files outside of the title folder
            if (!pathTitles.includes(".")) {
                if (await doesTitlesPathExist()) {
                    await fs.rm(pathTitles, { recursive: true, force: true })
                    Logging.LogDev(`title folder successfully cleared`)
                }
                await fs.mkdir(pathTitles, { recursive: true })
                Logging.LogDev(`title folder successfully created`)
            } else {
                Logging.LogDev(`could not clear title folder`)
            }
        } catch (err) {
            Logging.LogDev(`could not clear title folder --- ${err}`)
        }
    }

    //
    // ONLY COPIES FROM A SPECIFIC FOLDER IN DEV
    //
    async function copyImageFileToTitlePath(existingFileName, relativePath) {
        try {
            await fs.copyFile(path.join(pathDevImages, existingFileName), path.join(pathTitles, relativePath))
        } catch (err) {
            Logging.LogError(`could not copy file to title path:${relativePath} | ${err}`)
        }
    }

    const uploadsDev = {
        clearEntireTitlesFolder,
        copyImageFileToTitlePath,
    }

    module.exports.uploadsDev = uploadsDev
}
