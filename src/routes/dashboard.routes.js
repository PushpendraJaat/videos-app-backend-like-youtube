import Router from "express"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {getChannelStats, getChannelVideos} from "../controllers/dashboard.controller.js"

const router = new Router()

router.route("/user-videos").get(verifyJWT, getChannelVideos)
router.route("/user-channel-stats").get(verifyJWT, getChannelStats)

export default router