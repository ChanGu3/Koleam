const express = require("express")
const authorizeRouter = express.Router()
const authorizationController = require("../../../controllers/api-controllers/auth/authorize-controller.cjs")

authorizeRouter.get("/admin", authorizationController.AuthorizeAdmin, authorizationController.Authorized)

module.exports = authorizeRouter
