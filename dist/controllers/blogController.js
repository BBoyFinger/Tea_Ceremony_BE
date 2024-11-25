"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const HttpStatusCode_1 = __importDefault(require("../utils/HttpStatusCode"));
const blogModel_1 = __importDefault(require("../models/blogModel"));
const blogController = {
    createBlog: async (req, res) => {
        try {
            const { title, content, images } = req.body;
            const newBlog = new blogModel_1.default({
                title,
                content,
                images,
                author: req.userId,
            });
            await newBlog.save();
            return res.status(HttpStatusCode_1.default.Created).json({
                message: "Create Blog successfully!",
                data: newBlog.populate("author"),
            });
        }
        catch (error) {
            return res.status(HttpStatusCode_1.default.InternalServerError).json({
                message: error.message || "An error occurred",
                error: true,
                success: false,
            });
        }
    },
    searchBlogs: async (req, res) => {
        try {
            const { query } = req.query;
            const searchBlogs = await blogModel_1.default.find({
                $or: [
                    {
                        title: { $regex: query, $options: "i" },
                    }, // 'i' để không phân biệt chữ hoa, chữ thường
                ],
            });
            return res.status(HttpStatusCode_1.default.OK).json({
                message: "Search Blog successfully!",
                data: searchBlogs,
            });
        }
        catch (error) {
            return res.status(HttpStatusCode_1.default.InternalServerError).json({
                message: error.message || "An error occurred",
                error: true,
                success: false,
            });
        }
    },
    getAllBlogs: async (req, res) => {
        const { title } = req.query;
        try {
            const filters = {};
            if (title)
                filters.title = { $regex: title, $options: "i" }; // Tìm kiếm theo tên
            const blogs = await blogModel_1.default.find(filters);
            return res.status(HttpStatusCode_1.default.Created).json({
                message: "Get all Blog successfully!",
                data: blogs,
            });
        }
        catch (error) {
            return res.status(HttpStatusCode_1.default.InternalServerError).json({
                message: error.message || "An error occurred",
                error: true,
                success: false,
            });
        }
    },
    getBlogById: async (req, res) => {
        const { id } = req.params;
        try {
            const blog = await blogModel_1.default.findById(id).populate("author");
            return res.status(HttpStatusCode_1.default.Created).json({
                message: "Get Blog by id successfully!",
                data: blog,
            });
        }
        catch (error) {
            return res.status(HttpStatusCode_1.default.InternalServerError).json({
                message: error.message || "An error occurred",
                error: true,
                success: false,
            });
        }
    },
    updateBlog: async (req, res) => {
        const { id } = req.params;
        try {
            const blog = await blogModel_1.default.findByIdAndUpdate(id, req.body, {
                new: true,
            });
            return res.status(HttpStatusCode_1.default.Created).json({
                message: "Update Blog successfully!",
                data: blog,
            });
        }
        catch (error) {
            return res.status(HttpStatusCode_1.default.InternalServerError).json({
                message: error.message || "An error occurred",
                error: true,
                success: false,
            });
        }
    },
    deleteBlogs: async (req, res) => {
        const { ids } = req.body;
        try {
            if (ids.length === 1) {
                const blog = await blogModel_1.default.deleteOne(ids);
                return res.status(HttpStatusCode_1.default.Created).json({
                    message: "Delete Blog successfully!",
                    data: blog,
                });
            }
            const blogs = await blogModel_1.default.deleteMany({
                _id: { $in: ids },
            });
            return res.status(200).json({
                message: `${blogs.deletedCount} blog deleted successfully`,
            });
        }
        catch (error) {
            return res.status(HttpStatusCode_1.default.InternalServerError).json({
                message: error.message || "An error occurred",
                error: true,
                success: false,
            });
        }
    },
};
exports.default = blogController;
