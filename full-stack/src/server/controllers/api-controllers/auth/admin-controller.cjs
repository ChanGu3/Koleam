const db = require("../../../models/database.cjs")

async function DeleteAdmin(req, res) {
    const { username } = req.params

    try {
        await db.models.Admin.RemoveByUsername(username)

        await res.status(200).json({
            success: `${db.models.Admin.name} with username:${username} has been deleted`,
        })
    } catch (error) {
        res.status(500).json({
            error: `${error.message}`,
        })
    }
}

async function AddAdmin(req, res) {
    const { username, password } = req.body

    try {
        await db.models.Admin.AddToDB(username, password)

        await res.status(200).json({
            success: `${db.models.Admin.name} with username:${username} has been deleted`,
        })
    } catch (error) {
        res.status(500).json({
            error: `${error.message}`,
        })
    }
}

async function GetAllAdmin(req, res) {
    const query = {}
    const { limit, offset, search } = req.query

    query.limit = 10
    if (limit !== undefined && limit !== null && !Number.isNaN(Number(limit))) {
        query.limit = Number(limit)
    }
    if (offset !== undefined && offset !== null && !Number.isNaN(Number(offset))) {
        query.offset = Number(offset)
    }
    if (search) {
        query.search = search
    }

    try {
        const admins = await db.models.Admin.GetAll(query)

        res.status(200).json(admins)
    } catch {
        res.status(500).json({ error: `could not get all admin` })
    }
}

async function GetSingleAdmin(req, res) {
    const { username } = req.params

    try {
        const admin = await db.models.Admin.GetByUsername(username)
        res.status(200).json(admin)
    } catch {
        res.status(500).json({ error: `could not get admin ${username}` })
    }
}

async function AdminGetSingleAdmin(req, res) {
    try {
        const admin = await db.models.Admin.GetByUsername(req.session.admin.username)
        res.status(200).json(admin)
    } catch {
        res.status(500).json({ error: `could not get admin ${username}` })
    }
}

async function AdminUpdateSingleAdmin(req, res) {
    const { username } = req.params
    const { newUsername, newPassword } = req.body

    try {
        if (newPassword) {
            await db.models.Admin.UpdatePasswordByAdmin(username, newPassword)
        }
        if (newUsername) {
            await db.models.Admin.UpdateUsername(username, newUsername)
        }
        res.status(200).json({ success: "succussefully updated admin username", username: newUsername })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}

async function AdminUpdateUsername(req, res) {
    const { newUsername } = req.body
    const oldUsername = req.session.admin.username

    try {
        await db.models.Admin.UpdateUsername(oldUsername, newUsername)
        res.status(200).json({ username: req.session.admin.username })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}

async function AdminUpdatePassword(req, res) {
    const { currentPassword, newPassword } = req.body
    const username = req.session.admin.username

    try {
        await db.models.Admin.UpdatePassword(username, currentPassword, newPassword)
        res.status(200).json({ success: "Password updated successfully" })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}

const AdminController = {
    AddAdmin,
    DeleteAdmin,
    GetAllAdmin,
    GetSingleAdmin,
    AdminGetSingleAdmin,
    AdminUpdateUsername,
    AdminUpdateSingleAdmin,
    AdminUpdatePassword,
}

module.exports = AdminController
