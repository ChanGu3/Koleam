const express = require("express")
const authentifyRouter = express.Router()
const authentifyController = require("../../../../controllers/api-controllers/auth/authentify-controller.cjs")

//
// Sign In
//
authentifyRouter.post("/signin/member", authentifyController.AttemptMemberSignIn)

//
// Sign Out
//
authentifyRouter.post("/signout/member", authentifyController.AttemptSignOut)

//
// Sign Up
//
authentifyRouter.post("/signup/member", authentifyController.AttemptMemberSignUp, authentifyController.AttemptMemberSignIn)

module.exports = authentifyRouter
