import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

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
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.lenght >0) {
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
            $set: {
                refressToken: undefined
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

export {
    registerUser,
    loginUser,
    logoutUser,
    refressAccessToken
}
