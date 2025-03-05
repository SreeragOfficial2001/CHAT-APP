import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/messages/users");
            set({ users: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch users");
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch messages");
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessage: async (messageData) => {
        console.log("Message data", messageData);
        const { selectedUser, messages } = get();
        if (!selectedUser) {
            toast.error("No user selected");
            return;
        }
        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            set({ messages: [...messages, res.data] });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send message");
        }
    },

    subscribeToMessages: () => {
        const { selectedUser } = get();
        if (!selectedUser) {
            console.warn("No user selected, cannot subscribe to messages.");
            return;
        }
        const socket = useAuthStore.getState().socket;
        if (!socket) {
            console.error("Socket not available in auth store.");
            return;
        }

        socket.on("newMessage", (newMessage) => {
            if (newMessage.senderId !== selectedUser._id) return;
            set({ messages: [...get().messages, newMessage] });
        });
        console.log("Subscribed to messages for user:", selectedUser._id);
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) {
            console.error("Socket not available in auth store.");
            return;
        }
        socket.off("newMessage");
        console.log("Unsubscribed from messages.");
    },

    setSelectedUser: (selectedUser) => {
        set({ selectedUser });
        get().subscribeToMessages();
    },
}));