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

function validateFileExtension(fileName = "", allowedExtensions = []) {
    const fileExtension = fileName.split(".").pop().toLowerCase()
    return allowedExtensions.includes(fileExtension)
}

const valid_video_extensions = ["mp4", "webm", "mkv"]
const valid_audio_extensions = ["mp3", "wav", "m4a", "mka"]
const valid_subtitle_extensions = ["srt", "vtt", "ass", "sub", "ssa"]

const FILE_TYPES = Object.freeze({
    VIDEO: "video",
    AUDIO: "audio",
    SUBTITLE: "subtitle",
})

if (typeof module !== "undefined" && module.exports) {
    module.exports = { getExtensionFromSubtitleCodec, validateFileExtension, FILE_TYPES, valid_video_extensions, valid_audio_extensions, valid_subtitle_extensions }
}

export { getExtensionFromSubtitleCodec, validateFileExtension, FILE_TYPES, valid_video_extensions, valid_audio_extensions, valid_subtitle_extensions }
