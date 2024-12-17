import mongoose, {Schema} from "mongoose";

const likeSchema = new Schema({
    video:{
        type: Schema.Types.ObjectId,
        ref: "Video",
    },
    comment:{
        type: Schema.Types.ObjectId,
        ref: "Comment",
    },
    likedBy:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    tweet:{
        type: mongoose.Types.ObjectId,
        ref: "Tweet",
    },
    isLiked: {
        type: Boolean,
        default: false,
        required: true
    }
},
{
    timestamp: true
})

export const Like = mongoose.model("Like", likeSchema)