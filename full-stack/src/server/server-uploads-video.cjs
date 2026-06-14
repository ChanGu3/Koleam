const path = require("path")
const { uploads } = require("./server-uploads.cjs")

async function writeVideo(inputPath, titleID, installmentID, streamTitle, onProgress, onComplete) {
    return await uploads.media.generateAllResFromCap(inputPath, path.join(titleID, installmentID, streamTitle), onProgress, onComplete)
}

async function deleteVideo(titleID, installmentID, streamTitle) {
    return await uploads.media.deleteAllRes(path.join(titleID, installmentID, streamTitle))
}

/**
 * this has nothing to do with the video written on disk using writeVideo
 */
async function getFileVideoDetails(inputPath) {
    const metadata = await uploads.media.probeMediaFileInfo(inputPath)
    const videoMetaData = metadata.streams.filter((s) => s.codec_type === "video")[0]
    return uploads.media.extractRequiredVideoMetadata(videoMetaData)
}

async function writeAudio(inputPath, titleID, installmentID, streamTitle, audioName, streamIndex, onProgress, onComplete) {
    return await uploads.media.generateAudio(inputPath, path.join(titleID, installmentID, streamTitle), streamIndex, audioName, onProgress, onComplete)
}

async function deleteAudio(titleID, installmentID, streamTitle, audioName) {
    return await uploads.media.deleteAudio(path.join(titleID, installmentID, streamTitle), audioName)
}

async function renameAudio(titleID, installmentID, streamTitle, previousAudioName, audioName) {
    return await uploads.media.renameAudio(path.join(titleID, installmentID, streamTitle), previousAudioName, audioName)
}

/**
 * this has nothing to do with the audio(s) written on disk using writeAudio
 */
async function getFileAudioDetails(inputPath, streamIndex) {
    const metadata = await uploads.media.probeMediaFileInfo(inputPath)
    const audioMetaData = metadata.streams.filter((s) => s.codec_type === "audio")[streamIndex]
    return uploads.media.extractRequiredAudioMetadata(audioMetaData)
}

async function writeSubtitle(inputPath, titleID, installmentID, streamTitle, subName, streamIndex, onProgress, onComplete) {
    return await uploads.media.generateSubtitle(inputPath, path.join(titleID, installmentID, streamTitle), streamIndex, subName, onProgress, onComplete)
}

async function deleteSubtitle(titleID, installmentID, streamTitle, subName, codecName) {
    return await uploads.media.deleteSubtitle(path.join(titleID, installmentID, streamTitle), subName, codecName)
}

async function renameSubtitle(titleID, installmentID, streamTitle, previousSubName, subName, codecName) {
    return await uploads.media.renameSubtitle(path.join(titleID, installmentID, streamTitle), previousSubName, subName, codecName)
}

/**
 * this has nothing to do with the subtitle(s) written on disk using writeSubtitle
 */
async function getFileSubtitleDetails(inputPath, streamIndex) {
    const metadata = await uploads.media.probeMediaFileInfo(inputPath)
    const subtitleMetaData = metadata.streams.filter((s) => s.codec_type === "subtitle")[streamIndex]
    return uploads.media.extractRequiredSubtitleMetadata(subtitleMetaData)
}
function writeMasterPlaylist(videoStreams, audioStreams, subStreams, titleId, installmentID, streamTitle) {
    return uploads.media.generateMasterPlaylist(videoStreams, audioStreams, subStreams, path.join(titleId, installmentID, streamTitle))
}

const uploads_video = {
    writeVideo,
    deleteVideo,
    getFileVideoDetails,
    writeAudio,
    deleteAudio,
    renameAudio,
    getFileAudioDetails,
    writeSubtitle,
    deleteSubtitle,
    renameSubtitle,
    getFileSubtitleDetails,
    writeMasterPlaylist,
}

module.exports.uploads_video = uploads_video
