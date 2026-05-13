const express = require("express")
const multer = require("multer")
const upload = multer({ storage: multer.memoryStorage() })
const titleRouter = require("../../public/api/title/title-router.cjs")
const titleController = require("../../../controllers/api-controllers/title/title-controller.cjs")
const adminTitleRouter = express.Router()

adminTitleRouter.get("/", titleRouter)

adminTitleRouter.post("/", upload.fields([{ name: "titleCover", maxCount: 1 }]), titleController.AddTitle)

adminTitleRouter.put("/:titleID", upload.fields([{ name: "titleCover", maxCount: 1 }]), titleController.UpdateTitle)

adminTitleRouter.delete("/:titleID", titleController.DeleteTitle)

adminTitleRouter.post("/installment", titleController.AddInstallment)

adminTitleRouter.put("/installment/:installmentID", titleController.UpdateInstallment)

adminTitleRouter.delete("/installment/:installmentID", titleController.DeleteInstallment)

adminTitleRouter.post("/stream", upload.fields([{ name: "streamThumbnail", maxCount: 1 }]), titleController.AddStream)

adminTitleRouter.put("/stream/:streamID", upload.fields([{ name: "streamThumbnail", maxCount: 1 }]), titleController.UpdateStream)

adminTitleRouter.put("/stream/:streamID", titleController.DeleteStream)

adminTitleRouter.post("/genre", titleController.AddGenre)

adminTitleRouter.delete("/genre", titleController.DeleteGenre)

module.exports = adminTitleRouter
