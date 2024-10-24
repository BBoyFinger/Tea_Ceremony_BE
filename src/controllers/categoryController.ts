import categoryModel from "../models/categoryModel";
import { Request, Response } from "express";
import { ICategory } from "../utils/type";
import HttpStatusCode from "../utils/HttpStatusCode";
import uploadProductPermission from "../utils/permission";

const categoryController = {
  addCategory: async (req: Request, res: Response): Promise<Response> => {
    const { name, description } = req.body as ICategory;

    try {
      const sessionUserId = req.userId;

      if (!uploadProductPermission(sessionUserId)) {
        res.status(HttpStatusCode.Unauthorized).json({
          message: "Permission denied",
        });
      }
      const category = await categoryModel.create({ name, description });
      if (!category) {
        return res.status(HttpStatusCode.NotFound).json({
          message: "Don't create Category",
        });
      }

      return res.status(HttpStatusCode.OK).json({
        message: "Category created Successfully!",
        data: category,
      });
    } catch (error) {
      return res.status(HttpStatusCode.InternalServerError).json({
        message: error,
      });
    }
  },
  getCategoryById: async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    try {
      const category = await categoryModel.findById(id);
      if (!category) {
        return res.status(HttpStatusCode.NotFound).json({
          message: "Category not found",
        });
      }
      return res.status(HttpStatusCode.OK).json({
        message: "Get category successfully!",
        data: category,
      });
    } catch (error) {
      return res.status(HttpStatusCode.InternalServerError).json({
        message: error,
      });
    }
  },
  getAllCategories: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { name } = req.query as { name: string };
      const query: any = {};

      if (name) {
        query.name = { $regex: name, $options: "i" };
      }

      const categories = await categoryModel.find(query);
      
      if (!categories) {
        return res.status(HttpStatusCode.NotFound).json({
          message: "Get category unsuccessfully!",
        });
      }
      return res.status(HttpStatusCode.OK).json({
        message: "Get category successfully!",
        data: categories,
      });
    } catch (error) {
      return res.status(HttpStatusCode.InternalServerError).json({
        message: error,
      });
    }
  },
  editCategory: async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    try {
      const sessionUserId = req.userId;

      if (!uploadProductPermission(sessionUserId)) {
        res.status(HttpStatusCode.Unauthorized).json({
          message: "Permission denied",
        });
      }
      const category = await categoryModel.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      if (!category) {
        return res
          .status(HttpStatusCode.NotFound)
          .json("Updated category unsuccess!");
      }
      return res.status(HttpStatusCode.OK).json({
        message: "Updated category successfully 123!",
        data: category,
      });
    } catch (error) {
      return res.status(HttpStatusCode.OK).json({
        message: "Updated category successfully!",
      });
    }
  },
  deleteCategories: async (req: Request, res: Response): Promise<Response> => {
    const { ids } = req.body;

    if (!ids || ids.length === 0) {
      return res.status(400).json({ message: "No user IDs provided" });
    }
    try {
      if (ids.length === 1) {
        const deleteCategory = await categoryModel.findByIdAndDelete(ids[0]);
        if (!deleteCategory) {
          return res
            .status(HttpStatusCode.NotFound)
            .json({ user: "User not found!" });
        }
        return res.status(HttpStatusCode.OK).json({
          message: "Delete category successfully!",
          data: deleteCategory,
        });
      }
      const deleteManyCategories = await categoryModel.deleteMany({
        _id: { $in: ids },
      });

      return res.status(200).json({
        message: `${deleteManyCategories.deletedCount} categories deleted successfully`,
      });
    } catch (error) {
      return res.status(HttpStatusCode.OK).json({
        message: error,
      });
    }
  },
};

export default categoryController;
