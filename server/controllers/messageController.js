import { Message } from "../models/message.js";
import { User } from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";

export const getUserForSidebar = async (req, res) => {
    try {
        const userId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: userId } }).select("-password");

        const unseenMessages = {};
        const promises = filteredUsers.map(async (user) => {
            const messages = await Message.find({ senderId: user._id, recieverId: userId, seen: false })
            if (messages.length > 0) {
                unseenMessages[user._id] = messages.length;
            }
        })
        await Promise.all(promises);
        res.json({ success: true, users: filteredUsers, unseenMessages });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const getMessage = async (req, res) => {
    try {
        const { id: selectedUserId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                {
                    senderId: myId, recieverId: selectedUserId
                },
                {
                    senderId: selectedUserId, recieverId: myId
                }
            ]
        })

        await Message.updateMany({ senderId: selectedUserId, recieverId: myId }, { seen: true });

        res.json({ success: true, messages })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const markMessageAsSeen = async (req, res) => {
    try {
        const { id } = req.params;
        await Message.findByIdAndUpdate(id, { seen: true })
        res.json({ success: true })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const reciverId = req.params.id;
        const senderId = req.user._id;

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = await Message.create({
            senderId,
            recieverId: reciverId,
            text,
            image: imageUrl
        })

        const reciverSocketId = userSocketMap[reciverId];
        if (reciverSocketId) {
            io.to(reciverSocketId).emit("newMessage", newMessage)
        }

        res.json({ success: true, newMessage });
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}