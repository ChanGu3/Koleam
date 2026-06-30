const path = require("path")
const { uploads } = require("../server-uploads.cjs")
const db = require("../models/database.cjs")

async function GetTitleUploads(req, res) {
    const { filename } = req.params

    if (filename === uploads.COVER_FILENAME) {
        GetTitleCover(req, res)
        return
    }

    res.status(400).json({ error: "Invalid filename" })
}

async function GetTitleCover(req, res) {
    const { titleID } = req.params
    const relativePath = path.join(titleID, uploads.COVER_FILENAME)
    const filePath = uploads.getTitlePath(relativePath)

    try {
        if (!(await uploads.doesTitlesPathExist(relativePath))) {
            res.status(404).end()
        }
        res.status(200).sendFile(filePath)
    } catch (err) {
        res.status(400).end()
    }
}

async function GetStreamUploads(req, res) {
    let { streamID, filename } = req.params

    if (Array.isArray(filename)) {
        filename = filename.join("/")
    }

    if (filename === uploads.THUMBNAIL_FILENAME) {
        GetTitleInstallmentStreamThumbnail(req, res)
        return
    }

    if (!req.session.admin && !req.session.member) {
        res.status(401).json({ error: "Unauthorized" })
        return
    }

    // Allow video player requests for HLS streaming files to pass through
    const ext = path.extname(filename).toLowerCase()
    const extendedSubtitleExt = [".srt", ".ass", ".ssa", ".sub"]
    const allowedHlsExtensions = [".m3u8", ".ts", ".m4s", ".mp4", ".vtt"].concat(extendedSubtitleExt) // mp4 & m4s are not used typically right now since they arent rendered this way

    if (allowedHlsExtensions.includes(ext)) {
        try {
            const streamData = await db.models.TitleInstallmentStream.GetByID(streamID)
            let relativePath = path.join(streamData.titleID, streamData.installmentID, streamData.label)

            relativePath = path.join(relativePath, filename)

            const filePath = uploads.getTitlePath(relativePath)

            if (!(await uploads.doesTitlesPathExist(relativePath))) {
                return res.status(404).end()
            }

            // Set specific headers for Apple HLS and MPEG transport streams
            if (ext === ".m3u8") res.setHeader("Content-Type", "application/vnd.apple.mpegurl")
            if (ext === ".ts") res.setHeader("Content-Type", "video/MP2T")
            if (ext === ".vtt") res.setHeader("Content-Type", "text/vtt")
            if (ext === ".srt") res.setHeader("Content-Type", "application/x-subrip")
            if (ext === ".ass" || ext === ".ssa") res.setHeader("Content-Type", "text/plain")

            return res.status(200).sendFile(filePath)
        } catch (err) {
            return res.status(404).end()
        }
    }

    res.status(400).json({ error: "Invalid filename" })
}

async function GetTitleInstallmentStreamThumbnail(req, res) {
    //title, series/movie, episode/movie
    const { streamID } = req.params
    try {
        const streamData = await db.models.TitleInstallmentStream.GetByID(streamID)
        const relativePath = path.join(streamData.titleID, streamData.installmentID, streamData.label, uploads.THUMBNAIL_FILENAME)
        const filePath = uploads.getTitlePath(relativePath)

        if (!(await uploads.doesTitlesPathExist(relativePath))) {
            res.status(404).end()
        }
        res.status(200).sendFile(filePath)
    } catch (err) {
        res.status(404).end()
    }
}

async function UploadChunkToTempFile(req, res) {
    const { tempfileID, chunkNum } = req.body.chunkData ? JSON.parse(req.body.chunkData) : {}
    const { originalFilename, fileSize, bufferSizeHandshake } = req.body.fileData ? JSON.parse(req.body.fileData) : {}
    let tempChunk = null
    if (req.files["tempChunk"] && req.files["tempChunk"][0]) {
        tempChunk = req.files["tempChunk"][0]
    }
    try {
        // create a new file for this upload not a new tempfileID
        if (tempfileID == null || tempfileID == undefined) {
            const instance = await db.models.TempUpload.AddToDB(originalFilename, fileSize, bufferSizeHandshake)
            const instanceJSON = instance.toJSON()
            res.status(200).json({ message: "upload transaction successfully started", data: { ...instanceJSON } })

            return
        } else {
            if (tempChunk == null || tempChunk == undefined) {
                res.status(400).json({ error: "No chunk was recieved" })

                return
            }

            const instance = await db.models.TempUpload.ApplyChunkToDB(tempfileID, tempChunk.buffer)
            res.status(200).json({
                message: `chunk ${chunkNum} successfully uploaded`,
                data: { ...instance, percentDownloaded: (instance.fileSizeDownloaded / instance.fileSize) * 100 },
            })
            return
        }
    } catch (err) {
        res.status(400).json({ error: err.message })
        console.error(err)
        return
    }
}

async function DeleteTempFile(req, res) {
    const { tempfileID } = req.body

    try {
        await db.models.TempUpload.RemoveByID(tempfileID)
        res.status(200).json({ message: "temp file successfully deleted" })
        return
    } catch (err) {
        res.status(400).json({ error: err.message })
        return
    }
}

const UploadsController = {
    GetTitleUploads,
    GetStreamUploads,
    UploadChunkToTempFile,
    DeleteTempFile,
}

module.exports = UploadsController
