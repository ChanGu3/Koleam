const { Logging } = require("../../../server-logging.cjs")
const db = require("../../../models/database.cjs")

async function AttemptMemberSignIn(req, res) {
    // user already exists sign in just take them to home bypasses sign in entirely -- WONT NEED THIS WHEN BLOCKING SIGN IN ENTIRELY
    if (req.session && req.session.user) {
        res.status(200).end()
        return
    }

    const { email, password } = req.body

    try {
        const user = await db.models.Member.Authentification(email, password)
        const userJSON = user.toJSON()
        req.session.user = {}
        req.session.user.email = userJSON.email
        const newSession = await db.models.Session.AddToDB(req.sessionID, userJSON.email, db.models.Session.SESSION_ROLES.MEMBER)
        res.status(200).end()
    } catch (err) {
        res.clearCookie("connect.sid")
        res.status(400).json({ error: err.message })
    }
}

async function AttemptMemberSignUp(req, res, next) {
    const { email, password } = req.body

    try {
        const newMember = await db.models.Member.AddToDB(email, password)
        next()
    } catch (err) {
        res.status(502).json({ error: err.message })
    }
}

async function AttemptAdminSignIn(req, res) {
    // user already exists sign in just take them to home bypasses sign in entirely -- WONT NEED THIS WHEN BLOCKING SIGN IN ENTIRELY
    if (req.session && req.session.user) {
        res.status(200).end()
        return
    }

    const { username, password } = req.body

    try {
        const user = await db.models.Admin.Authentification(username, password)
        const userJSON = user.toJSON()
        req.session.admin = {}
        req.session.admin.username = userJSON.username
        //req.session.member_id = user.id; [NOTE MEMEBER AND ADMIN SESSIONS ARE THE SAME BUT ITS OKAY SINCE THEY SHARE THE SAME SESSIONID Space]
        const newSession = await db.models.Session.AddToDB(req.sessionID, userJSON.username, db.models.Session.SESSION_ROLES.ADMIN)
        res.status(200).end()
    } catch (err) {
        res.clearCookie("connect.sid")
        res.status(400).json({ error: err.message })
    }
}

async function AttemptSignOut(req, res) {
    try {
        const tempSessionID = req.sessionID
        await db.models.Session.RemoveByID(req.sessionID)
        await new Promise((resolve, reject) => {
            req.session.destroy((err) => {
                if (err) {
                    reject(new Error("session could not be destroyed"))
                } else {
                    res.clearCookie("connect.sid")
                    resolve()
                }
            })
        })
        res.status(200).end()
        Logging.LogSuccess(`successfully removed session with id:{${tempSessionID}} from client and server`)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

async function AddAdmin(req, res) {
    const { username, password } = req.body

    try {
        const newAdmin = await db.models.Admin.AddToDB(username, password)
        res.status(200).json({ success: `successfully added ${username} as an admin` })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

const AuthentifyContoller = {
    AttemptMemberSignIn,
    AttemptMemberSignUp,
    AttemptAdminSignIn,
    AttemptSignOut,
    AddAdmin,
}

module.exports = AuthentifyContoller
