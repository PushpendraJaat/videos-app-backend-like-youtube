import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels } from "../controllers/subscription.controller.js";

const router = Router()

//secure routes
router.route("/toggle-subscription/:channelId").post(verifyJWT, toggleSubscription)
router.route("/getUserSubscription").get(verifyJWT, getUserChannelSubscribers)
router.route("/getUserSubscribedChannel").get(verifyJWT, getSubscribedChannels)



export default router