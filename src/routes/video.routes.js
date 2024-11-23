import { Router } from "express";
import { publishAVideo, getVideoById, updateVideo, deleteVideo } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/access-video/:videoId").get(getVideoById)


//secure routes
router.route("/video-publish").post(verifyJWT,
    upload.fields([
        {
            name: "video",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    publishAVideo)
router.route("/updateVideo/:videoId").patch(verifyJWT, upload.single("thumbnail"), updateVideo)
router.route("/deleteVideo/:videoId").delete(verifyJWT, deleteVideo)



export default router