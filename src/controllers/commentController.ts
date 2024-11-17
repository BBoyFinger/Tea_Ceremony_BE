import { NextFunction, Request, Response } from "express";
import { CommentModal } from "../models/commentModel";
import HttpStatusCode from "../utils/HttpStatusCode";

// const isAdmin = (req: Request, res: Response, next: NextFunction) => {
//   if (req.userId && req.user.role === 'admin') {
//     return next();
//   }
//   res.status(403).json({ message: 'Forbidden' });
// };

const commentController = {
  addComment: async (req: Request, res: Response) => {
    try {
      const { productId, userId, comment } = req.body;
      const newComment = new CommentModal({ productId, user: userId, comment });
      await newComment.save();

      const populatedComment = await CommentModal.findById(
        newComment._id
      ).populate("user"); // 'name' là trường bạn muốn hiển thị từ User model

      res.status(HttpStatusCode.Created).json({
        message: "Add comment successfully!",
        data: populatedComment,
      });
    } catch (error: any) {
      res
        .status(HttpStatusCode.InternalServerError)
        .json({ error: error.message });
    }
  },
  getComments: async (req: Request, res: Response) => {
    try {
      console.log(req.params.productId);
      const comments = await CommentModal.find({
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
    } catch (error: any) {}
  },
  replyComment: async (req: Request, res: Response) => {
    try {
      const { userId, comment } = req.body;
      const reply = { user: userId, comment };
      const updatedComment = await CommentModal.findByIdAndUpdate(
        req.params.commentId,
        { $push: { replies: reply } },
        { new: true }
      ).populate({
        path: "replies",
        populate: {
          path: "user",
          select: "name pictureImg",
        },
      });
      res.status(HttpStatusCode.OK).json(updatedComment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteComment: async (req: Request, res: Response) => {
    try {
      const comment = await CommentModal.findById(req.params.commentId);

      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      // Check if the user is the owner or an admin
      if (
        comment.user?.toString() === req.userId || // Assuming comment.user is an ObjectId
        req.role === "admin"
      ) {
        await CommentModal.deleteOne({ _id: comment._id }); // Use deleteOne
        return res
          .status(200)
          .json({ message: "Comment deleted successfully" });
      }

      res
        .status(403)
        .json({ message: "You do not have permission to delete this comment" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  },
  deleteReply: async (req: Request, res: Response) => {
    const { commentId, replyId } = req.params;
    const userId = req.userId; // Assuming userId is set by authMiddleware

    try {
      const comment = await CommentModal.findById(commentId);

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
    } catch (error) {
      console.error("Error deleting reply:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
};

export default commentController;
