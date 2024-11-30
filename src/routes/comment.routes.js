import { Router } from "express";
import { addComment, deleteComment, updateComment, getVideoComments } from "../controllers/comment.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/getVideoComments/:videoId").get(getVideoComments)

//video comments secure routes
router.route("/:videoId/comments").post(verifyJWT, addComment)
router.route("/updateComment/:commentId").patch(verifyJWT, updateComment)
router.route("/deleteComment/:commentId").delete(verifyJWT, deleteComment)


export default router