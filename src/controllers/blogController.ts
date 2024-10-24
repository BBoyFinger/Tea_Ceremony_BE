import { Request, Response } from "express";
import HttpStatusCode from "../utils/HttpStatusCode";
import BlogModel from "../models/blogModel";

const blogController = {
  createBlog: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { title, content, images } = req.body;
      const newBlog = new BlogModel({
        title,
        content,
        images,
        author: req.userId,
      });

      await newBlog.save();

      return res.status(HttpStatusCode.Created).json({
        message: "Create Blog successfully!",
        data: newBlog.populate("author"),
      });
    } catch (error: any) {
      return res.status(HttpStatusCode.InternalServerError).json({
        message: error.message || "An error occurred",
        error: true,
        success: false,
      });
    }
  },
  searchBlogs: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { query } = req.query;

      const searchBlogs = await BlogModel.find({
        $or: [
          {
            title: { $regex: query, $options: "i" },
          }, // 'i' để không phân biệt chữ hoa, chữ thường
        ],
      });
      return res.status(HttpStatusCode.OK).json({
        message: "Search Blog successfully!",
        data: searchBlogs,
      });
    } catch (error: any) {
      return res.status(HttpStatusCode.InternalServerError).json({
        message: error.message || "An error occurred",
        error: true,
        success: false,
      });
    }
  },

  getAllBlogs: async (req: Request, res: Response): Promise<Response> => {
    try {
      const blogs = await BlogModel.find();

      return res.status(HttpStatusCode.Created).json({
        message: "Get all Blog successfully!",
        data: blogs,
      });
    } catch (error: any) {
      return res.status(HttpStatusCode.InternalServerError).json({
        message: error.message || "An error occurred",
        error: true,
        success: false,
      });
    }
  },

  getBlogById: async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    try {
      const blog = await BlogModel.findById(id).populate("author");
      return res.status(HttpStatusCode.Created).json({
        message: "Get Blog by id successfully!",
        data: blog,
      });
    } catch (error: any) {
      return res.status(HttpStatusCode.InternalServerError).json({
        message: error.message || "An error occurred",
        error: true,
        success: false,
      });
    }
  },

  updateBlog: async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    try {
      const blog = await BlogModel.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      return res.status(HttpStatusCode.Created).json({
        message: "Update Blog successfully!",
        data: blog,
      });
    } catch (error: any) {
      return res.status(HttpStatusCode.InternalServerError).json({
        message: error.message || "An error occurred",
        error: true,
        success: false,
      });
    }
  },

  deleteBlogs: async (req: Request, res: Response): Promise<Response> => {
    const { ids } = req.body;
    try {
      if (ids.length === 1) {
        const blog = await BlogModel.deleteOne(ids);
        return res.status(HttpStatusCode.Created).json({
          message: "Delete Blog successfully!",
          data: blog,
        });
      }
      const blogs = await BlogModel.deleteMany({
        _id: { $in: ids },
      });

      return res.status(200).json({
        message: `${blogs.deletedCount} blog deleted successfully`,
      });
    } catch (error: any) {
      return res.status(HttpStatusCode.InternalServerError).json({
        message: error.message || "An error occurred",
        error: true,
        success: false,
      });
    }
  },
};

export default blogController;
