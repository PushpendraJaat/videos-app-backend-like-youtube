import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

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

export {registerUser}
