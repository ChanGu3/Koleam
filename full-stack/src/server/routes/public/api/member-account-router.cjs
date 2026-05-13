const express = require("express")
const memberRouter = express.Router()
const authorizeController = require("../../../controllers/api-controllers/auth/authorize-controller.cjs")
const memberController = require("../../../controllers/api-controllers/auth/member-controller.cjs")

//
// success authorization
//
memberRouter.get("/", memberController.MemberGetSingleMember)

// EMAIL/PASSWORD UPDATES

memberRouter.put("/email", memberController.MemberUpdateEmail)

memberRouter.put("/password", memberController.MemberUpdatePassword)

module.exports = memberRouter
