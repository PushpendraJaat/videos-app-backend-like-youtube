import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary, deleteFromCloudinary, extractCloudinaryFileId } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const filter = {};
    if (query) filter.$text = { $search: query };
    if (userId) filter.userId = userId;
    filter.isPublished = true; // Exclude unpublished videos

    const totalVideos = await Video.countDocuments(filter);

    const videos = await Video.find(filter)
        .sort({ [sortBy]: sortType === "desc" ? -1 : 1 })
        .skip((page - 1) * parseInt(limit))
        .limit(parseInt(limit));

    if (videos.length === 0) {
        throw new ApiError(404, "No Videos found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {totalVideos, videos}, "Videos fetched successfully"))
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video
    // Done
    if (!(title && description)) {
        throw new ApiError(400, "Title and description is required")
    }

    //const videoLocalpath = req.files?.video[0]?.path;
    let videoLocalpath;
    if (req.files && Array.isArray(req.files.video) && req.files.video.length > 0) {
        videoLocalpath = req.files.video[0].path
    }

    if (!videoLocalpath) {
        throw new ApiError(400, "Video file is required")
    }

    // const thumbnailLocalpath = req.files?.thumbnail[0]?.path;
    let thumbnailLocalpath;
    if (req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0) {
        thumbnailLocalpath = req.files.thumbnail[0].path
    }

    if (!thumbnailLocalpath) {
        throw new ApiError(400, "Thumbnail file is required")
    }

    const videofile = await uploadOnCloudinary(videoLocalpath)
    const thumbnailfile = await uploadOnCloudinary(thumbnailLocalpath)

    if (!(videofile && thumbnailfile)) {
        throw new ApiError(400, "Error while uploading video and thumbnail")
    }

    const video = await Video.create({
        title,
        description,
        videoFile: videofile.url,
        thumbnail: thumbnailfile.url,
        isPublished: true,
        views: 0,
        duration: videofile?.duration,
        owner: req.user?._id
    })

    if (!video) {
        throw new ApiError(500, "Error while publishing video")
    }

    return res.
        status(200)
        .json(new ApiResponse(200, video, "Video uploaded successfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) {
        throw new ApiError(400, "invalid resource access")
    }

    //TODO: get video by id
    const video = await Video.findById(new mongoose.Types.ObjectId(videoId))


    if (!video) {
        throw new ApiError(404, "Video not found in database")
    }

    return res
        .status(201)
        .json(new ApiResponse(200, video, "Video fetched successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) {
        throw new ApiError(400, "invalid resource access")
    }
    //TODO: update video details like title, description, thumbnail
    const { title, description } = req.body
    const thumbnailFilePath = req.file?.path

    if (!title) {
        throw new ApiError(400, "Title is required")
    }

    if (!description) {
        throw new ApiError(400, "Description is required")
    }

    if (!thumbnailFilePath) {
        throw new ApiError(400, "Thumbnail is required")
    }

    const thumbnailfile = await uploadOnCloudinary(thumbnailFilePath)

    if (!thumbnailfile.url) {
        throw new ApiError(400, "Error while uplaoding thumbnail")
    }

    const video = await Video.findByIdAndUpdate(new mongoose.Types.ObjectId(videoId),
        {
            $set: {
                title: title,
                description: description,
                thumbnail: thumbnailfile.url
            }
        }, { new: true }
    )

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Vidoe title , description and thumbnail updated successfully"))


})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // Delete video from the database
    const delVideo = await Video.findByIdAndDelete(new mongoose.Types.ObjectId(videoId));

    if (!delVideo) {
        return res.status(404).json(new ApiError(404, "Video not found"));
    }

    // Extract Cloudinary file IDs from the video and thumbnail URLs
    const videofileId = extractCloudinaryFileId(delVideo.videoFile);
    const thumbnailfileId = extractCloudinaryFileId(delVideo.thumbnail);

    // Delete video from Cloudinary
    const delVideoCloud = await deleteFromCloudinary(videofileId, "video");

    if (!delVideoCloud || delVideoCloud.result !== "ok") {
        return res.status(500).json(new ApiError(500, "Error while deleting video from Cloudinary"));
    }

    if (thumbnailfileId) {
        const delThumbnailCloud = await deleteFromCloudinary(thumbnailfileId, "image");
        console.log(delThumbnailCloud);

        if (!delThumbnailCloud || delThumbnailCloud.result !== "ok") {
            return res.status(500).json(new ApiError(500, "Error while deleting thumbnail from Cloudinary"));
        }
    }

    return res.status(200)
        .json(new ApiResponse(200, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        return new ApiError(404, "Video not found")
    }

    const video = await Video.findById(new mongoose.Types.ObjectId(videoId));
    if (!video) {
        new ApiError(404, "video not found")
    }

    const updatedVideo = await Video.findByIdAndUpdate(new mongoose.Types.ObjectId(videoId),
        {
            $set: { isPublished: !video.isPublished }
        },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, updatedVideo, "Video status toggled successfully"))

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}