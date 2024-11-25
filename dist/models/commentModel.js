"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentModal = void 0;
// models/Comment.js
const mongoose_1 = __importDefault(require("mongoose"));
const replySchema = new mongoose_1.default.Schema({
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
    comment: String,
    createdAt: { type: Date, default: Date.now },
});
const commentSchema = new mongoose_1.default.Schema({
    productId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Product" },
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
    comment: String,
    replies: [replySchema],
    createdAt: { type: Date, default: Date.now },
});
exports.CommentModal = mongoose_1.default.model("Comment", commentSchema);
