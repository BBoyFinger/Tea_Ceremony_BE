import mongoose, { Schema } from "mongoose";
import { IProduct } from "../utils/type";

// Tạo schema cho product
const ProductSchema: Schema<IProduct> = new Schema(
  {
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
      type: mongoose.Schema.Types.ObjectId,
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
  },
  {
    timestamps: true, // tự động tạo `createdAt` và `updatedAt`
  }
);

// Tạo model từ schema và export
const ProductModel = mongoose.model<IProduct>("Product", ProductSchema);
export default ProductModel;
