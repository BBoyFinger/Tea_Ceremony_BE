"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const categoryModel_1 = __importDefault(require("../models/categoryModel"));
const HttpStatusCode_1 = __importDefault(require("../utils/HttpStatusCode"));
const permission_1 = __importDefault(require("../utils/permission"));
const categoryController = {
    addCategory: async (req, res) => {
        const { name, description } = req.body;
        try {
            const sessionUserId = req.userId;
            if (!(0, permission_1.default)(sessionUserId)) {
                res.status(HttpStatusCode_1.default.Unauthorized).json({
                    message: "Permission denied",
                });
            }
            const category = await categoryModel_1.default.create({ name, description });
            if (!category) {
                return res.status(HttpStatusCode_1.default.NotFound).json({
                    message: "Don't create Category",
                });
            }
            return res.status(HttpStatusCode_1.default.OK).json({
                message: "Category created Successfully!",
                data: category,
            });
        }
        catch (error) {
            return res.status(HttpStatusCode_1.default.InternalServerError).json({
                message: error,
            });
        }
    },
    getCategoryById: async (req, res) => {
        const { id } = req.params;
        try {
            const category = await categoryModel_1.default.findById(id);
            if (!category) {
                return res.status(HttpStatusCode_1.default.NotFound).json({
                    message: "Category not found",
                });
            }
            return res.status(HttpStatusCode_1.default.OK).json({
                message: "Get category successfully!",
                data: category,
            });
        }
        catch (error) {
            return res.status(HttpStatusCode_1.default.InternalServerError).json({
                message: error,
            });
        }
    },
    getAllCategories: async (req, res) => {
        try {
            const { name } = req.query;
            const query = {};
            if (name) {
                query.name = { $regex: name, $options: "i" };
            }
            const categories = await categoryModel_1.default.find(query);
            if (!categories) {
                return res.status(HttpStatusCode_1.default.NotFound).json({
                    message: "Get category unsuccessfully!",
                });
            }
            return res.status(HttpStatusCode_1.default.OK).json({
                message: "Get category successfully!",
                data: categories,
            });
        }
        catch (error) {
            return res.status(HttpStatusCode_1.default.InternalServerError).json({
                message: error,
            });
        }
    },
    editCategory: async (req, res) => {
        const { id } = req.params;
        try {
            const sessionUserId = req.userId;
            if (!(0, permission_1.default)(sessionUserId)) {
                res.status(HttpStatusCode_1.default.Unauthorized).json({
                    message: "Permission denied",
                });
            }
            const category = await categoryModel_1.default.findByIdAndUpdate(id, req.body, {
                new: true,
            });
            if (!category) {
                return res
                    .status(HttpStatusCode_1.default.NotFound)
                    .json("Updated category unsuccess!");
            }
            return res.status(HttpStatusCode_1.default.OK).json({
                message: "Updated category successfully 123!",
                data: category,
            });
        }
        catch (error) {
            return res.status(HttpStatusCode_1.default.OK).json({
                message: "Updated category successfully!",
            });
        }
    },
    deleteCategories: async (req, res) => {
        const { ids } = req.body;
        if (!ids || ids.length === 0) {
            return res.status(400).json({ message: "No user IDs provided" });
        }
        try {
            if (ids.length === 1) {
                const deleteCategory = await categoryModel_1.default.findByIdAndDelete(ids[0]);
                if (!deleteCategory) {
                    return res
                        .status(HttpStatusCode_1.default.NotFound)
                        .json({ user: "User not found!" });
                }
                return res.status(HttpStatusCode_1.default.OK).json({
                    message: "Delete category successfully!",
                    data: deleteCategory,
                });
            }
            const deleteManyCategories = await categoryModel_1.default.deleteMany({
                _id: { $in: ids },
            });
            return res.status(200).json({
                message: `${deleteManyCategories.deletedCount} categories deleted successfully`,
            });
        }
        catch (error) {
            return res.status(HttpStatusCode_1.default.OK).json({
                message: error,
            });
        }
    },
};
exports.default = categoryController;
