import mongoose, { isValidObjectId } from "mongoose"
import { Comment } from "../models/comment.model..js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if(!videoId){
        throw new ApiError(400, "Video id is missing")
    }

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id")
    }

    const totalComments = await Comment.countDocuments({video: videoId})
    const comments = await Comment.find({video: videoId})
    .skip((page - 1) * parseInt(limit))
    .limit(parseInt(limit))


    return res.status(200)
    .json(new ApiResponse(200, {totalComments, comments}, "Comments fetched successfully"))
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params;
    const user = req?.user;
    const { commentContent } = req.body;

    if (!commentContent) {
        throw new ApiError(400, "Comment is missing")
    }

    if (!user?._id) {
        throw new ApiError(400, "Invalid User")
    }

    if (!videoId) {
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
    const { commentContent } = req.body
    const { commentId } = req.params

    if (!commentContent) {
        throw new ApiError(400, "Updated Comment is required")
    }

    if (!commentId) {
        throw new ApiError(400, "Comment id is required")
    }

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment id")
    }

    const comment = await Comment.findOneAndUpdate(
        { _id: commentId },
        {
           $set: {
            content: commentContent
           } 
        },
        { new: true }
    )

    if(!comment){
        throw new ApiError(500, "Error while updating comment")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, comment , "Comment updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params

    if(!commentId){
        throw new ApiError(400, "Comment ID is missing")
    }

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment id")
    }

    const delComment = await Comment.findByIdAndDelete(commentId)

    if(!delComment){
        throw new ApiError(404, "Comment not found or already deleted")
    }

    return res.status(200)
    .json(new ApiResponse(200, "Comment deleted successfully"))
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}