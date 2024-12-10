import mongoose, { Document, Schema, Model } from "mongoose";

// Define an interface for the Message document
interface IMessage extends Document {
  idConversation: mongoose.Types.ObjectId;
  sender: string;
  message: string;
}

// Define the schema
const MessageSchema: Schema<IMessage> = new Schema(
  {
    idConversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: String,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create the model
const MessageModel: Model<IMessage> = mongoose.model<IMessage>(
  "Message",
  MessageSchema
);

export default MessageModel;
