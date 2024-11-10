import mongoose, { Schema } from "mongoose";
import { IOrder } from "../utils/type";

const generateOrderCode = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

const OrderSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    paymentMethod: String,
    shippingAddress: {
      province: { type: String },
      district: { type: String },
      ward: { type: String },
      detail: { type: String },
      name: { type: String },
      phone: { type: String },
    },
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String,
    },
    order_code: {
      type: String,
      default: generateOrderCode,
    },
    to_ward_code: String,
    to_district_id: Number,
    token: String,

    cancelOrder: Boolean,
  },
  { timestamps: true }
);

OrderSchema.pre("save", function (next) {
  if (!this.order_code) {
    this.order_code = generateOrderCode();
  }
  next();
});

const OrderModel = mongoose.model<IOrder>("Order", OrderSchema);
export default OrderModel;
