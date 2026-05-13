const express = require("express")
const authorizeRouter = express.Router()
const authorizeController = require("../../../../controllers/api-controllers/auth/authorize-controller.cjs")

//
// Member
//
authorizeRouter.use("/member", authorizeController.AuthorizeMember, authorizeController.Authorized)

module.exports = authorizeRouter
