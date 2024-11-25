import mongoose, { Schema } from "mongoose";

// Tạo schema cho product
const addToCart = new Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    },
    quantity: Number,
    userId: String,
  },
  {
    timestamps: true, // tự động tạo `createdAt` và `updatedAt`
  }
);

// Tạo model từ schema và export
const addToCartModel = mongoose.model("addToCart", addToCart);
export default addToCartModel;
