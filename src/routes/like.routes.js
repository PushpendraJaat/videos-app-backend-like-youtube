import Router from "express"
import { toggleVideoLike,toggleCommentLike, toggleTweetLike, getLikedVideos } from "../controllers/like.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = new Router()

//secure routes
router.route("/videoLikeToggle/:videoId").post(verifyJWT, toggleVideoLike)
router.route("/commentLikeToggle/:commentId").post(verifyJWT, toggleCommentLike)
router.route("/tweetLikeToggle/:tweetId").post(verifyJWT, toggleTweetLike)
router.route("/getLikedVideos").get(verifyJWT, getLikedVideos)

export default router