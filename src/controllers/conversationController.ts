import { Request, Response } from "express";
import conversationModel from "../models/conversationModel";
import messageModel from "../models/messageModel";

const ConversationController = {
  getAllConversation: async (req: Request, res: Response) => {
    try {
      const allConversation = await conversationModel.find().sort({
        updatedAt: -1,
      });
      res.json(allConversation);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  getMessageByConversation: async (req: Request, res: Response) => {
    const { idUser, idConversation } = req.query as {
      idUser: string;
      idConversation: string;
    };

    try {
      const conversation = await conversationModel.findOne({
        $or: [{ idUser }, { _id: idConversation }],
      });

      if (!conversation) {
        return res.status(404).json({
          message: "Conversation not found.",
        });
      }

      const messages = await messageModel
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
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error.",
      });
    }
  },

  postSaveMessage: async (req: Request, res: Response) => {
    try {
      const messageText = new messageModel({
        sender: req.body.sender,
        message: req.body.message,
        idConversation: req.body.idConversation,
      });
      const createMessage = await messageText.save();
      res.status(201).json(createMessage);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
};

export default ConversationController;
