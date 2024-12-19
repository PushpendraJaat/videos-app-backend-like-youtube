import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const userId = req.user?._id;
    if (!userId) throw new ApiError(401, "Unauthorized user");

    let totalvideoLike = 0;
    let totalvideoViews = 0;

    try {
        const totalSubscribers = await Subscription.countDocuments({ channel: userId });
        const videos = await Video.find({ owner: userId }).lean();
        const totalVideos = videos.length;

        videos.forEach(video => {
            totalvideoViews += video.views;
        })

        // for (const video of videos) {
        //     const videoLike = await Like.find({ video: video._id }).lean()
        //     totalvideoLike += videoLike.length;
        // }
        const videoIds = videos.map(video => video._id);
        const totalvideoLike = await Like.countDocuments({ video: { $in: videoIds } });

        return res.status(200)
            .json(new ApiResponse(200, { totalVideos, totalvideoViews, totalvideoLike, totalSubscribers, videos }, "Videos fetched successfully"))

    } catch (error) {
        throw new ApiError(500, error.message || "Internal server error")
    }

})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const userId = req.user?._id;
    if (!userId) throw new ApiError(401, "Unauthorized user");

    try {
        const videos = await Video.find({ owner: userId }).lean()
        const totalVideos = videos.length;

        return res.status(200)
            .json(new ApiResponse(200, { totalVideos, videos }, "Videos fetched successfully"))

    } catch (error) {
        throw new ApiError(500, "Internal server error")
    }

})

export {
    getChannelStats,
    getChannelVideos
}