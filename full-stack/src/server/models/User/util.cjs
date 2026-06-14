const bcrypt = require("bcrypt");
const { Logging } = require("../../server-logging.cjs");
const saltRounds = 12

function HashPassword(password, saltRounds) {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err) {
                Logging.LogError(`Could Not Hash Password --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            } else {
                resolve(hash)
            }
        })
    })
}

module.exports.saltRounds = saltRounds
module.exports.HashPassword = HashPassword
