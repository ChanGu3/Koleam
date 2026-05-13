const express = require("express")
const adminController = require("../../controllers/api-controllers/auth/admin-controller.cjs")

const adminAccountRouter = express.Router()

adminAccountRouter.get("/", adminController.AdminGetSingleAdmin)
adminAccountRouter.delete("/", adminController.AdminDeleteAdmin)
adminAccountRouter.put("/", adminController.AdminUpdatePassword)
adminAccountRouter.put("/", adminController.AdminUpdateUsername)

module.exports = adminAccountRouter
