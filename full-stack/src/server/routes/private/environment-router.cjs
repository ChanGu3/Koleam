const express = require("express")
const privateEnvironmentRouter = express.Router()
const { GetAllPorts, UpdateAllPorts, ResetSessionKey, ResetPrivateKey, GetEnvColorsForWebsite, UpdateEnvColorsForWebsite } = require("../../controllers/server-controller.cjs")

// TODO: ENVIRONMENT .env FILE CHANGES CHANGES

privateEnvironmentRouter.get("/PORTS", GetAllPorts)

privateEnvironmentRouter.put("/PORTS", UpdateAllPorts)

privateEnvironmentRouter.get("/KEYS/PRIVATE", ResetPrivateKey)
privateEnvironmentRouter.get("/KEYS/SESSION", ResetSessionKey)

privateEnvironmentRouter.get("/COLORS", GetEnvColorsForWebsite)
privateEnvironmentRouter.put("/COLORS", UpdateEnvColorsForWebsite)

module.exports = privateEnvironmentRouter
