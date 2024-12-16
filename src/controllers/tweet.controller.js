import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {tweetContent} = req.body
    if(!tweetContent || !tweetContent.trim()){
        throw new ApiError(400, "Tweet is required")
    }

    const user = req.user?.id
    if(!isValidObjectId(user)){
        throw new ApiError(400, "Invalid User")
    }

    const tweet = await Tweet.create({
        owner: user,
        content: tweetContent
    })

    if(!tweet){
        throw new ApiError(500, "Error while saving tweet")
    }

    return res
    .status(201)
    .json(new ApiResponse(201, tweet, "Tweet published successfully"))

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const  {userId}  = req.params

    if(!userId){
        throw new ApiError(400, "User Id is required")
    }

    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid User ID")
    }

    const filter = {owner : userId}
    const tweets = await Tweet.find(filter)

    if(!tweets){
        throw new ApiError(400, "No tweets exist")
    }

    return res.status(200)
    .json(new ApiResponse(200, tweets, "Tweets fetched successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params
    if(!tweetId){
        throw new ApiError(400, "Tweet id is required")
    }
    
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid Tweet ID")
    }

    const {updatedContent} = req.body
    if(!updatedContent){
        throw new ApiError(400, "Tweet Constent is missing")
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(tweetId,
        {
            content: updatedContent
        },
        {
            new: true
        }
    )

    if(!updatedTweet){
        throw new ApiError(500, "Error while updating tweet")
    }

    return res.status(200)
    .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"))

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params
    if(!tweetId){
        throw new ApiError(400, "Tweet id is required")
    }

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid Tweet ID")
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId)

    if(!deletedTweet){
        throw new ApiError(500, "Error while deleting tweet")
    }

    return res.status(200)
    .json(new ApiResponse(200, deletedTweet, "Tweet deleted successfully"))

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}