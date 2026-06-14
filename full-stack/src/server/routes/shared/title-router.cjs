const express = require("express")
const titleController = require("../../controllers/api-controllers/title/title-controller.cjs")
const uploadsController = require("../../controllers/uploads-controller.cjs")

const titleRouter = express.Router()

// Static routes should be defined before dynamic routes
titleRouter.get("/", titleController.GetAllTitles)
titleRouter.get("/genre", titleController.GetAllGenres)
titleRouter.get("/installment", titleController.GetAllInstallments)
titleRouter.get("/stream", titleController.GetAllTitleInstallmentStream)

// More specific dynamic routes first
titleRouter.get("/stream/:streamID/likes", titleController.GetTitleInstallmentStreamLikes)
titleRouter.get("/stream/:streamID/*filename", uploadsController.GetStreamUploads)

// Generic dynamic routes
titleRouter.get("/genre/:genreName", titleController.GetSingleGenre)
titleRouter.get("/installment/:installmentID", titleController.GetSingleInstallment)
titleRouter.get("/stream/:streamID", titleController.GetSingleTitleInstallmentStream)

//
//  Gets Title Cover Image From uploads
//
titleRouter.get("/:titleID/:filename", uploadsController.GetTitleUploads)

// The most generic dynamic route should be last to avoid shadowing other routes
titleRouter.get("/:titleID", titleController.GetSingleTitle)

module.exports = titleRouter
