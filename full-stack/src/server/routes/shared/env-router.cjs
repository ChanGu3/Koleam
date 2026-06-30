const express = require("express")
const serverController = require("../../controllers/server-controller.cjs")

const envRouter = express.Router()

envRouter.get("/COLORS", serverController.GetEnvColorsForWebsite)

envRouter.get("/LABELS/WEBSITE_NAME", serverController.GetWebsiteName)

module.exports = envRouter
