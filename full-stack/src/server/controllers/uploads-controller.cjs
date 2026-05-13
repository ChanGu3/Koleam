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
    const { filename } = req.params

    if (filename === uploads.THUMBNAIL_FILENAME) {
        GetTitleInstallmentStreamThumbnail(req, res)
        return
    }

    res.status(400).json({ error: "Invalid filename" })
}

async function GetTitleInstallmentStreamThumbnail(req, res) {
    //title, series/movie, episode/movie
    const { streamID } = req.params
    const streamData = await db.models.TitleInstallmentStream.GetByID(streamID)
    const relativePath = path.join(streamData.titleID, streamData.installmentID, streamID, uploads.THUMBNAIL_FILENAME)
    const filePath = uploads.getTitlePath(relativePath)

    try {
        if (!(await uploads.doesTitlesPathExist(relativePath))) {
            res.status(404).end()
        }
        res.status(200).sendFile(filePath)
    } catch (err) {
        res.status(404).end()
    }
}

const UploadsController = {
    GetTitleUploads,
    GetStreamUploads,
}

module.exports = UploadsController
