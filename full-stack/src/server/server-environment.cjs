const { Logging } = require("./server-logging.cjs")
const crypto = require("crypto")
const path = require("path")
const fs = require("fs").promises

async function CreateDefaultEnvFile(isBuild = false) {
    let pathServer = ""
    if (isBuild) {
        const pathDist = path.join(__dirname, "..", "..", "dist")
        pathServer = path.join(pathDist, "server")
    } else {
        pathServer = path.join(__dirname)
    }
    try {
        const fullPath = path.join(pathServer, ".env")
        await fs.access(fullPath)
        Logging.LogWarning(`Default .env file already exists in ${path.join(fullPath)} skipping environment variables .env file creation`)
    } catch (err) {
        const defaultPrivateKey = crypto.randomBytes(32).toString("hex")

        const defaultEnvContent = `# .env file for server environment variables

PRIVATE_PORT=5774
PUBLIC_PORT=5775
LOCAL_PORT=5776
PRIVATE_KEY=${defaultPrivateKey}

`

        // TODO FIND MORE ENV VARIABLES IN THE PROJECT FOR MANIUPLATION ON THE DESKTOP APP COLORS, WEBSITE NAME, ETC

        try {
            await fs.writeFile(path.join(pathServer, ".env"), defaultEnvContent)
            Logging.LogProcess(`Default .env file created in ${pathServer}`)
        } catch (err) {
            Logging.LogError(`Error creating default .env file in dist/server: ${err}`)
        }
    }
}

const env = {
    CreateDefaultEnvFile,
}

module.exports.env = env
