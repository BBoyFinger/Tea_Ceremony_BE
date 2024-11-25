"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productController = void 0;
const productModel_1 = __importDefault(require("../models/productModel"));
const HttpStatusCode_1 = __importDefault(require("../utils/HttpStatusCode"));
const permission_1 = __importDefault(require("../utils/permission"));
const categoryModel_1 = __importDefault(require("../models/categoryModel"));
exports.productController = {
    createProduct: async (req, res) => {
        try {
            const sessionUserId = req.userId;
            if (!(0, permission_1.default)(sessionUserId)) {
                res.status(HttpStatusCode_1.default.Unauthorized).json({
                    message: "Permission denied",
                });
            }
            const createProduct = new productModel_1.default(req.body);
            const saveProduct = await createProduct.save();
            return res.status(HttpStatusCode_1.default.Created).json({
                message: "Create product successfully!",
                data: saveProduct,
            });
        }
        catch (error) {
            return res.status(HttpStatusCode_1.default.InternalServerError).json({
                message: error,
            });
        }
    },
    searchProduct: async (req, res) => {
        try {
            const { query } = req.query;
            const products = await productModel_1.default.find({
                $or: [
                    {
                        productName: { $regex: query, $options: "i" },
                    }, // 'i' để không phân biệt chữ hoa, chữ thường
                ],
            });
            return res.status(HttpStatusCode_1.default.OK).json({
                message: "Search product Successfully",
                data: products,
            });
        }
        catch (error) {
            return res.status(HttpStatusCode_1.default.InternalServerError).json({
                message: error,
            });
        }
    },
    getAllProducts: async (req, res) => {
        const { productName, category, availability, page = "1", limit = "10", } = req.query;
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        // Calculate skip and limit based on the page number
        const skip = pageNumber === 1 ? 0 : 20; // Skip 0 for the first page, 10 for the second page
        const limitToUse = pageNumber === 1 ? limitNumber : 0; // Limit to 10 for the first page, undefined for the second page
        const filters = {};
        if (productName)
            filters.name = { $regex: productName, $options: "i" };
        if (category)
            filters.category = category;
        if (availability)
            filters.availability = availability === "instock";
        try {
            const totalProducts = await productModel_1.default.countDocuments(filters);
            const products = await productModel_1.default.find(filters)
                .populate("category")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitToUse);
            return res.status(HttpStatusCode_1.default.OK).json({
                message: "Get product successfully!",
                data: products,
                totalProducts,
                totalPages: Math.ceil(totalProducts / limitNumber),
                currentPage: pageNumber,
            });
        }
        catch (error) {
            return res.status(HttpStatusCode_1.default.InternalServerError).json({
                message: error,
            });
        }
    },
    getProductByCategory: async (req, res) => {
        try {
            const categoryName = req.params.category;
            const category = await categoryModel_1.default.findOne({
                name: { $regex: new RegExp(categoryName, "i") },
            });
            if (!category) {
                return res.status(HttpStatusCode_1.default.NotFound).json({
                    message: "Category not found",
                });
            }
            // Tìm sản phẩm dựa trên category
            const products = await productModel_1.default.find({
                category: category._id,
            }).populate("category");
            return res.status(HttpStatusCode_1.default.OK).json({
                message: "Get Product by Category Successfully",
                data: products,
            });
        }
        catch (error) {
            return res.status(HttpStatusCode_1.default.InternalServerError).json({
                message: error,
            });
        }
    },
    getProductNewArrivals: async (req, res) => {
        try {
            const newArrivals = await productModel_1.default.find()
                .sort({ createdAt: -1 })
                .limit(5);
            return res.status(HttpStatusCode_1.default.OK).json({
                message: "Get Product new arrivals successfully",
                data: newArrivals,
            });
        }
        catch (error) {
            return res.status(HttpStatusCode_1.default.InternalServerError).json({
                message: error,
            });
        }
    },
    getProductBestSellers: async (req, res) => {
        try {
            const category = await categoryModel_1.default.findOne({ name: "Best Sellers" });
            if (!category) {
                return res.status(HttpStatusCode_1.default.NotFound).json({
                    message: "Category 'Best Sellers' not found",
                });
            }
            const bestSellers = await productModel_1.default.find({
                category: category._id,
            }).limit(5);
            return res.status(HttpStatusCode_1.default.OK).json({
                message: "Get Product new arrivals successfully",
                data: bestSellers,
            });
        }
        catch (error) {
            return res.status(HttpStatusCode_1.default.InternalServerError).json({
                message: error,
            });
        }
    },
    getFeaturedProducts: async (req, res) => {
        try {
            const featuredProduct = await productModel_1.default.find({
                isFeatured: true,
            }).limit(5);
            return res.status(HttpStatusCode_1.default.OK).json({
                message: "Get Product fearture successfully",
                data: featuredProduct,
            });
        }
        catch (error) {
            return res.status(HttpStatusCode_1.default.InternalServerError).json({
                message: error,
            });
        }
    },
    getProductBestReviews: async (req, res) => {
        try {
            const bestReviews = await productModel_1.default.find()
                .sort({ reviewsCount: -1 })
                .limit(5);
            return res.status(HttpStatusCode_1.default.OK).json({
                message: "Get Product best reviews successfully",
                data: bestReviews,
            });
        }
        catch (error) {
            return res.status(HttpStatusCode_1.default.InternalServerError).json({
                message: error,
            });
        }
    },
    getProductById: async (req, res) => {
        const { id } = req.params;
        try {
            const product = await productModel_1.default.findById(id).populate("category");
            if (!product) {
                return res.status(HttpStatusCode_1.default.NotFound).json({
                    message: "Product not found",
                });
            }
            return res.status(HttpStatusCode_1.default.OK).json({
                message: "Get product successfully!",
                data: product,
            });
        }
        catch (error) {
            return res.status(HttpStatusCode_1.default.InternalServerError).json({
                message: error,
            });
        }
    },
    updateProduct: async (req, res) => {
        const { id } = req.params;
        try {
            const sessionUserId = req.userId;
            if (!(0, permission_1.default)(sessionUserId)) {
                res.status(HttpStatusCode_1.default.Unauthorized).json({
                    message: "Permission denied",
                });
            }
            const updateProduct = await productModel_1.default.findByIdAndUpdate(id, req.body, {
                new: true,
            });
            if (!updateProduct) {
                return res.status(HttpStatusCode_1.default.NotFound).json({
                    message: "Product not found!",
                });
            }
            return res.status(HttpStatusCode_1.default.OK).json({
                message: "Updated product successfully!",
                data: updateProduct,
            });
        }
        catch (error) {
            return res.status(HttpStatusCode_1.default.InternalServerError).json({
                message: error,
            });
        }
    },
    deleteProducts: async (req, res) => {
        try {
            const { ids } = req.body;
            if (ids.length === 1) {
                const deleteProduct = await productModel_1.default.findByIdAndDelete(ids[0]);
                if (!deleteProduct) {
                    return res.status(HttpStatusCode_1.default.NotFound).json({
                        message: "Product not found!",
                    });
                }
                return res.status(HttpStatusCode_1.default.OK).json({
                    message: "Delete product successfully!",
                });
            }
            const deleteProducts = await productModel_1.default.deleteMany({
                _id: { $in: ids },
            });
            return res.status(HttpStatusCode_1.default.OK).json({
                message: `${deleteProducts.deletedCount} products deleted successfully`,
                data: deleteProducts,
            });
        }
        catch (error) {
            return res.status(HttpStatusCode_1.default.InternalServerError).json({
                message: error,
            });
        }
    },
};
