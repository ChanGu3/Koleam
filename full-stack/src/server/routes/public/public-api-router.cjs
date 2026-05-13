const express = require("express")
const apiRouter = express.Router()
const memberAuthentifyRouter = require("./api/auth/member-authentify-router.cjs")
const memberAuthorizeRouter = require("./api/auth/member-authorize-router.cjs")
const titleRouter = require("../public/api/title/title-router.cjs")
const memberAccountRouter = require("./api/member-account-router.cjs")

apiRouter.use("/authentify", memberAuthentifyRouter)

apiRouter.use("/authorize", memberAuthorizeRouter)

apiRouter.use("/title", titleRouter)

apiRouter.use("/account/member", memberAccountRouter)

module.exports = apiRouter
