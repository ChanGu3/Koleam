const express = require("express")
const authorizeController = require("../../../../controllers/api-controllers/auth/authorize-controller.cjs")
const titleController = require("../../../../controllers/api-controllers/title/title-controller.cjs")
const uploadsController = require("../../../../controllers/uploads-controller.cjs")
const memberTitleRouter = require("../title/member-title-router.cjs")

const titleRouter = express.Router()

titleRouter.get("/", titleController.GetAllTitles)

titleRouter.get("/:titleID", titleController.GetSingleTitle)

//
//  Gets Title Cover Image From uploads
//
titleRouter.get("/:titleID/:filename", uploadsController.GetTitleUploads)

titleRouter.get("/genre", titleController.GetAllGenres)

titleRouter.get("/genre/:genreName", titleController.GetSingleGenre)

titleRouter.get("/installment", titleController.GetAllInstallments)

titleRouter.get("/installment/:installmentID", titleController.GetSingleInstallment)

titleRouter.get("/stream", titleController.GetAllTitleInstallmentStream)

titleRouter.get("/stream/:streamID", titleController.GetSingleTitleInstallmentStream)

titleRouter.get("/stream/:streamID/likes", titleController.GetTitleInstallmentStreamLikes)

//
//  Gets Stream Cover Image From uploads
//
titleRouter.get("/stream/:streamID/:filename", uploadsController.GetStreamUploads)

//
// Member Only Routes
//

titleRouter.use("/", authorizeController.AuthorizeMember, memberTitleRouter)

module.exports = titleRouter
