import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createPlaylist, getUserPlaylists, getPlaylistById, addVideoToPlaylist, removeVideoFromPlaylist, deletePlaylist, updatePlaylist } from "../controllers/playlist.controller.js";

const router = Router()

//public routes
router.route("/user-playlist/:userId").get(getUserPlaylists)
router.route("/get-playlist/:playlistId").get(getPlaylistById)

//secure routes
router.route("/new-playlist").post(verifyJWT, createPlaylist)
router.route("/add-video-to-playlist/:playlistId/:videoId").patch(verifyJWT, addVideoToPlaylist)
router.route("/remove-video-from-playlist/:playlistId/:videoId").patch(verifyJWT, removeVideoFromPlaylist)
router.route("/delete-playlist/:playlistId").delete(verifyJWT, deletePlaylist)
router.route("/update-playlist/:playlistId").patch(verifyJWT, updatePlaylist)

export default router