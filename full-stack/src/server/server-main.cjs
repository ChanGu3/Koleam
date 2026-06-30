// TODO: ENVIRONMENT VARIABLES AND PRIVATE SERVER SETUP FOR DESKTOP APP USAGE
require("dotenv").config()
async function StartServer() {
    const minimist = require("minimist")
    const argv = minimist(process.argv.slice(2))
    const isDev = argv.dev === true || argv.d === true
    const { Logging } = require("./server-logging.cjs")
    isDev ? Logging.LogProcess("starting development process") : Logging.LogProcess("starting production process")

    if (isDev) {
        const { env } = require("./server-environment.cjs")
        const defaultCreated = await env.CreateDefaultEnvFile(false)

        if (defaultCreated) {
            return Logging.LogDev("please restart the server! the env file has been created and the server needs to be restarted to load the new environment variables")
        }
    }

    const PRIVATE_PORT = process.env.PRIVATE_PORT
    const PUBLIC_PORT = process.env.PUBLIC_PORT
    const LOCAL_PORT = process.env.LOCAL_PORT
    const SESSION_SECRET_KEY = process.env.SESSION_SECRET_KEY

    const path = require("path")
    const express = require("express")
    const session = require("express-session")
    const cookieParser = require("cookie-parser")
    const controller = require("./controllers/server-controller.cjs")

    const apiRouter = require("./routes/public/public-api-router.cjs")

    const local_api_router = require("./routes/local/local-api-router.cjs")

    const private_admin_router = require("./routes/private/admin-router.cjs")

    const private_enviroment_router = require("./routes/private/environment-router.cjs")

    // --- DATABASE SETUP DO NOT REMOVE
    const database = require("./models/database.cjs")
    // --- DATABASE SETUP

    const public_app = express()
    const local_app = express()
    const private_api_only = express()

    function PrivateSetup() {
        private_api_only.use(express.json())

        private_api_only.use(controller.VerifyPrivateAccess)

        // All Routes after VerifyPrivateAccess will require the correct private key to access and should be done so that way

        private_api_only.get("/isOnline", controller.IsPrivateServerOnline)

        private_api_only.use("/admin", private_admin_router)

        private_api_only.use("/environment", private_enviroment_router)

        private_api_only.listen(PRIVATE_PORT, "127.0.0.1", () => {
            Logging.LogProcess(`server running on http://localhost:${PRIVATE_PORT} Privately`)
        })
    }

    function LocalAppSetup() {
        //
        // - Initalizes Cookies Setup -
        //
        local_app.use(cookieParser(SESSION_SECRET_KEY))
        local_app.use(
            session({
                secret: SESSION_SECRET_KEY,
                resave: false,
                saveUninitialized: false,
                rolling: true,
                cookie: {
                    maxAge: 1000 * 60 * 45, // 45 minutes
                    httpOnly: true,
                    secure: false,
                },
            })
        )

        //
        // - Enables JSON Traffic -
        //
        local_app.use(express.json())

        //
        // - Allow Development React Host To Access Server During Development Only -
        //
        if (isDev) {
            const cors = require("cors")
            local_app.use(
                cors({
                    origin: "http://localhost:5173",
                    credentials: true,
                })
            )
        }

        //
        // - API Routing -
        //
        local_app.use("/api", local_api_router)

        //
        // - Resets Cookies Session Based On Session Existence In Database -
        //
        local_app.use(controller.CookieChecker)

        //
        // - Serves Build Only Files For The Web Interface -
        //
        if (!isDev) {
            //
            // - Serves Static Files From Build -
            //
            local_app.use(express.static(path.join(__dirname, "..", "web-client")))

            //
            // - Serves URL Routes From Build -
            //
            local_app.get("/*splat", (req, res) => {
                res.sendFile(path.join(__dirname, "..", "web-client", "index.html"))
            })
        }

        local_app.listen(LOCAL_PORT, "0.0.0.0", () => {
            Logging.LogProcess(`server running on http://localhost:${LOCAL_PORT} Locally`)
        })
    }

    function PublicAppSetup() {
        //
        // - Initalizes Cookies Setup -
        //
        public_app.use(cookieParser(SESSION_SECRET_KEY))
        public_app.use(
            session({
                secret: SESSION_SECRET_KEY,
                resave: false,
                saveUninitialized: false,
                rolling: true,
                cookie: {
                    maxAge: 1000 * 60 * 45, // 45 minutes
                    httpOnly: true,
                    secure: false,
                },
            })
        )

        //
        // - Enables JSON Traffic -
        //
        public_app.use(express.json())

        //
        // - Allow Development React Host To Access Server During Development Only -
        //
        if (isDev) {
            const cors = require("cors")
            public_app.use(
                cors({
                    origin: "http://localhost:5173",
                    credentials: true,
                })
            )
        }

        //
        // - API Routing -
        //
        public_app.use("/api", apiRouter)

        //
        // - Resets Cookies Session Based On Session Existence In Database -
        //
        public_app.use(controller.CookieChecker)

        //
        // - Serves Build Only Files For The Web Interface -
        //
        if (!isDev) {
            //
            // - Serves Static Files From Build -
            //
            public_app.use(express.static(path.join(__dirname, "..", "web-client")))

            //
            // - Serves URL Routes From Build -
            //
            public_app.get("/*splat", (req, res) => {
                res.sendFile(path.join(__dirname, "..", "web-client", "index.html"))
            })
        }

        //
        // - SERVER PORT -
        //
        public_app.listen(PUBLIC_PORT, "0.0.0.0", () => {
            Logging.LogProcess(`server running on http://localhost:${PUBLIC_PORT} Publicly`)
        })
    }

    PrivateSetup()
    LocalAppSetup()
    PublicAppSetup()
}

StartServer()
