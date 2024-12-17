import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { response } from "express"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle like on video
    if (!videoId) {
        throw new ApiError(400, "Video ID is required")
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID")
    }

    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized User")
    }

    try {
        const like = await Like.findOneAndUpdate({ video: videoId, likedBy: userId },
            [
                {
                    $set: {
                        isLiked: { $not: "$isLiked" }
                    }
                }
            ],
            {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true
            }
        )
        return res.status(200)
            .json(new ApiResponse(200, like, "Like Toggled"))
    } catch (error) {
        throw new ApiError(500,error, "Failed to toggle like")
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    //TODO: toggle like on comment
    if (!commentId) throw new ApiError(400, "Comment ID is required");

    if (!isValidObjectId(commentId)) throw new ApiError(400, "Invalid Comment ID");

    const userId = req.user?._id;
    if (!userId) throw new ApiError(400, "Invalid User ID ");

    try {
        const commentLike = await Like.findOneAndUpdate({ comment: commentId, likedBy: userId },
            [
                {
                    $set: {
                        isLiked: { $not: "$isLiked" }
                    }
                }
            ],
            {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true
            }
        )
        return res.status(200)
            .json(new ApiResponse(200,commentLike, "Comment Like Toggled"))

    } catch (error) {
        throw new ApiError(500, error,"Error in comment like toggle")
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    //TODO: toggle like on tweet
    if (!tweetId) throw new ApiError(400, "Tweet ID is required");

    if (!isValidObjectId(tweetId)) throw new ApiError(400, "Invalid Tweet ID");

    const userId = req.user?._id;
    if (!userId) throw new ApiError(400, "Invalid User");

    try {
        const tweetLike = await Like.findOneAndUpdate({ tweet: tweetId, likedBy: userId },
            [
                {
                    $set: {
                        isLiked: {$not: "$isLiked"}
                    }
                }
            ],
            {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true
            }
        )
        return res.status(200)
        .json(new ApiResponse(200, tweetLike, "Tweet Like Toggled"))

    } catch (error) {
        throw new ApiError(500, error, "Error in tweet like toggle")
    }
})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const userId = req.user?._id;
    if(!userId) throw new ApiError(400, "Invalid User");

    try {
        const likedVideos = await Like.find({
            likedBy: userId,
            video: { $exists: true }
        }).populate("video").lean();

        const TotalLikedVideos = likedVideos.length;
    
        return res.status(200)
        .json(new ApiResponse(200, {TotalLikedVideos, likedVideos}, "Liked videos fetched successfully"))

    } catch (error) {
        console.error("Error fetching liked videos:", error.message);
        throw new ApiError(500, "An error occurred while fetching liked videos");
    }
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}