const db = require("../../../models/database.cjs")

async function AuthorizeMember(req, res, next) {
    try {
        if (req.session.member) {
            if (await db.models.Member.Exists(req.session.member.email)) {
                next()
                return
            }
        }
    } catch (err) {}

    res.status(401).json({ error: "Not Authorized" })
}

async function AuthorizeAdmin(req, res, next) {
    try {
        if (req.session.admin) {
            if (await db.models.Admin.Exists(req.session.admin.username)) {
                next()
                return
            }
        }
    } catch (err) {}

    res.status(401).json({ error: "Not Authorized" })
}

async function Authorized(req, res, next) {
    res.status(200).json({ success: "Authorized" })
}

const AuthorizeController = {
    AuthorizeMember,
    AuthorizeAdmin,
    Authorized,
}

module.exports = AuthorizeController
