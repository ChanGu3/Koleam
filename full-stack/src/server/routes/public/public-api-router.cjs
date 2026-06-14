const express = require("express")
const apiRouter = express.Router()
const memberAuthentifyRouter = require("./api/auth/member-authentify-router.cjs")
const memberAuthorizeRouter = require("./api/auth/member-authorize-router.cjs")
const titleRouter = require("../shared/title-router.cjs")
const titleMemberRouter = require("../public/api/title/member-title-router.cjs")
const memberAccountRouter = require("./api/member-account-router.cjs")
const { AuthorizeMember } = require("../../controllers/api-controllers/auth/authorize-controller.cjs")

apiRouter.use("/authentify", memberAuthentifyRouter)

apiRouter.use("/authorize", memberAuthorizeRouter)

apiRouter.use("/title/member", titleMemberRouter)

apiRouter.use("/title", titleRouter)

apiRouter.use("/account/member", AuthorizeMember, memberAccountRouter)

module.exports = apiRouter
