const express = require("express")
const authentifyRouter = express.Router()
const authentifyController = require("../../../../controllers/api-controllers/auth/authentify-controller.cjs")

//
// Sign In
//
authentifyRouter.post("/signin", authentifyController.AttemptMemberSignIn)

//
// Sign Out
//
authentifyRouter.post("/signout", authentifyController.AttemptSignOut)

//
// Sign Up
//
authentifyRouter.post("/signup", authentifyController.AttemptMemberSignUp, authentifyController.AttemptMemberSignIn)

module.exports = authentifyRouter
