import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    if (!channelId) throw new ApiError(400, "Channel ID is required");

    if (!isValidObjectId(channelId)) throw new ApiError(400, "Invalid channel ID");

    const userId = req.user?._id;
    if (!userId) throw new ApiError(401, "Unauthorized user");

    try {
        const subscriberToggle = await Subscription.findOneAndUpdate({ subscriber: userId, channel: channelId },
            [
                {
                    $set: {
                        isSubscribed: { $not: "$isSubscribed" }
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
            .json(new ApiResponse(200, subscriberToggle, "Subscription toggled successfully"))

    } catch (error) {
        throw new ApiError(500, error.message, "Error while toggling subscription")
    }
})



// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {

    const userId = req.user?._id;
    if (!userId) throw new ApiError(401, "Unauthorized user");

    try {
        const userChannelSubscriber = await Subscription.find({
            channel: userId
        }).lean()
        const totalSubscriber = userChannelSubscriber.length;

        return res.status(200)
            .json(new ApiResponse(200, { totalSubscriber, userChannelSubscriber }, "User channel subscriber fetched successfully"))


    } catch (error) {
        throw new ApiError(500, error.message, "Error while fetching user channel subscribers")
    }


})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    // const { subscriberId } = req.params
    const userId = req.user?._id;
    if (!userId) throw new ApiError(401, "Unauthorized user");

    try {
        const userSubscribedChannel = await Subscription.find({
            subscriber: userId, isSubscribed: true
        }).lean()

        const totalSubscribedChannel = userSubscribedChannel.length;

        return res.status(200)
            .json(new ApiResponse(200, { totalSubscribedChannel, userSubscribedChannel }, "Channel Subscribed by user fetched successfully"))

    } catch (error) {
        throw new ApiError(500, error.message, "Error while fetching user channel subscribers")
    }
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}