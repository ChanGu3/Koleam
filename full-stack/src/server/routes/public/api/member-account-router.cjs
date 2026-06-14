const express = require("express")
const memberRouter = express.Router()
const memberController = require("../../../controllers/api-controllers/auth/member-controller.cjs")

//
// success authorization
//
memberRouter.get("/", memberController.MemberGetSingleMember)

// EMAIL/PASSWORD UPDATES

memberRouter.put("/email", memberController.MemberUpdateEmail)

memberRouter.put("/password", memberController.MemberUpdatePassword)

// any other data can be dealt with in one route that is the members  (=

module.exports = memberRouter
