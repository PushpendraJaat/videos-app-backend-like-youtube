import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

const generateAccessAndRefressTokens = async function (userId){
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refressToken = user.generateRefressToken()

        user.refressToken = refressToken
        await user.save({validateBeforeSave: false})

        return {refressToken, accessToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refress and access token !!")
    }
}

const registerUser = asyncHandler( async (req, res) => {
    //steps for user register
    //get user data from frontend
    //check for empty field
    //validate data
    //check if user already registered with given email or username
    //check we get images- avatar
    //store avatar on cloudinary
    //check if we get cloudinary url
    //lowercase username
    //store all data in db
    //check if new data entry created
    // remove password and refress token from response
    //send response

    const { fullname, email, username, password } = req.body

    if(
        [fullname, email, username, password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username },{ email }]
    })
    
    if(existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }

    const avatarLocalpath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalpath) {
        throw new ApiError(400, "Avatar file(path) is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalpath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()

    })

   const createdUser = await User.findById(user._id).select(
    "-password -refressToken"
   )

   if(!createdUser){
        throw new ApiError(500, "Error while creating user")
   }
    
   return res.status(201).json(
    new ApiResponse(200, createdUser, "User Registered Successfully")
   )
    
})

//get user data from frontend
//validate data
//check if user exists in our database
//check user credrentials
//generate tokens
//save refress token in database
//set secure cookies with refress and access token

const loginUser = asyncHandler( async (req, res) => {
    const {username, email, password} = req.body


    if (!username && !email ) {
        throw new ApiError(400, "Username or email is required !!")
    }

    if (!password) {
        throw new ApiError(400, "Password is required !!")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user){
        throw new ApiError(404, "User not registered with given details")
    }

    const validPassword = await user.isPasswordCorrect(password)

    if (!validPassword) {
        throw new ApiError(401, "Wrong user credentials")
    }

    const {refressToken, accessToken} = await generateAccessAndRefressTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refressToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refressToken", refressToken, options)
    .json(
        new ApiResponse(200,
            {
                user: loggedInUser, accessToken, refressToken
            },
            "User logged in successfully"
        )
    )
  
})

const logoutUser = asyncHandler( async (req, res) => {
    const userId = req.user._id
    await User.findByIdAndUpdate(userId,
        {
            $unset: {
                refressToken: 1
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refressToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"))

})

const refressAccessToken = asyncHandler(async (req, res) =>{
    const incomingRefressToken = req.cookies.refressToken || req.body.refressToken

    if(!incomingRefressToken){
        throw new ApiError(401, "Unauthorized request !!!")
    }

    try {
        const decodedRefressToken = jwt.verify(incomingRefressToken, process.env.REFRESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedRefressToken?._id)
    
        
        if(!user){
            throw new ApiError(401, "Invalid Refress Token !!!")
        }
    
        if(incomingRefressToken !== user?.refressToken){
                throw new ApiError(401, "Refress Token is expired or used !!!")
        }
        
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newrefressToken} = await generateAccessAndRefressTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refressToken", newrefressToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, newrefressToken},
                "Access Token refressed."
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refress Token!!!!!!")
    }
})

const changeCurrentPassword = asyncHandler( async(req, res) => {
    const {oldPassword, newPassword} = req.body
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler( async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"))
})

const updateAccountDetails = asyncHandler( async(req, res) => {
    const {fullname, email} = req.body

    if (!fullname || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                fullname: fullname,
                email: email
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
    
})

const updateUserAvatar = asyncHandler( async(req, res) => {
    
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading avatar")
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
    {
        $set: {
            avatar: avatar.url
        }
    },
    {new: true}
).select("-password")

return res
.status(200)
.json(new ApiResponse(200, user, "Avatar image updated successfully"))

})

const updateUserCoverImage = asyncHandler( async(req, res) => {
    
    const coverImageLocalPath = req.file?.path
    if (!coverImageLocalPath) {
        throw new ApiError(400, "CoverImage file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading coverImage")
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
    {
        $set: {
            coverImage: coverImage.url
        }
    },
    {new: true}
).select("-password")

return res
.status(200)
.json(new ApiResponse(200, user, "Cover image updated successfully"))

})

const getUserChannelProfile = asyncHandler( async(req, res) => {
    const {username} = req.params
    
    if (!username?.trim()) {
        throw new ApiError(400, "Username is missing")
    }
    
    const channel = await User.aggregate([
        {
            $match:{
                username: username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup:{
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields:{
                subscribersCount: {
                    $size: "$subscribers"
                },
                subscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullname: 1,
                username: 1,
                subscribersCount: 1,
                subscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ])
    
    if (!channel?.length) {
        throw new ApiError(404, "Channel does not exists")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "User channel fetched successfully"))
})

const getWatchHistory = asyncHandler( async(req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullname: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch history fetched successfully"
        )
    )
})



export {
    registerUser,
    loginUser,
    logoutUser,
    refressAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
}
