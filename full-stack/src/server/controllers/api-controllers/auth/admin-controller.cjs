const db = require("../../../models/database.cjs")

async function DeleteAdmin(req, res) {
    const { username } = req.params

    try {
        db.models.Admin.RemoveByUsername(username)

        await res.status(200).json({
            success: `${db.models.Admin.name} with username:${username} has been deleted`,
        })
    } catch {
        res.status(500).json({
            error: `${db.models.Admin.name} with username:${username} could not be deleted`,
        })
    }
}

async function AdminDeleteAdmin(req, res) {
    try {
        db.models.Admin.RemoveByUsername(req.session.admin.username)

        await res.status(200).json({
            success: `${db.models.Admin.name} with username:${username} has been deleted`,
        })
    } catch {
        res.status(500).json({
            error: `${db.models.Admin.name} with username:${username} could not be deleted`,
        })
    }
}

async function GetAllAdmin(req, res) {
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
    DeleteAdmin,
    AdminDeleteAdmin,
    GetAllAdmin,
    GetSingleAdmin,
    AdminGetSingleAdmin,
    AdminUpdateUsername,
    AdminUpdatePassword,
}

module.exports = AdminController
