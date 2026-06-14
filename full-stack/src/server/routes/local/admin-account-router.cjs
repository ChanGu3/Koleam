const express = require("express")
const adminController = require("../../controllers/api-controllers/auth/admin-controller.cjs")

const adminAccountRouter = express.Router()

adminAccountRouter.get("/", adminController.AdminGetSingleAdmin)
adminAccountRouter.put("/password", adminController.AdminUpdatePassword)


module.exports = adminAccountRouter
