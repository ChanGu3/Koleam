const express = require("express")
const authorizeController = require("../../controllers/api-controllers/auth/authorize-controller.cjs")

const apiRouter = express.Router()

const authentifyRouter = require("../local/auth/admin-authentify-router.cjs")
const authorizeRouter = require("../local/auth/admin-authorize-router.cjs")
const titleRouter = require("../local/title/admin-title-router.cjs")
const adminModerationRouter = require("./moderation/admin-moderation-router.cjs")
const adminAccountRouter = require("./admin-account-router.cjs")

//
// - Auth -
//
apiRouter.use("/authentify", authentifyRouter)

apiRouter.use("/authorize", authorizeRouter)

//
// - Title -
//
apiRouter.use("/title", authorizeController.AuthorizeAdmin, titleRouter)

//
// - Moderation -
//
apiRouter.use("/moderation", authorizeController.AuthorizeAdmin, adminModerationRouter)

//
// - Account -
//
apiRouter.use("/account/admin", authorizeController.AuthorizeAdmin, adminAccountRouter)

module.exports = apiRouter
