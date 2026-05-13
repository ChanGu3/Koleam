const express = require("express")
const privateEnvironmentRouter = express.Router()

// TODO: ENVIRONMENT .env FILE CHANGES CHANGES

privateEnvironmentRouter.get("/PORTS", (req, res) => {
    res.status(200).json({ success: "Environment route is working" })
})

module.exports = privateEnvironmentRouter
