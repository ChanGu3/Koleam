const express = require("express")
const authentificationController = require("../../../controllers/api-controllers/auth/authentify-controller.cjs")
const authentifyRouter = express.Router()

//
// Sign In
//
authentifyRouter.post("/signin/admin", authentificationController.AttemptAdminSignIn)

//
// Sign Out
//
authentifyRouter.post("/signout/admin", authentificationController.AttemptSignOut)

module.exports = authentifyRouter
