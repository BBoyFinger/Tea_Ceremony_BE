"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
// Tạo schema cho product
const ProductSchema = new mongoose_1.Schema({
    productName: { type: String, required: true },
    description: { type: String, required: false },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 0 },
    images: [
        {
            url: { type: String, required: true },
            title: { type: String, required: true },
        },
    ],
    category: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Category", // Liên kết với model Category
        required: true,
    },
    material: { type: String, required: false },
    stockQuantity: { type: Number, required: true }, // Số lượng hàng tồn kho
    availability: { type: String, required: true }, // Trạng thái hàng hóa (ví dụ: "còn hàng", "hết hàng")
    averageRating: { type: Number, default: 0 }, // Điểm đánh giá trung bình của sản phẩm
    reviewsCount: { type: Number, default: 0 }, // Số lượng đánh giá
    reviews: [
        {
            user: { type: String, required: true }, // Người dùng đánh giá sản phẩm
            rating: { type: Number, required: true }, // Số sao mà người dùng đánh giá sản phẩm
            comment: { type: String, required: true }, // Bình luận của người dùng về sản phẩm
        },
    ],
    discount: { type: Number }, // Phần trăm giảm giá (nếu có)
    isFeatured: { type: Boolean, default: false }, // Xác định sản phẩm có phải là sản phẩm nổi bật hay không
    brand: { type: String, required: true }, // Thương hiệu của sản phẩm
}, {
    timestamps: true, // tự động tạo `createdAt` và `updatedAt`
});
// Tạo model từ schema và export
const ProductModel = mongoose_1.default.model("Product", ProductSchema);
exports.default = ProductModel;
