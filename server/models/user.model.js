import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email:{
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        fullname:{
            type: String,
            required: true,
            trim: true
        },
        password:{
            type: String,
            required: true,
            trim: true,
            minLength: 6
        },
        profilePic:{
            type: String,
            default: ""
        },
        bio: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

export const User = mongoose.model("User", userSchema)