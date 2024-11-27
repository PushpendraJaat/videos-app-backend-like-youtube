import mongoose from "mongoose"
import {Comment} from "../models/comment.model..js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { application } from "express"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params;
    const user = req?.user;
    const { commentContent } = req.body;

    if(!commentContent){
        throw new ApiError(400, "Comment is missing")
    }

    if(!user?._id){
        throw new ApiError(400, "Invalid User")
    }

    if(!videoId){
        throw new ApiError(400, "Video resource is missing")
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(videoId) || !mongoose.Types.ObjectId.isValid(user._id)) {
        throw new ApiError(400, "Invalid video or user ID");
    }


    const comment = await Comment.create({
        content: commentContent,
        video: videoId,
        owner: user._id
    })


    return res
    .status(201)
    .json(new ApiResponse(201, comment, "Comment added successfully"))
    
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }