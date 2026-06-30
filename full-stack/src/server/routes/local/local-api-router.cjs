const express = require("express")
const multer = require("multer")

const multerUpload = multer({ storage: multer.memoryStorage() })

const authorizeController = require("../../controllers/api-controllers/auth/authorize-controller.cjs")
const uploadsController = require("../../controllers/uploads-controller.cjs")

const apiRouter = express.Router()

const authentifyRouter = require("../local/auth/admin-authentify-router.cjs")
const authorizeRouter = require("../local/auth/admin-authorize-router.cjs")
const titleRouter = require("../shared/title-router.cjs")
const adminTitleRouter = require("../local/title/admin-title-router.cjs")
const adminModerationRouter = require("./moderation/admin-moderation-router.cjs")
const adminAccountRouter = require("./admin-account-router.cjs")
const envRouter = require("../shared/env-router.cjs")
const serverController = require("../../controllers/server-controller.cjs")

//
// - Auth -
//
apiRouter.use("/authentify", authentifyRouter)

apiRouter.use("/authorize", authorizeRouter)

//
// - Title -
//
apiRouter.use("/title", authorizeController.AuthorizeAdmin, titleRouter, adminTitleRouter)

//
// - Temp Uploads -
//
apiRouter.put("/temp/upload/chunk", authorizeController.AuthorizeAdmin, multerUpload.fields([{ name: "tempChunk", maxCount: 1 }]), uploadsController.UploadChunkToTempFile)
apiRouter.delete("/temp/upload/chunk", authorizeController.AuthorizeAdmin, uploadsController.DeleteTempFile)

//
// - Moderation -
//
apiRouter.use("/moderation", authorizeController.AuthorizeAdmin, adminModerationRouter)

//
// - Account -
//
apiRouter.use("/account/admin", authorizeController.AuthorizeAdmin, adminAccountRouter)

//
// - Environment Variables -
//
apiRouter.use("/env/PORT", serverController.GetPortForLocal)

apiRouter.use("/env", envRouter)

module.exports = apiRouter
