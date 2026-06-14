const express = require("express")
const multer = require("multer")
const titleController = require("../../../controllers/api-controllers/title/title-controller.cjs")
const adminTitleRouter = express.Router()

const multerUpload = multer({ storage: multer.memoryStorage() })

adminTitleRouter.post("/", multerUpload.fields([{ name: "titleCover", maxCount: 1 }]), titleController.AddTitle)

adminTitleRouter.put("/:titleID", multerUpload.fields([{ name: "titleCover", maxCount: 1 }]), titleController.UpdateTitle)

adminTitleRouter.delete("/:titleID", titleController.DeleteTitle)

adminTitleRouter.post("/installment", titleController.AddInstallment)

adminTitleRouter.put("/installment/:installmentID", titleController.UpdateInstallment)

adminTitleRouter.delete("/installment/:installmentID", titleController.DeleteInstallment)

adminTitleRouter.post("/stream", multerUpload.fields([{ name: "streamThumbnail", maxCount: 1 }]), titleController.AddStream)

adminTitleRouter.put("/stream/:streamID", multerUpload.fields([{ name: "streamThumbnail", maxCount: 1 }]), titleController.UpdateStream)

adminTitleRouter.delete("/stream/:streamID", titleController.DeleteStream)

adminTitleRouter.post("/genre", titleController.AddGenre)

adminTitleRouter.delete("/genre", titleController.DeleteGenre)

/* --- MEDIA UPLOADS --- */

adminTitleRouter.post("/stream/:streamID/video", titleController.stream.AddStreamVideo)

adminTitleRouter.post("/stream/:streamID/audio", titleController.stream.AddStreamAudio)

adminTitleRouter.post("/stream/:streamID/subtitle", titleController.stream.AddStreamSubtitle)

adminTitleRouter.delete("/stream/:streamID/video", titleController.stream.DeleteStreamVideo)

adminTitleRouter.delete("/stream/:streamID/audio/:label", titleController.stream.DeleteStreamAudio)

adminTitleRouter.delete("/stream/:streamID/subtitle/:label", titleController.stream.DeleteStreamSubtitle)

adminTitleRouter.put("/stream/:streamID/video", titleController.stream.UpdateStreamVideo)

adminTitleRouter.put("/stream/:streamID/audio/:label", titleController.stream.UpdateStreamAudio)

adminTitleRouter.put("/stream/:streamID/subtitle/:label", titleController.stream.UpdateStreamSubtitle)

adminTitleRouter.get("/stream/:streamID/video/render", titleController.stream.StreamVideoRenderInfo)

adminTitleRouter.get("/stream/:streamID/audio/:label/render", titleController.stream.StreamAudioRenderInfo)

adminTitleRouter.get("/stream/:streamID/subtitle/:label/render", titleController.stream.StreamSubtitleRenderInfo)

module.exports = adminTitleRouter
