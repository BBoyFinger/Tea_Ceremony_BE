import mongoose, { Document, Schema, Model } from "mongoose";

interface IConversation extends Document {
  idUser: mongoose.Schema.Types.ObjectId;
  nameConversation: string;
  lastMessage: string;
  seen: boolean;
}

const ConversationSchema: Schema<IConversation> = new Schema(
  {
    idUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    nameConversation: { type: String, required: true },
    lastMessage: { type: String },
    seen: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Conversation: Model<IConversation> = mongoose.model<IConversation>(
  "Conversation",
  ConversationSchema
);

export default Conversation;
