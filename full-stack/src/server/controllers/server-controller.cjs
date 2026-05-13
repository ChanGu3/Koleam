const { Logging } = require("../server-logging.cjs")
const db = require("../models/database.cjs")

//
// - Resets Session Based On Session Existence In Database -
//
async function CookieChecker(req, res, next) {
    // when user has cookie session id but that session id is no longer valid on server
    if (req.signedCookies["connect.sid"] && req.signedCookies["connect.sid"] !== req.sessionID) {
        try {
            const session = await db.models.Session.UpdateSessionID(req.signedCookies["connect.sid"], req.sessionID)

            if (session.userRole == db.models.Session.SESSION_ROLES.ADMIN) {
                req.session.admin = await db.models.Admin.GetByUsername(session.loginName)
            } else if (session.userRole == db.models.Session.SESSION_ROLES.MEMBER) {
                req.session.user = await db.models.Member.GetByEmail(session.loginName)
            }
            await db.Session.LogExistingSession(req.sessionID)
            Logging.LogSuccess(`reset session for ${session.loginName}`)
        } catch (err) {
            try {
                await new Promise((resolve, reject) => {
                    req.session.destroy((err) => {
                        if (err) {
                            Logging.LogError(`session could not be destroyed for id:{${req.sessionID}}`)
                            reject()
                        } else {
                            res.clearCookie("connect.sid")
                            Logging.LogSuccess(`successfully cleaned up client and server cookies`)
                            resolve()
                        }
                    })
                })
            } catch (err) {
                Logging.LogError(`error destroying session for id:{${req.sessionID}} --- ${err}`)
            }
        }
    } else {
        // when the session is already valid re-log to continue the session for a longer time
        try {
            if (req.signedCookies["connect.sid"] === req.sessionID) {
                await db.models.Session.LogExistingSession(req.sessionID)
            }
        } catch (err) {
            Logging.LogError(`error checking cookies ${err}`)
        }
    }

    next()
}

const otherPrivateKeyForPrivateAPI = "some-key" // TODO: GENERATED ENVIRONMENT VARIABLE TO CONNECT DESKTOP APP TO PRIVATE API
async function VerifyPrivateAccess(req, res, next) {
    const authHeader = req.headers["authorization"]
    let bearerToken = null

    if (authHeader && authHeader.startsWith("Bearer ")) {
        // Strip the "Bearer " part to get just the key
        bearerToken = authHeader.split(" ")[1]
    }

    if (bearerToken === otherPrivateKeyForPrivateAPI) {
        next()
    } else {
        res.status(401).json({ error: "Unauthorized" })
    }
}

async function IsPrivateServerOnline(req, res, next) {
    res.status(200).json({ success: "Private server is online" })
}

const ServerController = {
    CookieChecker,
    VerifyPrivateAccess,
    IsPrivateServerOnline,
}

module.exports = ServerController
