const bcrypt = require("bcrypt")
const saltRounds = 12

function HashPassword(password, saltRounds) {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err) {
                console.error(`Could Not Hash Password --- ${err.message}`)
                reject(new Error(errormsg.fallback))
            } else {
                resolve(hash)
            }
        })
    })
}

module.exports.saltRounds = saltRounds
module.exports.HashPassword = HashPassword
