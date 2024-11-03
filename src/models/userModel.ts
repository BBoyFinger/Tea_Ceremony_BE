import mongoose, { Document, Schema, Model } from "mongoose";
import { IUser } from "../utils/type";

// Define the schema for the User model
const userSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
    pictureImg: {
      type: String,
      default:
        "https://www.shutterstock.com/image-vector/user-profile-icon-vector-avatar-600nw-2247726673.jpg",
    },
    status: {
      type: String,
      default: "Active",
    },
    role: {
      type: String,
      default: "CUSTOMER",
    },
  },
  {
    timestamps: true,
  }
);

// Create and export the User model
const UserModel: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default UserModel;
