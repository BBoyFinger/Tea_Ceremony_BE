import { Request, Response } from "express";
import ProductModel from "../models/productModel";
import HttpStatusCode from "../utils/HttpStatusCode";
import uploadProductPermission from "../utils/permission";
import CategoryModel from "../models/categoryModel";

interface Query {
  productName?: string;
  category?: string;
  availability?: string;
  page?: string; // Thêm page và limit vào Query
  limit?: string;
}

export const productController = {
  createProduct: async (req: Request, res: Response): Promise<Response> => {
    try {
      const sessionUserId = req.userId;

      if (!uploadProductPermission(sessionUserId)) {
        res.status(HttpStatusCode.Unauthorized).json({
          message: "Permission denied",
        });
      }

      const createProduct = new ProductModel(req.body);
      const saveProduct = await createProduct.save();

      return res.status(HttpStatusCode.Created).json({
        message: "Create product successfully!",
        data: saveProduct,
      });
    } catch (error) {
      return res.status(HttpStatusCode.InternalServerError).json({
        message: error,
      });
    }
  },

  searchProduct: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { query } = req.query;

      const products = await ProductModel.find({
        $or: [
          {
            productName: { $regex: query, $options: "i" },
          }, // 'i' để không phân biệt chữ hoa, chữ thường
        ],
      });
      return res.status(HttpStatusCode.OK).json({
        message: "Search product Successfully",
        data: products,
      });
    } catch (error) {
      return res.status(HttpStatusCode.InternalServerError).json({
        message: error,
      });
    }
  },

  getAllProducts: async (req: Request, res: Response): Promise<Response> => {
    const {
      productName,
      category,
      availability,
      page = "1",
      limit = "10",
    } = req.query as Query;
  
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
  
    // Calculate skip and limit based on the page number
    const skip = pageNumber === 1 ? 0 : 20; // Skip 0 for the first page, 10 for the second page
    const limitToUse = pageNumber === 1 ? limitNumber : 0; // Limit to 10 for the first page, undefined for the second page
  
    const filters: any = {};
    if (productName) filters.name = { $regex: productName, $options: "i" };
    if (category) filters.category = category;
    if (availability) filters.availability = availability === "instock";
  
    try {
      const totalProducts = await ProductModel.countDocuments(filters);
  
      const products = await ProductModel.find(filters)
        .populate("category")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitToUse);
  
      return res.status(HttpStatusCode.OK).json({
        message: "Get product successfully!",
        data: products,
        totalProducts,
        totalPages: Math.ceil(totalProducts / limitNumber),
        currentPage: pageNumber,
      });
    } catch (error) {
      return res.status(HttpStatusCode.InternalServerError).json({
        message: error,
      });
    }
  },

  getProductByCategory: async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const categoryName = req.params.category;

      const category = await CategoryModel.findOne({
        name: { $regex: new RegExp(categoryName, "i") },
      });
      if (!category) {
        return res.status(HttpStatusCode.NotFound).json({
          message: "Category not found",
        });
      }
      // Tìm sản phẩm dựa trên category
      const products = await ProductModel.find({
        category: category._id,
      }).populate("category");

      return res.status(HttpStatusCode.OK).json({
        message: "Get Product by Category Successfully",
        data: products,
      });
    } catch (error) {
      return res.status(HttpStatusCode.InternalServerError).json({
        message: error,
      });
    }
  },

  getProductNewArrivals: async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const newArrivals = await ProductModel.find()
        .sort({ createdAt: -1 })
        .limit(5);
      return res.status(HttpStatusCode.OK).json({
        message: "Get Product new arrivals successfully",
        data: newArrivals,
      });
    } catch (error) {
      return res.status(HttpStatusCode.InternalServerError).json({
        message: error,
      });
    }
  },

  getProductBestSellers: async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const category = await CategoryModel.findOne({ name: "Best Sellers" });

      if (!category) {
        return res.status(HttpStatusCode.NotFound).json({
          message: "Category 'Best Sellers' not found",
        });
      }

      const bestSellers = await ProductModel.find({
        category: category._id,
      }).limit(5);

      return res.status(HttpStatusCode.OK).json({
        message: "Get Product new arrivals successfully",
        data: bestSellers,
      });
    } catch (error) {
      return res.status(HttpStatusCode.InternalServerError).json({
        message: error,
      });
    }
  },

  getFeaturedProducts: async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const featuredProduct = await ProductModel.find({
        isFeatured: true,
      }).limit(5);
      return res.status(HttpStatusCode.OK).json({
        message: "Get Product fearture successfully",
        data: featuredProduct,
      });
    } catch (error) {
      return res.status(HttpStatusCode.InternalServerError).json({
        message: error,
      });
    }
  },

  getProductBestReviews: async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const bestReviews = await ProductModel.find()
        .sort({ reviewsCount: -1 })
        .limit(5);
      return res.status(HttpStatusCode.OK).json({
        message: "Get Product best reviews successfully",
        data: bestReviews,
      });
    } catch (error) {
      return res.status(HttpStatusCode.InternalServerError).json({
        message: error,
      });
    }
  },

  getProductById: async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    try {
      const product = await ProductModel.findById(id).populate("category");
      if (!product) {
        return res.status(HttpStatusCode.NotFound).json({
          message: "Product not found",
        });
      }

      return res.status(HttpStatusCode.OK).json({
        message: "Get product successfully!",
        data: product,
      });
    } catch (error) {
      return res.status(HttpStatusCode.InternalServerError).json({
        message: error,
      });
    }
  },

  updateProduct: async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    try {
      const sessionUserId = req.userId;

      if (!uploadProductPermission(sessionUserId)) {
        res.status(HttpStatusCode.Unauthorized).json({
          message: "Permission denied",
        });
      }
      const updateProduct = await ProductModel.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      if (!updateProduct) {
        return res.status(HttpStatusCode.NotFound).json({
          message: "Product not found!",
        });
      }
      return res.status(HttpStatusCode.OK).json({
        message: "Updated product successfully!",
        data: updateProduct,
      });
    } catch (error) {
      return res.status(HttpStatusCode.InternalServerError).json({
        message: error,
      });
    }
  },

  deleteProducts: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { ids } = req.body;
      if (ids.length === 1) {
        const deleteProduct = await ProductModel.findByIdAndDelete(ids[0]);
        if (!deleteProduct) {
          return res.status(HttpStatusCode.NotFound).json({
            message: "Product not found!",
          });
        }
        return res.status(HttpStatusCode.OK).json({
          message: "Delete product successfully!",
        });
      }

      const deleteProducts = await ProductModel.deleteMany({
        _id: { $in: ids },
      });

      return res.status(HttpStatusCode.OK).json({
        message: `${deleteProducts.deletedCount} products deleted successfully`,
        data: deleteProducts,
      });
    } catch (error) {
      return res.status(HttpStatusCode.InternalServerError).json({
        message: error,
      });
    }
  },
};
