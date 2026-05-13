const express = require("express")
const adminRouter = express.Router()
const modMembersRouter = require("../moderation/admin-member-mod-router.cjs")

adminRouter.use("/members", modMembersRouter)

module.exports = adminRouter
