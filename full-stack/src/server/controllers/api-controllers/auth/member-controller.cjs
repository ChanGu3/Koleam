const db = require("../../../models/database.cjs")

async function DeleteMember(req, res) {
    const { email } = req.params

    try {
        db.models.Member.RemoveByEmail(email)

        await res.status(200).json({
            success: `member with email:${email} has been deleted`,
        })
    } catch {
        res.status(500).json({
            error: `member with email:${email} could not be deleted`,
        })
    }
}

async function GetAllMembers(req, res) {
    const query = {}
    const { limit, offset, search } = req.query

    query.limit = 10
    if (limit && Number.isNaN(Number(limit))) {
        query.limit = Number(limit)
    }
    if (offset && Number.isNaN(Number(offset))) {
        query.offset = Number(offset)
    }
    if (search) {
        query.search = search
    }

    try {
        const membersList = await db.models.Member.GetAll(query)

        res.status(200).json(membersList)
    } catch {
        res.status(500).json({ error: `could not get all members` })
    }
}

async function GetSingleMember(req, res) {
    const { email } = req.params

    try {
        const member = await db.models.Member.GetByEmail(email)
        res.status(200).json(member)
    } catch {
        res.status(500).json({ error: `could not get member ${email}` })
    }
}

async function MemberGetSingleMember(req, res) {
    try {
        const member = await db.models.Member.GetByEmail(req.session.user.email)
        res.status(200).json(member)
    } catch {
        res.status(500).json({ error: `could not get member ${email}` })
    }
}

async function MemberGetAllAnimeStreamHistory(req, res) {
    const { latestStreamPerSeries, titleID } = req.query

    const query = {}
    query.latestStreamPerSeries = latestStreamPerSeries === "true" ? true : false
    query.titleID = titleID ? titleID : false

    try {
        const streamHistoryList = await db.models.TitleInstallmentStreamWatchHistory.GetWatchHistoryByEmail(req.session.user.email, query)
        res.status(200).json(streamHistoryList)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

async function MemberGetSingleAnimeStreamHistory(req, res) {
    const { streamID } = req.params

    try {
        const streamWatchHistory = await db.models.TitleInstallmentStreamWatchHistory.GetWatchHistoryByEmailANDStreamID(req.session.user.email, streamID)
        res.status(200).json(streamWatchHistory)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

async function MemberLogStreamWatchedStreamHistory(req, res) {
    const { streamID } = req.params

    try {
        if (await db.models.TitleInstallmentStreamWatchHistory.Exists(req.session.user.email, streamID)) {
            await db.models.TitleInstallmentStreamWatchHistory.UpdateDB(req.session.user.email, streamID)
            res.status(200).json({ success: "updated the streamID to history" })
        } else {
            await db.models.TitleInstallmentStreamWatchHistory.AddToDB(req.session.user.email, streamID)
            res.status(200).json({ success: "added the streamID to history" })
        }
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

async function MemberGetAllTitleFavorite(req, res) {
    try {
        const query = {}
        const { limit, offset } = req.query

        if (limit && Number.isNaN(Number(limit))) {
            query.limit = Number(limit)
        }
        if (offset && Number.isNaN(Number(offset))) {
            query.offset = Number(offset)
        }

        const streamFavorites = await db.models.TitleFavorite.GetAllByEmail(req.session.user.email, query)

        res.status(200).json(streamFavorites)
    } catch (err) {
        transaction.rollback()
        res.status(500).json({ error: err.message })
    }
}

async function MemberGetTitleFavorite(req, res) {
    const { titleID } = req.params

    try {
        const favorite = await db.models.TitleFavorite.GetByEmailANDTitleID(req.session.user.email, titleID)
        res.status(200).json(favorite)
    } catch (err) {
        res.status(200).json({ error: err.message })
    }
}

async function MemberAddTitleFavorite(req, res) {
    const { titleID } = req.params

    try {
        await db.models.TitleFavorite.AddToDB(req.session.user.email, titleID)
        res.status(200).json({
            success: `successfully added ${db.models.TitleFavorite.name} with ${titleID}`,
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

async function MemberDeleteTitleFavorite(req, res) {
    const { titleID } = req.params

    try {
        await db.models.TitleFavorite.RemoveFromDB(req.session.user.email, titleID)
        res.status(200).json({
            success: `successfully removed ${db.models.TitleFavorite.name} with ${titleID}`,
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

async function MemberGetStreamLike(req, res) {
    const { streamID } = req.params

    try {
        const streamLike = await db.models.TitleInstallmentStreamLike.GetByEmailANDStreamID(req.session.user.email, streamID)
        res.status(200).json({ streamLike })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

async function MemberAddStreamLike(req, res) {
    const { streamID } = req.params

    try {
        await db.models.TitleInstallmentStreamLike.AddToDB(req.session.user.email, streamID)
        res.status(200).json({ success: `successfully added ${db.models.TitleInstallmentStreamLike.name} with ${streamID}` })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

async function MemberDeleteStreamLike(req, res) {
    const { streamID } = req.params

    try {
        await db.models.TitleInstallmentStreamLike.RemoveFromDB(req.session.user.email, streamID)
        res.status(200).json({ success: `successfully removed ${db.models.TitleInstallmentStreamLike.name} with ${streamID}` })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

async function MemberGetTitleRating(req, res) {
    const { titleID } = req.params

    try {
        const animeRate = await db.models.TitleRating.GetByEmailANDAnimeID(req.session.user.email, titleID)
        res.status(200).json(animeRate)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

async function MemberAddTitleRating(req, res) {
    const { titleID } = req.params
    const { rating } = req.body

    try {
        await db.models.TitleRating.AddToDB(req.session.user.email, titleID, rating)
        res.status(200).json({
            success: `successfully added AnimeRate with ${titleID} and rating ${rating}`,
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

async function MemberUpdateTitleRating(req, res) {
    const { titleID } = req.params
    const { rating } = req.body

    try {
        await db.models.TitleRating.UpdateDB(req.session.user.email, titleID, rating)
        res.status(200).json({
            success: `successfully added ${db.models.TitleRating.name} with ${titleID} and rating ${rating}`,
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

async function MemberDeleteTitleRating(req, res) {
    const { titleID } = req.params

    try {
        await db.models.TitleRating.RemoveFromDB(req.session.user.email, titleID)
        res.status(200).json({ success: `successfully removed ${db.models.TitleRating.name} with ${titleID}` })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

async function MemberUpdateEmail(req, res) {
    const { newEmail, currentPassword } = req.body
    const currentEmail = req.session.user.email

    try {
        await db.models.Member.UpdateEmail(currentEmail, newEmail, currentPassword)
        req.session.user.email = newEmail.toLowerCase()
        res.status(200).json({ email: req.session.user.email })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}

async function MemberUpdatePassword(req, res) {
    const { currentPassword, newPassword } = req.body
    const email = req.session.user.email

    try {
        await db.models.Member.UpdatePassword(email, currentPassword, newPassword)
        res.status(200).json({ success: "Password updated successfully" })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}

const MemberController = {
    DeleteMember,
    GetAllMembers,
    GetSingleMember,
    MemberGetSingleMember,
    MemberGetAllTitleFavorite,
    MemberGetAllAnimeStreamHistory,
    MemberGetSingleAnimeStreamHistory,
    MemberLogStreamWatchedStreamHistory,
    MemberGetTitleFavorite,
    MemberAddTitleFavorite,
    MemberDeleteTitleFavorite,
    MemberGetStreamLike,
    MemberAddStreamLike,
    MemberDeleteStreamLike,
    MemberGetTitleRating,
    MemberAddTitleRating,
    MemberUpdateTitleRating,
    MemberDeleteTitleRating,
    MemberUpdateEmail,
    MemberUpdatePassword,
}

module.exports = MemberController
