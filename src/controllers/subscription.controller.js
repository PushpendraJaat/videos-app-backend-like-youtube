import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import { Subscription } from "../models/subscription.model.js"

const subscribing = asyncHandler( async(req, res) => {
    //logged in userid
    //subscribingto channel username or id
    //save in logged in user subscribed list
    // save in channel subscrition list
    const loggedInUserId = req.user._id
    await Subscription.findByIdAndUpdate(loggedInUserId,
        {
            $set: {
                channel: 
            }
        }
    )

})
