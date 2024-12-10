"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const conversationModel_1 = __importDefault(require("../models/conversationModel"));
const messageModel_1 = __importDefault(require("../models/messageModel"));
const ConversationController = {
    getAllConversation: async (req, res) => {
        try {
            const allConversation = await conversationModel_1.default.find().sort({
                updatedAt: -1,
            });
            res.json(allConversation);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    getMessageByConversation: async (req, res) => {
        const { idUser, idConversation } = req.query;
        try {
            const conversation = await conversationModel_1.default.findOne({
                $or: [{ idUser }, { _id: idConversation }],
            });
            if (!conversation) {
                return res.status(404).json({
                    message: "Conversation not found.",
                });
            }
            const messages = await messageModel_1.default
                .find({
                idConversation: conversation._id,
            })
                .populate({
                path: "idConversation",
                populate: {
                    path: "idUser",
                    model: "User",
                },
            });
            if (!messages.length) {
                return res.status(400).json({
                    message: "No messages found for this conversation.",
                });
            }
            return res.status(200).json({
                messageList: messages,
            });
        }
        catch (error) {
            return res.status(500).json({
                message: "Internal server error.",
            });
        }
    },
    postSaveMessage: async (req, res) => {
        try {
            const messageText = new messageModel_1.default({
                sender: req.body.sender,
                message: req.body.message,
                idConversation: req.body.idConversation,
            });
            const createMessage = await messageText.save();
            res.status(201).json(createMessage);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    },
};
exports.default = ConversationController;
