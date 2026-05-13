const express = require("express")
const memberController = require("../../../controllers/api-controllers/auth/member-controller.cjs")

const modMembersRouter = express.Router()

modMembersRouter.get("/", memberController.GetAllMembers)
modMembersRouter.get("/:email", memberController.GetSingleMember)
modMembersRouter.delete("/:email", memberController.DeleteMember)

module.exports = modMembersRouter
