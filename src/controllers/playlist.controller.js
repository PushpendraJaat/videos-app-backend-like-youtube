import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    //TODO: create playlist
    const userId = req?.user?._id

    if(!name || !description){
        throw new ApiError(400, "Name and description of playlist is required")
    }

    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user id")
    }

    const playlist = await Playlist.create({
        name: name,
        description: description,
        videos: [],
        user: userId
    })

    if(!playlist){
        throw new ApiError(500, "Failed to create playlist")
    }

    return res.status(201)
    .json(new ApiResponse(201, playlist, "Playlist created successfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if(!userId){
        throw new ApiError(400, "UserId is required")
    }

    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user id")
    }

    const totolPlaylists = await Playlist.countDocuments({user: userId})
    const playlists = await Playlist.find({user: userId})
    

    return res.status(200)
    .json(new ApiResponse(200, {totolPlaylists, playlists}, "Playlists fetched successfully"))
    
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if(!playlistId){
        throw new ApiError(400, "Playlist id is required")
    }

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist id")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404, "Playlist not found")
    }

    return res.status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!playlistId || !videoId){
        throw new ApiError(400, "playlistId and videoId is required")
    }

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid plalistId or videoId")
    }

    const playlist = await Playlist.findByIdAndUpdate(playlistId,
        {
            $addToSet: {
                videos: videoId
            }
        },
        {
            new: true
        }
    )

    if(!playlist){
        throw new ApiError(404, "Playlist not found")
    }

    return res.status(200)
    .json(new ApiResponse(200, playlist, "Video added in playlist"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if(!playlistId || !videoId){
        throw new ApiError(400, "playlistId and videoId is required")
    }

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid plalistId or videoId")
    }

    const playlist = await Playlist.findOneAndUpdate(
        { _id: playlistId, videos: videoId },
        {
            $pull: {
                videos: videoId
            }
        },
        {
            new: true
        }
    )

    if (!playlist) {
        throw new ApiError(404, "Video not found in the playlist or Playlist not found");
    }

   
    return res.status(200)
    .json(new ApiResponse(200, playlist, "Video removed from playlist"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if (!playlistId) {
        throw new ApiError(400, "Playlist ID is required")
    }

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid Playlist ID")
    }

    const delPlaylist = await Playlist.findByIdAndDelete(playlistId)

    if(!delPlaylist){
        throw new ApiError(404, "Playlist not found")
    }
    
    return res.status(200)
    .json(new ApiResponse(200, delPlaylist, "Playlist Deleted Successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if (!playlistId) {
        throw new ApiError(400, "Playlist ID is missing")
    }

    if(!name || !description){
        throw new ApiError(400, "Name and Description is required")
    }

    const playlist = await Playlist.findByIdAndUpdate(playlistId,
        {
            $set: {
                name,
                description
            }
        },
        {
            new: true
        }
    )

    if(!playlist){
        throw new ApiError(404, "Playlist not found")
    }

    return res.status(200)
    .json(new ApiResponse(200, playlist, "Playlist updated successfully"))

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}