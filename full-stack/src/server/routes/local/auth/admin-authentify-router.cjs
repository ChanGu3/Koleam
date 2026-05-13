const express = require("express")
const authentificationController = require("../../../controllers/api-controllers/auth/authentify-controller.cjs")
const authentifyRouter = express.Router()

//
// Sign In
//
authentifyRouter.post("/admin/signin", authentificationController.AttemptAdminSignIn)

//
// Sign Out
//
authentifyRouter.post("/admin/signout", authentificationController.AttemptSignOut)

module.exports = authentifyRouter
