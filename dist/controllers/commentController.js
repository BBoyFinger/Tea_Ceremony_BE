"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commentModel_1 = require("../models/commentModel");
const HttpStatusCode_1 = __importDefault(require("../utils/HttpStatusCode"));
// const isAdmin = (req: Request, res: Response, next: NextFunction) => {
//   if (req.userId && req.user.role === 'admin') {
//     return next();
//   }
//   res.status(403).json({ message: 'Forbidden' });
// };
const commentController = {
    addComment: async (req, res) => {
        try {
            const { productId, userId, comment } = req.body;
            const newComment = new commentModel_1.CommentModal({ productId, user: userId, comment });
            await newComment.save();
            const populatedComment = await commentModel_1.CommentModal.findById(newComment._id).populate("user"); // 'name' là trường bạn muốn hiển thị từ User model
            res.status(HttpStatusCode_1.default.Created).json({
                message: "Add comment successfully!",
                data: populatedComment,
            });
        }
        catch (error) {
            res
                .status(HttpStatusCode_1.default.InternalServerError)
                .json({ error: error.message });
        }
    },
    getComments: async (req, res) => {
        try {
            console.log(req.params.productId);
            const comments = await commentModel_1.CommentModal.find({
                productId: req.params.productId,
            })
                .populate("user", "pictureImg name")
                .populate({
                path: "replies",
                populate: {
                    path: "user",
                    select: "name pictureImg",
                },
            })
                .sort({ createdAt: -1 });
            res.status(200).json({
                message: "Get comment successfully!",
                data: comments,
            });
        }
        catch (error) { }
    },
    replyComment: async (req, res) => {
        try {
            const { userId, comment } = req.body;
            const reply = { user: userId, comment };
            const updatedComment = await commentModel_1.CommentModal.findByIdAndUpdate(req.params.commentId, { $push: { replies: reply } }, { new: true }).populate({
                path: "replies",
                populate: {
                    path: "user",
                    select: "name pictureImg",
                },
            });
            res.status(HttpStatusCode_1.default.OK).json(updatedComment);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    deleteComment: async (req, res) => {
        try {
            const comment = await commentModel_1.CommentModal.findById(req.params.commentId);
            if (!comment) {
                return res.status(404).json({ message: "Comment not found" });
            }
            // Check if the user is the owner or an admin
            if (comment.user?.toString() === req.userId || // Assuming comment.user is an ObjectId
                req.role === "admin") {
                await commentModel_1.CommentModal.deleteOne({ _id: comment._id }); // Use deleteOne
                return res
                    .status(200)
                    .json({ message: "Comment deleted successfully" });
            }
            res
                .status(403)
                .json({ message: "You do not have permission to delete this comment" });
        }
        catch (error) {
            res.status(500).json({ message: "Server error" });
        }
    },
    deleteReply: async (req, res) => {
        const { commentId, replyId } = req.params;
        const userId = req.userId; // Assuming userId is set by authMiddleware
        try {
            const comment = await commentModel_1.CommentModal.findById(commentId);
            if (!comment) {
                return res.status(404).json({ message: "Comment not found" });
            }
            // Find the reply to be deleted
            const reply = comment.replies.id(replyId);
            if (!reply) {
                return res.status(404).json({ message: "Reply not found" });
            }
            // Check if the user is the owner of the reply or an admin
            if (reply?.user?.toString() !== userId && req.role !== "admin") {
                return res
                    .status(403)
                    .json({ message: "You do not have permission to delete this reply" });
            }
            // Remove the reply using pull
            comment.replies.pull(replyId);
            // Save the updated comment
            await comment.save();
            res.status(200).json({ message: "Reply deleted successfully" });
        }
        catch (error) {
            console.error("Error deleting reply:", error);
            res.status(500).json({ message: "Server error" });
        }
    },
};
exports.default = commentController;
