const { updateEnvVariable } = require("../server-environment.cjs")
const { Logging } = require("../server-logging.cjs")
const db = require("../models/database.cjs")
const minimist = require("minimist")
const argv = minimist(process.argv.slice(2))
const isDev = argv.dev === true || argv.d === true

function isValidCSSHexWithoutPound(hex) {
    const hexRegex = /^([A-Fa-f0-9]{3,4}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/
    return hexRegex.test(hex)
}

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

const otherPrivateKeyForPrivateAPI = process.env.PRIVATE_KEY
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

async function GetEnvColorsForWebsite(req, res) {
    res.status(200).json({
        COLORS: {
            LIGHT_MODE: {
                S_WHITE: process.env.S_WHITE,
                S_PRIMARY: process.env.S_PRIMARY,
                S_SECONDARY: process.env.S_SECONDARY,
                S_TERTIARY: process.env.S_TERTIARY,
                S_DARK_PRIMARY: process.env.S_DARK_PRIMARY,
                S_DARK_SECONDARY: process.env.S_DARK_SECONDARY,
                S_DARK_TERTIARY: process.env.S_DARK_TERTIARY,
                S_LINK_VISITED: process.env.S_LINK_VISITED,
                S_ERROR: process.env.S_ERROR,
                S_SUCCESS: process.env.S_SUCCESS,
            },
            DARK_MODE: {},
        },
    })
}

async function UpdateEnvVariableColor(color_key, hex) {
    if (!isValidCSSHexWithoutPound(hex)) {
        await updateEnvVariable(color_key, hex, !isDev)
    }
}

async function UpdateEnvColorsForWebsite(req, res) {
    const {
        COLORS: {
            LIGHT_MODE: { S_WHITE, S_PRIMARY, S_SECONDARY, S_TERTIARY, S_DARK_PRIMARY, S_DARK_SECONDARY, S_DARK_TERTIARY, S_LINK_VISITED, S_ERROR, S_SUCCESS },
            DARK_MODE,
        },
    } = req.body

    try {
        await UpdateEnvVariableColor("S_WHITE", S_WHITE)
        await UpdateEnvVariableColor("S_PRIMARY", S_PRIMARY)
        await UpdateEnvVariableColor("S_SECONDARY", S_SECONDARY)
        await UpdateEnvVariableColor("S_TERTIARY", S_TERTIARY)
        await UpdateEnvVariableColor("S_DARK_PRIMARY", S_DARK_PRIMARY)
        await UpdateEnvVariableColor("S_DARK_SECONDARY", S_DARK_SECONDARY)
        await UpdateEnvVariableColor("S_DARK_TERTIARY", S_DARK_TERTIARY)
        await UpdateEnvVariableColor("S_LINK_VISITED", S_LINK_VISITED)
        await UpdateEnvVariableColor("S_ERROR", S_ERROR)
        await UpdateEnvVariableColor("S_SUCCESS", S_SUCCESS)

        res.status(200).json({ success: "Environment colors updated successfully" })
    } catch (err) {
        Logging.LogError(`Error updating environment colors: ${err}`)
        res.status(500).json({ error: "Failure occured during colors env variables updating" })
    }
}

async function GetPortForLocal(req, res) {
    res.status(200).json({ LOCAL_PORT: process.env.LOCAL_PORT })
}

async function GetPortForPublic(req, res) {
    res.status(200).json({ PUBLIC_PORT: process.env.PUBLIC_PORT })
}

async function GetAllPorts(req, res) {
    res.status(200).json({
        PORTS: {
            PRIVATE_PORT: process.env.PRIVATE_PORT,
            PUBLIC_PORT: process.env.PUBLIC_PORT,
            LOCAL_PORT: process.env.LOCAL_PORT,
        },
    })
}

async function UpdateAllPorts(req, res) {
    const {
        PORTS: { PRIVATE_PORT, PUBLIC_PORT, LOCAL_PORT },
    } = req.body

    try {
        await updateEnvVariable("PRIVATE_PORT", PRIVATE_PORT, !isDev)
        await updateEnvVariable("PUBLIC_PORT", PUBLIC_PORT, !isDev)
        await updateEnvVariable("LOCAL_PORT", LOCAL_PORT, !isDev)

        res.status(200).json({ success: "Environment ports updated successfully" })
    } catch (err) {
        Logging.LogError(`Error updating environment ports: ${err}`)
        res.status(500).json({ error: "Failure occured during ports env variables updating" })
    }
}

async function ResetSessionKey(req, res) {
    try {
        const newSessionKey = crypto.randomBytes(32).toString("hex")
        await updateEnvVariable("SESSION_SECRET_KEY", newSessionKey, !isDev)
        res.status(200).json({ success: "Session secret key reset successfully" })
    } catch (err) {
        Logging.LogError(`Error resetting session secret key: ${err}`)
        res.status(500).json({ error: "Failure occured during session secret key reset" })
    }
}

async function ResetPrivateKey(req, res) {
    try {
        const newPrivateKey = crypto.randomBytes(32).toString("hex")
        await updateEnvVariable("PRIVATE_KEY", newPrivateKey, !isDev)
        res.status(200).json({ success: "Private key reset successfully" })
    } catch (err) {
        Logging.LogError(`Error resetting private key: ${err}`)
        res.status(500).json({ error: "Failure occured during private key reset" })
    }
}

async function UpdateWebsiteName(req, res) {
    const { WEBSITE_NAME } = req.body

    try {
        await updateEnvVariable("WEBSITE_NAME", WEBSITE_NAME, !isDev)
        res.status(200).json({ success: "Website name updated successfully" })
    } catch (err) {
        Logging.LogError(`Error updating website name: ${err}`)
        res.status(500).json({ error: "Failure occured during website name update" })
    }
}

async function GetWebsiteName(req, res) {
    res.status(200).json({ WEBSITE_NAME: process.env.WEBSITE_NAME })
}

const ServerController = {
    CookieChecker,
    VerifyPrivateAccess,
    IsPrivateServerOnline,
    GetEnvColorsForWebsite,
    UpdateEnvColorsForWebsite,
    GetPortForLocal,
    GetPortForPublic,
    GetAllPorts,
    UpdateAllPorts,
    ResetSessionKey,
    ResetPrivateKey,
    UpdateWebsiteName,
    GetWebsiteName,
}

module.exports = ServerController
