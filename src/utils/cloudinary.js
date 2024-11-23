import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

//file upload on cloudinary 
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        //file uplaoded
        fs.unlinkSync(localFilePath)
        return response;
        
    } catch (error) {
        fs.unlinkSync(localFilePath) //remove local saved temp file
        return null;
    }
}


const deleteFromCloudinary = async (fileId, resourceType = "image") => {
    try {
        if (!fileId) {
            console.error("File ID is missing.");
            return null;
        }

        const response = await cloudinary.uploader.destroy(fileId, {
            resource_type: resourceType, // Set resource type explicitly
        });

        if (response.result !== "ok") {
            console.error("Failed to delete file from Cloudinary:", response);
            return null;
        }

        return response;
    } catch (error) {
        console.error("Error deleting from Cloudinary:", error);
        return null;
    }
};

const extractCloudinaryFileId = (fileUrl) => {
    try {
        const urlParts = new URL(fileUrl).pathname.split('/');
        return urlParts[urlParts.length - 1].split('.')[0]; // Extract file ID
    } catch (error) {
        console.error("Error extracting file ID from URL:", error);
        return null;
    }
};


export {
    uploadOnCloudinary,
    deleteFromCloudinary,
    extractCloudinaryFileId
}