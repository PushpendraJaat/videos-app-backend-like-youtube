import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { toggleSubscription } from "../controllers/subscription.controller.js";

const router = Router()

//secure routes
router.route("/toggle-subscription/:channelId").get(verifyJWT, toggleSubscription)


export default router