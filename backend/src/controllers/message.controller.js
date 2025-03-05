import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import clodinary from "../lib/cloudinary.js";
import { getReceieverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getUsersForSidebar", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    // Destructuring userToChatId from req.params
    const { id: userToChatId } = req.params;
    
    // Getting the logged-in user's ID from req.user
    const myId = req.user._id; 

    // Finding messages between the logged-in user and the other user
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId }
      ]
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params; // Receiver user ID from params
    const senderId = req.user._id; // Sender user ID from the logged-in user

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await clodinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    // Create a new message object
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    // Save the new message to the database
    await newMessage.save();

    const receieverSocketId = getReceieverSocketId(receiverId);
       if(receieverSocketId){

         io.to(receieverSocketId).emit("newMessage",newMessage);
       }

    // Respond with the newly created message
    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
