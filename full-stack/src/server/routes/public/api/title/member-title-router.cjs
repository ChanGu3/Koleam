const express = require("express")
const memberController = require("../../../../controllers/api-controllers/auth/member-controller.cjs")

const memberTitleRouter = express.Router()

// FAVORITE

memberTitleRouter.get("/favorite", memberController.MemberGetAllTitleFavorite)

memberTitleRouter.get("/:titleID/favorite", memberController.MemberGetTitleFavorite)

memberTitleRouter.post("/:titleID/favorite", memberController.MemberAddTitleFavorite)

memberTitleRouter.delete("/:titleID/favorite", memberController.MemberDeleteTitleFavorite)

/// RATING

memberTitleRouter.get("/:titleID/rating", memberController.MemberGetTitleRating)

memberTitleRouter.post("/:titleID/rating", memberController.MemberAddTitleRating)

memberTitleRouter.put("/:titleID/rating", memberController.MemberUpdateTitleRating)

memberTitleRouter.delete("/:titleID/rating", memberController.MemberDeleteTitleRating)

/// LIKE

memberTitleRouter.get("/stream/:streamID/like", memberController.MemberGetStreamLike)

memberTitleRouter.post("/stream/:streamID/like", memberController.MemberAddStreamLike)

memberTitleRouter.delete("/stream/:streamID/like", memberController.MemberDeleteStreamLike)

/// HISTORY

memberTitleRouter.get("/stream/lastwatched", memberController.MemberGetAllAnimeStreamHistory)

memberTitleRouter.get("/stream/lastwatched/:streamID", memberController.MemberGetSingleAnimeStreamHistory)

memberTitleRouter.put("/stream/lastwatched/:streamID", memberController.MemberLogStreamWatchedStreamHistory)

module.exports = memberTitleRouter
