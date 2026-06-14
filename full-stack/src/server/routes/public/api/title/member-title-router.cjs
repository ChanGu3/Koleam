const express = require("express")
const memberController = require("../../../../controllers/api-controllers/auth/member-controller.cjs")

const memberTitleRouter = express.Router()

// FAVORITE

memberTitleRouter.get("/favorite", memberController.MemberGetAllTitleFavorite)

memberTitleRouter.get("/:titleID/favorite", memberController.MemberGetTitleFavorite)

memberTitleRouter.put("/:titleID/favorite", memberController.MemberUpdateTitleFavorite)

/// RATING

memberTitleRouter.get("/:titleID/rating", memberController.MemberGetTitleRating)

memberTitleRouter.put("/:titleID/rating", memberController.MemberUpdateTitleRating)

/// LIKE

memberTitleRouter.get("/stream/:streamID/like", memberController.MemberGetStreamLike)

memberTitleRouter.put("/stream/:streamID/like", memberController.MemberUpdateStreamLike)

/// HISTORY

memberTitleRouter.get("/stream/lastwatched", memberController.MemberGetAllTitleStreamHistory)

memberTitleRouter.get("/stream/lastwatched/:streamID", memberController.MemberGetSingleTitleStreamHistory)

memberTitleRouter.put("/stream/lastwatched/:streamID", memberController.MemberLogStreamWatchedStreamHistory)

memberTitleRouter.delete("/stream/lastwatched/:streamID", memberController.MemberDeleteStreamWatchedStreamHistory)

module.exports = memberTitleRouter
