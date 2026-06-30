const express = require("express")
const privateAdminRouter = express.Router()
const { AdminUpdateSingleAdmin, DeleteAdmin, GetAllAdmin, AddAdmin } = require("../../controllers/api-controllers/auth/admin-controller.cjs")

// TODO: PRIVATE ADMIN ROUTES FOR DESKTOP APP TO CONNECT TO FOR MORE SECURE LOGIC

privateAdminRouter.get("/", GetAllAdmin)

privateAdminRouter.delete("/:username", DeleteAdmin)

privateAdminRouter.post("/:username", AddAdmin)

privateAdminRouter.put("/:username", AdminUpdateSingleAdmin)

module.exports = privateAdminRouter
