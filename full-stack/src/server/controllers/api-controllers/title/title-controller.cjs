const db = require("../../../models/database.cjs")
const { uploads_image } = require("../../../server-uploads-image.cjs")
const { sequelize } = require("sequelize")

async function GetAllTitles(req, res) {
    const query = {}

    const { limit, getNewestReleases, isAZ, genres, search, shuffle } = req.query
    if (getNewestReleases === "true") {
        query.getNewestReleases = true
    }
    if (limit && Number.isNaN(Number(limit))) {
        query.limit = Number(limit)
    }
    if (isAZ === "true") {
        query.isAZ = true
    }
    let genresList = null
    if (genres !== "null" && genres !== "undefined" && genres) {
        genresList = [].concat(genres)
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
    try {
        const genres = await Genre.GetAll()

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
        const titleStream = await db.models.TitleInstallmentStream.GetByID(streamID)
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

        await uploads_image.uploadTitleInstallmentStreamThumbnail(stream.titleID, stream.installmentID, stream.streamID, streamThumbnail.buffer)

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

        await uploads_iamge.uploadTitleInstallmentStreamThumbnail(stream.titleID, stream.installmentID, stream.streamID, streamThumbnail.buffer)

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
    AddGenre,
    DeleteGenre,
}

module.exports = titleController
