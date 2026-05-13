const db = require("../../../models/database.cjs")

async function AuthorizeMember(req, res, next) {
    try {
        if (req.session.user) {
            if (await db.Member.Exists(req.session.user.email)) {
                next()
                return
            }
        }
    } catch (err) {}

    res.status(200).json({ error: "Not Authorized" })
}

async function AuthorizeAdmin(req, res, next) {
    try {
        if (req.session.user) {
            if (await db.Admin.Exists(req.session.user.email)) {
                next()
                return
            }
        }
    } catch (err) {}

    res.status(200).json({ error: "Not Authorized" })
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
