const db = require("../../../models/database.cjs")
const { uploads_image } = require("../../../server-uploads-image.cjs")
const { sequelize } = require("sequelize")
const { uploads } = require("../../../server-uploads.cjs")
const events = require("../../../server-events.cjs")

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
    if (req.query.limit && !Number.isNaN(Number(req.query.limit))) {
        query.limit = Number(req.query.limit)
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
    try {
        const transaction = await sequelize.transaction()

        const titleData = JSON.parse(req.body.titleData)
        const titleCover = req.files["titleCover"][0]

        if (!titleData || !titleCover) {
            res.status(400).json({ error: "missing data within request" })
            return
        }

        const title = await db.models.Title.AddToDB(titleData.label, titleData.description, titleData.copyright, titleData.originalTranslation, transaction)

        for (const genre of titleData.genres) {
            await db.models.TitleGenre.AddToDB(title.id, genre, transaction)
        }

        for (const otherTranslation of titleData.otherTranslations) {
            await db.models.TitleOtherTranslation.AddToDB(title.id, otherTranslation, transaction)
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
        transaction.rollback()
    }
}

async function UpdateTitle(req, res) {
    let uploadedTitleCover = false
    try {
        const { titleID } = req.params

        const transaction = await sequelize.transaction()

        const titleData = JSON.parse(req.body.titleData)
        const titleCover = req.files["titleCover"][0]

        const title = await db.models.Title.UpdateInDB(
            titleID,
            { label: titleData.label, description: titleData.description, copyright: titleData.copyright, originalTranslation: titleData.originalTranslation },
            transaction
        )

        for (const genre of titleData.genres_delete) {
            if (db.models.TitleGenre.Exists(title.id, genre, transaction)) {
                await db.models.TitleGenre.RemoveByTitleIDAndGenreFromDB(title.id, genre, transaction)
            }
        }

        for (const genre of titleData.genres_add) {
            if (db.models.TitleGenre.Exists(title.id, genre, transaction)) {
                await db.models.TitleGenre.AddToDB(title.id, genre, transaction)
            }
        }

        for (const otherTranslation of titleData.otherTranslations_delete) {
            if (db.models.TitleOtherTranslation.Exists(title.id, otherTranslation, transaction)) {
                await db.models.TitleOtherTranslation.AddToDB(title.id, otherTranslation, transaction)
            }
        }

        for (const otherTranslation of titleData.otherTranslations_add) {
            if (db.models.TitleOtherTranslation.Exists(title.id, otherTranslation, transaction)) {
                await db.models.TitleOtherTranslation.AddToDB(title.id, otherTranslation, transaction)
            }
        }

        if (titleCover) {
            await uploads_image.uploadTitleCover(title.id, titleCover.buffer)
        }
        uploadedTitleCover = true

        transaction.commit()

        res.status(200).json({ success: "successfully updated title" })
    } catch (err) {
        res.status(400).json({ error: "failed to update title" })
        if (uploadedTitleCover) {
            await uploads_image.deleteTitleCover(title.id)
        }
        transaction.rollback()
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
        const installmentData = JSON.parse(req.body.installmentData)

        if (!installmentData || !installmentData.titleID) {
            res.status(400).json({ error: "missing required data within request" })
            return
        }

        const installment = await db.models.TitleInstallment.AddToDB(installmentData.titleID, installmentData.label, installmentData.isSeason)

        res.status(200).json({ success: "successfully added installment" })
    } catch (err) {
        res.status(400).json({ error: "failed to add installment" })
    }
}

async function UpdateInstallment(req, res) {
    try {
        const { installmentID } = req.params
        const installmentData = JSON.parse(req.body.installmentData)

        if (!installmentData) {
            res.status(400).json({ error: "missing required data within request" })
            return
        }

        const t = await sequelize.transaction()

        const installment = await db.models.TitleInstallment.UpdateInDB(
            installmentID,
            {
                label: installmentData.label,
                installmentNumber: installmentData.installmentNumber,
                isSeason: installmentData.isSeason,
            },
            t
        )

        t.commit()

        res.status(200).json({ success: "successfully updated installment" })
    } catch (err) {
        res.status(400).json({ error: "failed to update installment" })
        t.rollback()
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
    try {
        const { streamID } = req.params
        const streamData = JSON.parse(req.body.streamData)
        const streamThumbnail = req.files["streamThumbnail"][0]

        if (streamID && !streamData && !streamThumbnail) {
            res.status(400).json({ error: "missing data within request" })
            return
        }

        const t = await sequelize.transaction()

        const stream = await db.models.TitleInstallmentStream.UpdateInDB(
            streamID,
            {
                label: streamData.label,
                synopsis: streamData.synopsis,
                releaseDate: streamData.releaseDate,
                streamNumber: streamData.streamNumber,
            },
            t
        )

        await uploads_iamge.uploadTitleInstallmentStreamThumbnail(stream.titleID, stream.installmentID, stream.label, streamThumbnail.buffer)

        t.commit()

        res.status(200).json({ success: "successfully updated stream" })
    } catch (err) {
        res.status(400).json({ error: "failed to update stream" })
        t.rollback()
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
        const { tempFileID } = JSON.parse(req.body)

        if (!streamID || !tempFileID) {
            res.status(400).json({ error: "missing required data within request" })
            return
        }

        if (db.models.StreamVideo.Exists(streamID)) {
            res.status(400).json({ error: "stream video already exists" })
        }

        const tempUpload = await db.models.TempUpload.GetByID(tempFileID)
        const tempUploadFilename = db.models.TempUpload.GetFilename(tempUpload.id, db.models.TempUpload.GetExtension(tempUpload.originalFilename))

        db.models.StreamVideo.AddToDB(uploads.temp.getTempPath(tempUploadFilename), { streamID: streamID }).then()

        res.status(200).json({ success: `successfully started adding stream video process for ${streamID}}` })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}

async function AddStreamAudio(req, res) {
    try {
        const { streamID, label } = req.params
        const { streamIndexAudioOnly, tempFileID } = JSON.parse(req.body)
        if (!streamID || !tempFileID) {
            res.status(400).json({ error: "missing required data within request" })
            return
        }

        if (db.models.StreamAudio.Exists(streamID, label)) {
            res.status(400).json({ error: "stream audio already exists" })
        }

        const tempUpload = await db.models.TempUpload.GetByID(tempFileID)
        const tempUploadFilename = db.models.TempUpload.GetFilename(tempUpload.id, db.models.TempUpload.GetExtension(tempUpload.originalFilename))

        db.models.StreamAudio.AddToDB(uploads.temp.getTempPath(tempUploadFilename), streamIndexAudioOnly, { streamID: streamID, label: label }).then()

        res.status(200).json({ success: `successfully started adding stream audio process for ${streamID} with label ${label}` })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}

async function AddStreamSubtitle(req, res) {
    try {
        const { streamID, label } = req.params
        const { streamIndexSubtitleOnly, tempFileID } = JSON.parse(req.body)
        if (!streamID || !tempFileID) {
            res.status(400).json({ error: "missing required data within request" })
            return
        }

        if (db.models.StreamSubtitle.Exists(streamID, label)) {
            res.status(400).json({ error: "stream subtitle already exists" })
        }

        const tempUpload = await db.models.TempUpload.GetByID(tempFileID)
        const tempUploadFilename = db.models.TempUpload.GetFilename(tempUpload.id, db.models.TempUpload.GetExtension(tempUpload.originalFilename))

        db.models.StreamSubtitle.AddToDB(uploads.temp.getTempPath(tempUploadFilename), streamIndexSubtitleOnly, { streamID: streamID, label: label }).then()

        res.status(200).json({ success: `successfully started adding stream subtitle process for ${streamID} with label ${label}` })
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
        const { streamID, label } = req.params

        await db.models.StreamSubtitle.RemoveFromDB(streamID, label)

        res.status(200).json({ success: "successfully removed stream subtitle" })
    } catch (err) {
        res.status(400).json({ error: "failed to remove stream subtitle" })
    }
}

async function UpdateStreamVideo(req, res) {
    try {
        const { streamID } = req.params
        const { tempFileID } = JSON.parse(req.body)

        if (!streamID || !tempFileID) {
            res.status(400).json({ error: "missing required data within request" })
            return
        }

        const tempUpload = await db.models.TempUpload.GetByID(tempFileID)
        const tempUploadFilename = db.models.TempUpload.GetFilename(tempUpload.id, db.models.TempUpload.GetExtension(tempUpload.originalFilename))

        db.models.StreamVideo.UpdateInDB(streamID, uploads.temp.getTempPath(tempUploadFilename)).catch((err) => Logging.LogError(err.message))

        res.status(200).json({ success: `successfully started updating stream video process for ${streamID}` })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}

async function UpdateStreamAudio(req, res) {
    try {
        const { streamID, label } = req.params
        const { streamIndexAudioOnly, tempFileID, newLabel } = JSON.parse(req.body)

        if (tempFileID) {
            const tempUpload = await db.models.TempUpload.GetByID(tempFileID)
            const tempUploadFilename = db.models.TempUpload.GetFilename(tempUpload.id, db.models.TempUpload.GetExtension(tempUpload.originalFilename))
            const mediaPath = uploads.temp.getTempPath(tempUploadFilename)
            db.models.StreamAudio.UpdateInDB(streamID, label, mediaPath, streamIndexAudioOnly || 0, { label: newLabel }).catch((err) => Logging.LogError(err.message))
        } else if (newLabel) {
            db.models.StreamAudio.UpdateInDB(streamID, label, null, 0, { label: newLabel }).catch((err) => Logging.LogError(err.message))
        }

        res.status(200).json({ success: `successfully started updating stream audio process for ${streamID} with label ${label}` })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}

async function UpdateStreamSubtitle(req, res) {
    try {
        const { streamID, label } = req.params
        const { streamIndexSubtitleOnly, tempFileID, newLabel } = JSON.parse(req.body)

        if (tempFileID) {
            const tempUpload = await db.models.TempUpload.GetByID(tempFileID)
            const tempUploadFilename = db.models.TempUpload.GetFilename(tempUpload.id, db.models.TempUpload.GetExtension(tempUpload.originalFilename))
            const mediaPath = uploads.temp.getTempPath(tempUploadFilename)
            db.models.StreamSubtitle.UpdateInDB(streamID, label, { mediaInputFilePath: mediaPath, streamIndex: streamIndexSubtitleOnly }, { label: newLabel }).catch((err) =>
                Logging.LogError(err.message)
            )
        } else if (newLabel) {
            db.models.StreamSubtitle.UpdateInDB(streamID, label, {}, { label: newLabel }).catch((err) => Logging.LogError(err.message))
        }

        res.status(200).json({ success: `successfully started updating stream subtitle process for ${streamID} with label ${label}` })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}

async function StreamVideoRenderInfo(req, res) {
    try {
        const { streamID } = req.params

        const streamVideoInfo = await db.models.StreamVideo.GetByStreamID(streamID)

        if (streamVideoInfo.isDownloaded) {
            res.status(200).json({ success: `stream video for streamID ${streamID} has already been rendered and ready to be streamed` })
        }

        res.setHeader("Content-Type", "text/event-stream")
        res.setHeader("Cache-Control", "no-cache")
        res.setHeader("Connection", "keep-alive")

        res.write(`data: ${JSON.stringify({ satus: "Connected", progress: 0 })}\n\n`)

        const sendUpdate = (progress, streamVideoData) => {
            res.write(`data: ${JSON.stringify({ progress: progress, streamVideoData: streamVideoData })}\n\n`)
        }

        events.on(db.models.StreamVideo.GetVideoUpdateProgressEventName(streamID), sendUpdate)

        req.on("close", () => {
            events.off(db.models.StreamVideo.GetVideoUpdateProgressEventName(streamID), sendUpdate)
            res.end()
        })
    } catch (err) {
        res.status(400).json({ error: `failed to retrieve vidoe render info for streamID ${streamID}` })
    }
}

async function StreamAudioRenderInfo(req, res) {
    try {
        const { streamID, label } = req.params

        const streamAudioInfo = await db.models.StreamAudio.GetByStreamIDAndLabel(streamID, label)

        if (streamAudioInfo.isDownloaded) {
            res.status(200).json({ success: `stream audio for streamID ${streamID} with label ${label} has already been rendered and ready to be streamed` })
        }

        res.setHeader("Content-Type", "text/event-stream")
        res.setHeader("Cache-Control", "no-cache")
        res.setHeader("Connection", "keep-alive")

        res.write(`data: ${JSON.stringify({ satus: "Connected", progress: 0 })}\n\n`)

        const sendUpdate = (progress, streamAudioData) => {
            res.write(`data: ${JSON.stringify({ progress: progress, streamAudioData: streamAudioData })}\n\n`)
        }

        events.on(db.models.StreamAudio.GetAudioUpdateProgressEventName(streamID, label), sendUpdate)

        req.on("close", () => {
            events.off(db.models.StreamAudio.GetAudioUpdateProgressEventName(streamID, label), sendUpdate)
            res.end()
        })
    } catch (err) {
        res.status(400).json({ error: `failed to retrieve audio render info for streamID ${streamID} with label ${label}` })
    }
}

async function StreamSubtitleRenderInfo(req, res) {
    try {
        const { streamID, label } = req.params

        const streamSubtitleInfo = await db.models.StreamSubtitle.GetByStreamIDAndLabel(streamID, label)
        if (streamSubtitleInfo.isDownloaded) {
            res.status(200).json({ success: `stream subtitle for streamID ${streamID} with label ${label} has already been rendered and ready to be streamed` })
        }

        res.setHeader("Content-Type", "text/event-stream")
        res.setHeader("Cache-Control", "no-cache")
        res.setHeader("Connection", "keep-alive")

        res.write(`data: ${JSON.stringify({ satus: "Connected", progress: 0 })}\n\n`)

        const sendUpdate = (progress, streamSubtitleData) => {
            res.write(`data: ${JSON.stringify({ progress: progress, streamSubtitleData: streamSubtitleData })}\n\n`)
        }

        events.on(db.models.StreamSubtitle.GetSubtitleUpdateProgressEventName(streamID, label), sendUpdate)

        req.on("close", () => {
            events.off(db.models.StreamSubtitle.GetSubtitleUpdateProgressEventName(streamID, label), sendUpdate)
            res.end()
        })
    } catch (err) {
        res.status(400).json({ error: `failed to retrieve subtitle render info for streamID ${streamID} with label ${label}` })
    }
}

async function AddGenre(req, res) {
    try {
        const genreData = JSON.parse(req.body.genreData)

        if (!genreData || !genreData.genre) {
            res.status(400).json({ error: "missing required data within request" })
            return
        }

        if (db.models.Genre.Exists(genreData.genre)) {
            res.status(400).json({ error: "genre already exists in the database" })
        }

        const genre = await db.models.Genre.AddToDB(genreData.genre)

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
