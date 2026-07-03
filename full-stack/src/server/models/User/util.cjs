const bcrypt = require("bcrypt")
const { Logging } = require("../../server-logging.cjs")
const { errormsg } = require("../../server-logging.cjs")
const saltRounds = 12

async function HashPassword(password, saltRounds) {
    try {
        return await bcrypt.hash(password, saltRounds)
    } catch (err) {
        Logging.LogError(`Could Not Hash Password --- ${err.message}`)
        throw new Error(errormsg.fallback)
    }
}

module.exports.saltRounds = saltRounds
module.exports.HashPassword = HashPassword
