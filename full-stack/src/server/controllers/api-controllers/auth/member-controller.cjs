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

    query.limit = limit && !Number.isNaN(Number(limit)) ? Number(limit) : 10
    query.offset = offset && !Number.isNaN(Number(offset)) ? Number(offset) : 0

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
        const member = await db.models.Member.GetByEmail(req.session.member.email)
        res.status(200).json(member)
    } catch {
        res.status(500).json({ error: `could not get member ${email}` })
    }
}

async function MemberGetAllTitleStreamHistory(req, res) {
    const { latestStreamPerSeries, titleID, limit, offset } = req.query

    const query = {}
    query.latestStreamPerSeries = latestStreamPerSeries === "true" ? true : false
    query.titleID = titleID ? titleID : false
    query.limit = limit && !Number.isNaN(Number(limit)) ? Number(limit) : false
    query.offset = offset && !Number.isNaN(Number(offset)) ? Number(offset) : false

    try {
        const streamHistoryList = await db.models.TitleInstallmentStreamWatchHistory.GetWatchHistoryByEmail(req.session.member.email, query)
        res.status(200).json(streamHistoryList)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

async function MemberGetSingleTitleStreamHistory(req, res) {
    const { streamID } = req.params

    try {
        const streamWatchHistory = await db.models.TitleInstallmentStreamWatchHistory.GetWatchHistoryByEmailANDStreamID(req.session.member.email, streamID)
        res.status(200).json(streamWatchHistory)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

async function MemberLogStreamWatchedStreamHistory(req, res) {
    const { streamID } = req.params
    const { lastTimeStampInSeconds } = req.body

    try {
        if (await db.models.TitleInstallmentStreamWatchHistory.Exists(req.session.member.email, streamID)) {
            await db.models.TitleInstallmentStreamWatchHistory.UpdateDB(req.session.member.email, streamID, { lastTimeStampInSeconds: lastTimeStampInSeconds })
            res.status(200).json({ success: "updated the streamID to history" })
        } else {
            await db.models.TitleInstallmentStreamWatchHistory.AddToDB(req.session.member.email, streamID)
            res.status(200).json({ success: "added the streamID to history" })
        }
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

async function MemberDeleteStreamWatchedStreamHistory(req, res) {
    const { streamID } = req.params

    try {
        await db.models.TitleInstallmentStreamWatchHistory.RemoveFromDB(req.session.member.email, streamID)
        res.status(200).json({
            success: `successfully removed ${db.models.TitleInstallmentStreamWatchHistory.name} with ${streamID}`,
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

async function MemberGetAllTitleFavorite(req, res) {
    try {
        const query = {}
        const { limit, offset } = req.query

        if (limit && !Number.isNaN(Number(limit))) {
            query.limit = Number(limit)
        }
        if (offset && !Number.isNaN(Number(offset))) {
            query.offset = Number(offset)
        }

        const streamFavorites = await db.models.TitleFavorite.GetAllByEmail(req.session.member.email, query)

        res.status(200).json(streamFavorites)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

async function MemberGetTitleFavorite(req, res) {
    const { titleID } = req.params

    try {
        const favorite = await db.models.TitleFavorite.GetByEmailANDTitleID(req.session.member.email, titleID)
        res.status(200).json(favorite)
    } catch (err) {
        res.status(200).json({ error: err.message })
    }
}

async function MemberUpdateTitleFavorite(req, res) {
    const { titleID } = req.params

    try {
        if (await db.models.TitleFavorite.Exists(req.session.member.email, titleID)) {
            await db.models.TitleFavorite.RemoveFromDB(req.session.member.email, titleID)
        } else {
            await db.models.TitleFavorite.AddToDB(req.session.member.email, titleID)
        }
        res.status(200).json({
            success: `successfully updated ${db.models.TitleFavorite.name} with ${titleID}`,
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

async function MemberGetStreamLike(req, res) {
    const { streamID } = req.params

    try {
        const streamLike = await db.models.TitleInstallmentStreamLike.GetByEmailANDStreamID(req.session.member.email, streamID)
        res.status(200).json(streamLike)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

async function MemberUpdateStreamLike(req, res) {
    const { streamID } = req.params

    try {
        if (await db.models.TitleInstallmentStreamLike.Exists(req.session.member.email, streamID)) {
            await db.models.TitleInstallmentStreamLike.RemoveFromDB(req.session.member.email, streamID)
        } else {
            await db.models.TitleInstallmentStreamLike.AddToDB(req.session.member.email, streamID)
        }
        res.status(200).json({ success: `successfully aupdated ${db.models.TitleInstallmentStreamLike.name} with ${streamID}` })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

async function MemberGetTitleRating(req, res) {
    const { titleID } = req.params

    try {
        const titleRate = await db.models.TitleRating.GetByEmailANDTitleID(req.session.member.email, titleID)
        res.status(200).json(titleRate)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

async function MemberUpdateTitleRating(req, res) {
    const { titleID } = req.params
    const { rating } = req.body

    try {
        if (await db.models.TitleRating.Exists(req.session.member.email, titleID)) {
            if (rating === 0) {
                await db.models.TitleRating.RemoveFromDB(req.session.member.email, titleID)
            } else {
                await db.models.TitleRating.UpdateDB(req.session.member.email, titleID, { rating })
            }
        } else {
            if (rating !== 0) {
                await db.models.TitleRating.AddToDB(req.session.member.email, titleID, rating)
            }
        }
        res.status(200).json({
            success: `successfully updated rating for ${db.models.TitleRating.name} with ${titleID} and rating ${rating}`,
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

async function MemberUpdateEmail(req, res) {
    const { newEmail } = req.body
    const currentEmail = req.session.member.email

    try {
        await db.models.Member.UpdateEmail(currentEmail, newEmail)
        req.session.member.email = newEmail.toLowerCase()
        res.status(200).json({ email: req.session.member.email })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}

async function MemberUpdatePassword(req, res) {
    const { currentPassword, newPassword } = req.body
    const email = req.session.member.email

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
    MemberGetAllTitleStreamHistory,
    MemberGetSingleTitleStreamHistory,
    MemberLogStreamWatchedStreamHistory,
    MemberDeleteStreamWatchedStreamHistory,
    MemberGetTitleFavorite,
    MemberUpdateTitleFavorite,
    MemberGetStreamLike,
    MemberUpdateStreamLike,
    MemberGetTitleRating,
    MemberUpdateTitleRating,
    MemberUpdateEmail,
    MemberUpdatePassword,
}

module.exports = MemberController
