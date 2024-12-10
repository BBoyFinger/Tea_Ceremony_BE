"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectSocket = void 0;
const socket_io_1 = require("socket.io");
const conversationModel_1 = __importDefault(require("../../models/conversationModel"));
const ConnectSocket = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: "https://tea-ware-fe.vercel.app",
            methods: ["GET", "POST"],
            allowedHeaders: ["my-custom-header"],
            credentials: true,
        },
    });
    io.on("connection", (socket) => {
        socket.on("join_conversation", async (idUser) => {
            try {
                const conversation = await conversationModel_1.default.findOne({ idUser });
                if (!conversation)
                    return;
                const idConversation = String(conversation._id);
                socket.join(idConversation);
            }
            catch (error) {
                console.error("Error joining conversation:", error);
            }
        });
        socket.on("admin_join_conversation", (idConversation) => {
            socket.join(idConversation);
        });
        socket.on("create_conversation", async (currentUser) => {
            try {
                const conversation = new conversationModel_1.default({
                    idUser: currentUser._id,
                    nameConversation: currentUser.name,
                });
                const data = await conversation.save();
                socket.join(String(data._id));
                socket.emit("response_room", data);
            }
            catch (error) {
                console.error("Error creating conversation:", error);
            }
        });
        socket.on("chat", async (data) => {
            const { _id, sender, message, idConversation } = data;
            try {
                const conversation = await conversationModel_1.default.updateOne({ _id: idConversation }, { lastMessage: message });
                io.emit("lastMessage", conversation);
                const payload = {
                    idConversation,
                    sender,
                    message,
                    _id,
                };
                io.to(idConversation).emit("newMessage", payload);
                const conver = await conversationModel_1.default.findOne({ _id: idConversation });
                io.emit("show-me", conver);
            }
            catch (error) {
                console.error("Error handling chat:", error);
            }
        });
        socket.on("disconnect", () => {
            io.emit("user-leave", "User out room chat");
        });
    });
};
exports.ConnectSocket = ConnectSocket;
