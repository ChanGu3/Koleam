const chalk = require("chalk")

const processName = "koleam"

// --- Error Messages ---
const fallback = "Server Error - please try again later"
const emailExists = "email already exists - please sign in or use a different email"
const usernameExists = "username already in use - please sign in or use a different username"
const authentificationFail = "email or password is invalid please try again"
const sessionDoesNotExist = "session does not exists so could not retrieve email"
const genreDoesNotExist = "genre does not exists so could not retrieve it"
const titleGenreDoesNotExist = "AnimeGenre does not exists so could not retrieve it"
const titleOtherTranslationDoesNotExist = "AnimeOtherTranslation does not exists so could not retrieve it"

function LogProcess(msg) {
    console.log(chalk.cyan(`[${processName}] ${msg}`))
}

function LogSuccess(msg) {
    console.log(chalk.magenta(`[${processName}] ${msg}`))
}

function LogWarning(msg) {
    console.warn(chalk.yellow(`[warn - ${processName}] ${msg}`))
}

function LogError(msg) {
    console.error(chalk.red(`[err - ${processName}] ${msg}`))
}

function LogDev(msg) {
    console.log(chalk.yellowBright(`[dev - ${processName}] ${msg}`))
}

const errormsg = {
    fallback,
    emailExists,
    authentificationFail,
    sessionDoesNotExist,
    genreDoesNotExist,
    titleGenreDoesNotExist,
    titleOtherTranslationDoesNotExist,
}

const Logging = {
    LogProcess,
    LogSuccess,
    LogWarning,
    LogError,
    LogDev,
}

module.exports.errormsg = errormsg
module.exports.Logging = Logging
