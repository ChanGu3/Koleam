const db = require("../../../models/database.cjs")
const { uploads_image } = require("../../../server-uploads-image.cjs")
const { uploads } = require("../../../server-uploads.cjs")
const events = require("../../../server-events.cjs")
const { Logging } = require("../../../server-logging.cjs")

async function GetAllTitles(req, res) {
    const query = {}

    const { limit, offset, getNewestReleases, isAZ, genres, search, shuffle } = req.query
    if (getNewestReleases === "true") {
        query.getNewestReleases = true
    }
    if (limit && !Number.isNaN(Number(limit))) {
        query.limit = Number(limit)
    }
    query.offset = offset && !Number.isNaN(Number(offset)) ? Number(offset) : 0
    if (isAZ === "true") {
        query.isAZ = true
    }
    let genresList = null
    if (genres !== "null" && genres !== "undefined" && genres) {
        genresList = genres.split(",")
    }
    if (search) {
        query.search = search
    }
    if (shuffle === "true") {
        query.shuffle = true
    }
    try {
        const titles = await db.models.Title.GetAll({
            getNewestReleases: query.getNewestReleases,
            limit: query.limit,
            isAZ: query.isAZ,
            search: query.search,
            offset: query.offset,
            shuffle: query.shuffle,
            genereFilter: genresList,
        })

        res.status(200).json(titles)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

async function GetSingleTitle(req, res) {
    const { titleID } = req.params
    try {
        const title = await db.models.Title.GetByID(titleID)
        res.status(200).json(title)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

async function GetAllGenres(req, res) {
    const query = {}
    if (req.query.limit) {
        if ((req.query.limit.toLowerCase && req.query.limit.toLowerCase() === "inf") || req.query.limit.toLowerCase() === "infinity") {
            query.limit = Infinity
        } else if (!Number.isNaN(Number(req.query.limit))) {
            query.limit = Number(req.query.limit)
        }
    }
    if (req.query.offset && !Number.isNaN(Number(req.query.offset))) {
        query.offset = Number(req.query.offset)
    }
    try {
        const genres = await db.models.Genre.GetAll(query)

        res.status(200).json(genres)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

async function GetTitleInstallmentStreamLikes(req, res) {
    const { streamID } = req.params

    try {
        const streamLikes = await db.models.TitleInstallmentStreamLike.GetAllByStreamID(streamID)
        res.status(200).json(streamLikes)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

async function GetSingleGenre(req, res) {
    const { genreName } = req.params
    try {
        const genre = await db.models.Genre.GetByGenre(genreName)
        res.status(200).json(genre)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

async function GetAllInstallments(req, res) {
    const { titleID } = req.query
    const query = {}
    query.titleID = titleID ? titleID : false

    try {
        const titleInstallments = await db.models.TitleInstallment.GetAll(query)
        res.status(200).json(titleInstallments)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

async function GetSingleInstallment(req, res) {
    const query = {}

    const { installmentID } = req.params
    try {
        const titleInstallment = await db.models.TitleInstallment.GetByID(installmentID)

        res.status(200).json(titleInstallment)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

async function GetAllTitleInstallmentStream(req, res) {
    const { installmentID, isReleaseDateDesc, isStreamNumberDesc } = req.query
    const query = {}
    isReleaseDateDescValue = isReleaseDateDesc ? isReleaseDateDesc : false
    isStreamNumberDescValue = isStreamNumberDesc ? isStreamNumberDesc : false

    try {
        const streams = await db.models.TitleInstallmentStream.GetAll(query, installmentID, isReleaseDateDescValue, isStreamNumberDescValue)
        res.status(200).json(streams)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

async function GetSingleTitleInstallmentStream(req, res) {
    const { streamID } = req.params
    try {
        const titleStream = await db.models.TitleInstallmentStream.GetByID(streamID, true)
        res.status(200).json(titleStream)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

async function AddTitle(req, res) {
    let uploadedTitleCover = false
    let transaction
    try {
        transaction = await db.sequelize.transaction()

        const titleData = JSON.parse(req.body.titleData)
        const titleCover = req.files["titleCover"][0]

        if (!titleData || !titleCover) {
            res.status(400).json({ error: "missing data within request" })
            return
        }

        const title = await db.models.Title.AddToDB(
            titleData.label,
            titleData.description,
            titleData.copyright,
            titleData.originalTranslation,
            titleData.filmSuitability,
            titleData.filmAgeMin,
            transaction
        )

        for (const genre of titleData.genres) {
            await db.models.TitleGenre.AddToDB(title.id, genre, transaction)
        }

        for (const otherTranslation of titleData.otherTranslations) {
            await db.models.TitleOtherTranslation.AddToDB(title.id, otherTranslation, transaction)
        }

        for (const contentAdvisory of titleData.contentAdvisories) {
            await db.models.TitleContentAdvisory.AddToDB(title.id, contentAdvisory, transaction)
        }

        await uploads_image.uploadTitleCover(title.id, titleCover.buffer)
        uploadedTitleCover = true

        transaction.commit()

        res.status(200).json({ success: "successfully added title" })
    } catch (err) {
        res.status(400).json({ error: "failed to add title" })
        if (uploadedTitleCover) {
            await uploads_image.deleteTitleCover(title.id)
        }
        if (transaction) transaction.rollback()
    }
}

async function UpdateTitle(req, res) {
    let uploadedTitleCover = false
    let transaction
    try {
        const { titleID } = req.params

        transaction = await db.sequelize.transaction()

        const titleData = JSON.parse(req.body.titleData)
        let titleCover = null
        if (req.files["titleCover"] && req.files["titleCover"][0]) {
            titleCover = req.files["titleCover"][0]
        }

        const title = await db.models.Title.UpdateInDB(
            titleID,
            {
                label: titleData.label,
                description: titleData.description,
                copyright: titleData.copyright,
                originalTranslation: titleData.originalTranslation,
                filmSuitability: titleData.filmSuitability,
                filmAgeMin: titleData.filmAgeMin,
            },
            transaction
        )

        for (const genre of titleData.listData.delete.genres) {
            if (await db.models.TitleGenre.Exists(titleID, genre, transaction)) {
                await db.models.TitleGenre.RemoveByTitleIDAndGenreFromDB(titleID, genre, transaction)
            }
        }

        for (const genre of titleData.listData.add.genres) {
            if (!(await db.models.TitleGenre.Exists(titleID, genre, transaction))) {
                await db.models.TitleGenre.AddToDB(titleID, genre, transaction)
            }
        }

        for (const otherTranslation of titleData.listData.delete.otherTranslations) {
            if (await db.models.TitleOtherTranslation.Exists(titleID, otherTranslation, transaction)) {
                await db.models.TitleOtherTranslation.RemoveByTitleIDAndTranslationFromDB(titleID, otherTranslation, transaction)
            }
        }

        for (const otherTranslation of titleData.listData.add.otherTranslations) {
            if (!(await db.models.TitleOtherTranslation.Exists(titleID, otherTranslation, transaction))) {
                await db.models.TitleOtherTranslation.AddToDB(titleID, otherTranslation, transaction)
            }
        }

        for (const contentAdvisory of titleData.listData.delete.contentAdvisories) {
            if (await db.models.TitleContentAdvisory.Exists(titleID, contentAdvisory, transaction)) {
                await db.models.TitleContentAdvisory.RemoveByTitleIDAndContentAdvisoryFromDB(titleID, contentAdvisory, transaction)
            }
        }

        for (const contentAdvisory of titleData.listData.add.contentAdvisories) {
            if (!(await db.models.TitleContentAdvisory.Exists(titleID, contentAdvisory, transaction))) {
                await db.models.TitleContentAdvisory.AddToDB(titleID, contentAdvisory, transaction)
            }
        }

        if (titleCover) {
            await uploads_image.uploadTitleCover(titleID, titleCover.buffer)
        }
        uploadedTitleCover = true

        transaction.commit()

        res.status(200).json({ success: "successfully updated title" })
    } catch (err) {
        res.status(400).json({ error: "failed to update title" })
        if (uploadedTitleCover) {
            await uploads_image.deleteTitleCover(title.id)
        }
        if (transaction) transaction.rollback()
    }
}

async function DeleteTitle(req, res) {
    try {
        const { titleID } = req.params

        await db.models.Title.RemoveFromDB(titleID)

        res.status(200).json({ success: "successfully removed title and its contents" })
    } catch (err) {
        res.status(400).json({ error: "failed to remove title and it contents" })
    }
}

async function AddInstallment(req, res) {
    try {
        const { isSeason, label, titleID } = req.body

        if (isSeason === null || !label || !titleID) {
            res.status(400).json({ error: "missing required data within request" })
            return
        }

        const installment = await db.models.TitleInstallment.AddToDB(titleID, label, isSeason)

        res.status(200).json({ success: "successfully added installment" })
    } catch (err) {
        res.status(400).json({ error: "failed to add installment" })
    }
}

async function UpdateInstallment(req, res) {
    let t
    try {
        const { installmentID } = req.params
        const { isSeason, label, installmentNumber } = req.body

        t = await db.sequelize.transaction()
        const installment = await db.models.TitleInstallment.UpdateInDB(
            installmentID,
            {
                label: label,
                installmentNumber: installmentNumber,
                isSeason: isSeason,
            },
            t
        )

        if (t) t.commit()

        res.status(200).json({ success: "successfully updated installment" })
    } catch (err) {
        res.status(400).json({ error: "failed to update installment" })
        if (t) t.rollback()
    }
}

async function DeleteInstallment(req, res) {
    try {
        const { installmentID } = req.params

        const installment = await db.models.TitleInstallment.RemoveFromDB(installmentID)

        res.status(200).json({ success: "successfully removed installment" })
    } catch (err) {
        res.status(400).json({ error: "failed to remove installment" })
    }
}

async function AddStream(req, res) {
    try {
        const streamData = JSON.parse(req.body.streamData)
        const streamThumbnail = req.files["streamThumbnail"][0]

        if (!streamData || !streamThumbnail) {
            res.status(400).json({ error: "missing data within request" })
            return
        }

        const stream = await db.models.TitleInstallmentStream.AddToDB(
            streamData.titleID,
            streamData.installmentID,
            streamData.label,
            streamData.streamNumber,
            streamData.synopsis,
            streamData.releaseDate
        )

        await uploads_image.uploadTitleInstallmentStreamThumbnail(stream.titleID, stream.installmentID, stream.label, streamThumbnail.buffer)

        res.status(200).json({ success: "successfully added stream" })
    } catch (err) {
        res.status(400).json({ error: "failed to add stream" })
    }
}

async function UpdateStream(req, res) {
    let t
    try {
        const { streamID } = req.params
        const streamData = JSON.parse(req.body.streamData)
        let streamThumbnail = null
        if (req.files["streamThumbnail"] && req.files["streamThumbnail"][0]) {
            streamThumbnail = req.files["streamThumbnail"][0]
        }

        if (!streamID) {
            res.status(400).json({ error: "missing data within request" })
            return
        }

        t = await db.sequelize.transaction()
        const stream = await db.models.TitleInstallmentStream.UpdateInDB(
            streamID,
            {
                label: streamData.label,
                synopsis: streamData.synopsis,
                releaseDate: streamData.releaseDate,
                /*streamNumber: streamData.streamNumber,*/
            },
            t
        )

        if (streamThumbnail) {
            await uploads_image.uploadTitleInstallmentStreamThumbnail(stream.titleID, stream.installmentID, stream.label, streamThumbnail.buffer)
        }

        if (t) t.commit()

        res.status(200).json({ success: "successfully updated stream" })
    } catch (err) {
        res.status(400).json({ error: "failed to update stream" })
        if (t) t.rollback()
    }
}

async function DeleteStream(req, res) {
    try {
        const { streamID } = req.params

        await db.models.TitleInstallmentStream.RemoveFromDB(streamID)

        res.status(200).json({ success: "successfully removed stream" })
    } catch (err) {
        res.status(400).json({ error: "failed to remove stream" })
    }
}

async function AddStreamVideo(req, res) {
    try {
        const { streamID } = req.params
        const { tempFileID } = req.body

        if (!streamID || !tempFileID) {
            res.status(400).json({ error: "missing required data within request" })
            return
        }

        if (await db.models.StreamVideo.Exists(streamID)) {
            res.status(400).json({ error: "stream video already exists" })
            return
        }

        const tempUpload = await db.models.TempUpload.GetByID(tempFileID)
        const tempUploadFilename = db.models.TempUpload.GetFilename(tempUpload.id, db.models.TempUpload.GetExtension(tempUpload.originalFilename))

        await db.models.StreamVideo.AddToDB(uploads.temp.getTempPath(tempUploadFilename), { streamID: streamID })

        res.status(200).json({ success: `Attempting to add stream video process for ${streamID}}` })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}

async function AddStreamAudio(req, res) {
    try {
        const { streamID } = req.params
        const { label, streamIndexAudioOnly, tempFileID } = req.body
        if (!streamID || !tempFileID) {
            res.status(400).json({ error: "missing required data within request" })
            return
        }

        if (await db.models.StreamAudio.Exists(streamID, label)) {
            res.status(400).json({ error: "stream audio already exists" })
            return
        }

        const tempUpload = await db.models.TempUpload.GetByID(tempFileID)
        const tempUploadFilename = db.models.TempUpload.GetFilename(tempUpload.id, db.models.TempUpload.GetExtension(tempUpload.originalFilename))

        await db.models.StreamAudio.AddToDB(uploads.temp.getTempPath(tempUploadFilename), streamIndexAudioOnly, { streamID: streamID, label: label })

        res.status(200).json({ success: `Attempting to add stream audio process for ${streamID} with label ${label}` })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}

async function AddStreamSubtitle(req, res) {
    try {
        const { streamID } = req.params
        const { label, isCC, streamIndexSubtitleOnly, tempFileID } = req.body
        if (!streamID || !tempFileID) {
            res.status(400).json({ error: "missing required data within request" })
            return
        }

        if (await db.models.StreamSubtitle.Exists(streamID, label, isCC)) {
            res.status(400).json({ error: "stream subtitle already exists" })
            return
        }

        const tempUpload = await db.models.TempUpload.GetByID(tempFileID)
        const tempUploadFilename = db.models.TempUpload.GetFilename(tempUpload.id, db.models.TempUpload.GetExtension(tempUpload.originalFilename))

        await db.models.StreamSubtitle.AddToDB(uploads.temp.getTempPath(tempUploadFilename), streamIndexSubtitleOnly, { streamID: streamID, label: label, isCC: isCC })

        res.status(200).json({ success: `Attempting to add stream subtitle process for ${streamID} with label ${label}` })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}

async function DeleteStreamVideo(req, res) {
    try {
        const { streamID } = req.params

        await db.models.StreamVideo.RemoveFromDB(streamID)

        res.status(200).json({ success: "successfully removed stream video" })
    } catch (err) {
        res.status(400).json({ error: "failed to remove stream video" })
    }
}

async function DeleteStreamAudio(req, res) {
    try {
        const { streamID, label } = req.params

        await db.models.StreamAudio.RemoveFromDB(streamID, label)

        res.status(200).json({ success: "successfully removed stream audio" })
    } catch (err) {
        res.status(400).json({ error: "failed to remove stream audio" })
    }
}

async function DeleteStreamSubtitle(req, res) {
    try {
        let { streamID, label, isCC } = req.params

        if ((isCC && isCC.toLowerCase && isCC.toLowerCase() === "true") || isCC === "1") {
            isCC = true
        } else {
            isCC = false
        }

        await db.models.StreamSubtitle.RemoveFromDB(streamID, label, !!isCC)

        res.status(200).json({ success: "successfully removed stream subtitle" })
    } catch (err) {
        res.status(400).json({ error: "failed to remove stream subtitle" })
    }
}

async function UpdateStreamVideo(req, res) {
    try {
        const { streamID } = req.params
        const { tempFileID } = req.body

        if (!streamID || !tempFileID) {
            res.status(400).json({ error: "missing required data within request" })
            return
        }

        const tempUpload = await db.models.TempUpload.GetByID(tempFileID)
        const tempUploadFilename = db.models.TempUpload.GetFilename(tempUpload.id, db.models.TempUpload.GetExtension(tempUpload.originalFilename))

        await db.models.StreamVideo.UpdateInDB(streamID, uploads.temp.getTempPath(tempUploadFilename))

        res.status(200).json({ success: `Attempting to update stream video for ${streamID}` })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}

async function UpdateStreamAudio(req, res) {
    try {
        const { streamID, label } = req.params
        const { streamIndexAudioOnly, tempFileID, newLabel } = req.body

        if (tempFileID && streamIndexAudioOnly) {
            const tempUpload = await db.models.TempUpload.GetByID(tempFileID)
            const tempUploadFilename = db.models.TempUpload.GetFilename(tempUpload.id, db.models.TempUpload.GetExtension(tempUpload.originalFilename))
            const mediaPath = uploads.temp.getTempPath(tempUploadFilename)
            await db.models.StreamAudio.UpdateInDB(streamID, label, { mediaInputFilePath: mediaPath, streamIndex: streamIndexAudioOnly || 0 }, { label: newLabel })
        } else if (newLabel) {
            await db.models.StreamAudio.UpdateInDB(streamID, label, {}, { label: newLabel })
        }

        res.status(200).json({ success: `Attempting to update stream audio for ${streamID} with label ${label}` })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}

async function UpdateStreamSubtitle(req, res) {
    try {
        let { streamID, label, isCC } = req.params

        if ((isCC && isCC.toLowerCase && isCC.toLowerCase() === "true") || isCC === "1") {
            isCC = true
        } else {
            isCC = false
        }

        const { streamIndexSubtitleOnly, tempFileID, newLabel, newIsCC } = req.body

        if (tempFileID) {
            const tempUpload = await db.models.TempUpload.GetByID(tempFileID)
            const tempUploadFilename = db.models.TempUpload.GetFilename(tempUpload.id, db.models.TempUpload.GetExtension(tempUpload.originalFilename))
            const mediaPath = uploads.temp.getTempPath(tempUploadFilename)
            await db.models.StreamSubtitle.UpdateInDB(
                streamID,
                label,
                isCC,
                { mediaInputFilePath: mediaPath, streamIndex: streamIndexSubtitleOnly },
                { label: newLabel, isCC: newIsCC }
            )
        } else if (newLabel || newIsCC) {
            await db.models.StreamSubtitle.UpdateInDB(streamID, label, isCC, {}, { label: newLabel, isCC: newIsCC })
        }

        res.status(200).json({ success: `Attempting to update stream subtitle for ${streamID} with label ${label}` })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}

async function StreamVideoRenderInfo(req, res) {
    try {
        const { streamID } = req.params

        res.setHeader("Content-Type", "text/event-stream")
        res.setHeader("Cache-Control", "no-cache")
        res.setHeader("Connection", "keep-alive")

        res.flushHeaders()

        const streamVideoInfo = await db.models.StreamVideo.GetByStreamID(streamID)
        if (streamVideoInfo.isDownloaded) {
            res.write(
                `data: ${JSON.stringify({ satus: "Connected", streamVideoInfo, success: `stream video for streamID ${streamID} has already been rendered and ready to be streamed` })}\n\n`
            )
            res.end()
        } else {
            res.write(`data: ${JSON.stringify({ satus: "Connected" })}\n\n`)
            const sendUpdate = ({ progress, streamVideoData }) => {
                res.write(`data: ${JSON.stringify({ progress, streamVideoData })}\n\n`)
            }

            events.on(db.models.StreamVideo.GetVideoUpdateProgressEventName(streamID), sendUpdate)

            req.on("close", () => {
                events.off(db.models.StreamVideo.GetVideoUpdateProgressEventName(streamID), sendUpdate)
                res.end()
            })
        }
    } catch (err) {
        if (!res.headersSent) {
            res.status(400).json({ error: `failed to retrieve video renderer ${err.message}` })
        }
    }
}

async function StreamAudioRenderInfo(req, res) {
    try {
        const { streamID, label } = req.params

        res.setHeader("Content-Type", "text/event-stream")
        res.setHeader("Cache-Control", "no-cache")
        res.setHeader("Connection", "keep-alive")

        res.flushHeaders()

        const streamAudioInfo = await db.models.StreamAudio.GetByStreamIDAndLabel(streamID, label)
        if (streamAudioInfo.isDownloaded) {
            res.write(
                `data: ${JSON.stringify({ satus: "Connected", streamAudioInfo, success: `stream audio for streamID ${streamID} with label ${label} has already been rendered and ready to be streamed` })}\n\n`
            )
            res.end()
        } else {
            res.write(`data: ${JSON.stringify({ satus: "Connected" })}\n\n`)

            const sendUpdate = ({ progress, streamAudioData }) => {
                res.write(`data: ${JSON.stringify({ progress, streamAudioData })}\n\n`)
            }

            events.on(db.models.StreamAudio.GetAudioUpdateProgressEventName(streamID, label), sendUpdate)

            req.on("close", () => {
                events.off(db.models.StreamAudio.GetAudioUpdateProgressEventName(streamID, label), sendUpdate)
                res.end()
            })
        }
    } catch (err) {
        if (!res.headersSent) {
            res.status(400).json({ error: `failed to retrieve audio render info for streamID ${streamID} with label ${label}` })
        }
    }
}

async function StreamSubtitleRenderInfo(req, res) {
    try {
        let { streamID, label, isCC } = req.params

        if ((isCC && isCC.toLowerCase && isCC.toLowerCase() === "true") || isCC === "1") {
            isCC = true
        } else {
            isCC = false
        }

        res.setHeader("Content-Type", "text/event-stream")
        res.setHeader("Cache-Control", "no-cache")
        res.setHeader("Connection", "keep-alive")

        res.flushHeaders()

        const streamSubtitleInfo = await db.models.StreamSubtitle.GetByStreamIDAndLabelAndIsCC(streamID, label, isCC)
        if (streamSubtitleInfo.isDownloaded) {
            res.write(
                `data: ${JSON.stringify({ satus: "Connected", streamSubtitleInfo, success: `stream subtitle for streamID ${streamID} with label ${label} has already been rendered and ready to be streamed` })}\n\n`
            )
            res.end()
        } else {
            const sendUpdate = ({ progress, streamSubtitleData }) => {
                res.write(`data: ${JSON.stringify({ progress, streamSubtitleData })}\n\n`)
            }

            events.on(db.models.StreamSubtitle.GetSubtitleUpdateProgressEventName(streamID, label, isCC), sendUpdate)

            req.on("close", () => {
                events.off(db.models.StreamSubtitle.GetSubtitleUpdateProgressEventName(streamID, label, isCC), sendUpdate)
                res.end()
            })
        }
    } catch (err) {
        if (!res.headersSent) {
            res.status(400).json({ error: `failed to retrieve subtitle render info for streamID ${streamID} with label ${label}` })
        }
    }
}

async function AddGenre(req, res) {
    try {
        const { name } = req.body

        if (!name) {
            res.status(400).json({ error: "missing required data within request" })
            return
        }

        if (await db.models.Genre.Exists(name)) {
            res.status(400).json({ error: "genre already exists in the database" })
        }

        const genre = await db.models.Genre.AddToDB(name)

        res.status(200).json({ success: "successfully added genre" })
    } catch (err) {
        res.status(400).json({ error: "failed to add genre" })
    }
}

async function DeleteGenre(req, res) {
    try {
        const { name } = req.params

        const genre = await db.models.Genre.RemoveFromDB(name)

        res.status(200).json({ success: "successfully removed genre" })
    } catch (err) {
        res.status(400).json({ error: "failed to remove genre" })
    }
}

const titleController = {
    GetAllTitles,
    GetSingleTitle,
    GetAllGenres,
    GetTitleInstallmentStreamLikes,
    GetSingleGenre,
    GetAllInstallments,
    GetSingleInstallment,
    GetAllTitleInstallmentStream,
    GetSingleTitleInstallmentStream,
    AddTitle,
    UpdateTitle,
    DeleteTitle,
    AddInstallment,
    UpdateInstallment,
    DeleteInstallment,
    AddStream,
    UpdateStream,
    DeleteStream,
    stream: {
        AddStreamVideo,
        AddStreamAudio,
        AddStreamSubtitle,
        DeleteStreamVideo,
        DeleteStreamAudio,
        DeleteStreamSubtitle,
        UpdateStreamVideo,
        UpdateStreamAudio,
        UpdateStreamSubtitle,
        StreamVideoRenderInfo,
        StreamAudioRenderInfo,
        StreamSubtitleRenderInfo,
    },
    AddGenre,
    DeleteGenre,
}

module.exports = titleController
