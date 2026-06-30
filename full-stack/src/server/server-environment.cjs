const { Logging } = require("./server-logging.cjs")
const crypto = require("crypto")
const path = require("path")
const fs = require("fs").promises

/**
 *
 * @returns {Promise<boolean>} - Returns true if the default .env file was created, false if it already exists or an error occurred
 */
async function CreateDefaultEnvFile(isBuild = false) {
    let pathServer = ""
    if (isBuild) {
        const pathDist = path.resolve(__dirname, "..", "..", "dist")
        pathServer = path.join(pathDist, "server")
    } else {
        pathServer = path.join(__dirname)
    }

    try {
        const fullPath = path.join(pathServer, ".env")
        await fs.access(fullPath)
        Logging.LogWarning(`Default .env file already exists in ${path.join(fullPath)} skipping environment variables .env file creation`)
        return false
    } catch (err) {
        const privateKey = crypto.randomBytes(32).toString("hex")
        const sessionSecretKey = crypto.randomBytes(32).toString("hex")

        const defaultEnvContent = `# .env file for server environment variables
# KEYS 
PRIVATE_KEY=${privateKey}
SESSION_SECRET_KEY=${sessionSecretKey}

# PORTS
PRIVATE_PORT=5774
PUBLIC_PORT=5775
LOCAL_PORT=5776

### WEBSITE CONFIGURATION
# colors
S_WHITE=f8f8ff
S_PRIMARY=87ceeb
S_SECONDARY=59cfff
S_TERTIARY=429abe
S_DARK_PRIMARY=1a1a1a
S_DARK_SECONDARY=777777
S_DARK_TERTIARY=0f0f0f
S_LINK-VISITED=9333ea
S_ERROR=be185d
S_SUCCESS=2CFF05

# LABELS
WEBSITE_NAME=Koleam
`

        // TODO FIND MORE ENV VARIABLES IN THE PROJECT FOR MANIUPLATION ON THE DESKTOP APP COLORS, WEBSITE NAME, ETC

        try {
            await fs.writeFile(path.join(pathServer, ".env"), defaultEnvContent)
            Logging.LogProcess(`Default .env file created in ${pathServer}`)
            return true
        } catch (err) {
            Logging.LogError(`Error creating default .env file in dist/server: ${err}`)
            return false
        }
    }
}

async function updateEnvVariable(key, value, isBuild = false) {
    if (value === undefined || value === null) {
        Logging.LogWarning(`.env value for updating key ${key} is undefined or null`)
        return
    }

    if (isBuild) {
        const pathDist = path.resolve(__dirname, "..", "..", "dist")
        pathServer = path.join(pathDist, "server")
    } else {
        pathServer = path.join(__dirname)
    }
    const envPath = path.join(pathServer, ".env")

    if (!(await fs.access(envPath))) {
        throw new Error(
            `.env file not found at ${envPath}. please create the .env file first. You possibly may also not have permissions to access the file. If this is the case check the permissions of the executer for the .env file`
        )
    }

    let envContent = await fs.readFile(envPath, "utf-8")

    const regex = new RegExp(`^${key}=.*$`, "m")

    if (regex.test(envContent)) {
        // Replace existing value
        envContent = envContent.replace(regex, `${key}=${value}`)
    } else {
        throw new Error(`key ${key} not found in .env file. Please ensure the key exists before updating.`)
    }

    await fs.writeFile(envPath, envContent)
}

const env = {
    CreateDefaultEnvFile,
    updateEnvVariable,
}

module.exports.env = env
