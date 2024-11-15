import { Request, Response } from "express";
import { CommentModal } from "../models/commentModel";
import HttpStatusCode from "../utils/HttpStatusCode";

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
        .populate("user replies.user")
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
      ).populate("replies.user");
      res.status(HttpStatusCode.OK).json(updatedComment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
};

export default commentController;
