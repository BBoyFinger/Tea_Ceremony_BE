import { Request, Response } from "express";
import OrderModel from "../models/orderModel";
import ProductModel from "../models/productModel";
import UserModel from "../models/userModel";
import HttpStatusCode from "../utils/HttpStatusCode";

const orderController = {
  createOrder: async (req: Request, res: Response) => {
    try {
      const { userId, productId, quantity } = req.body;

      // check user and product
      const user = await UserModel.findById(userId);
      const product = await ProductModel.findById(productId);

      if (!user || !product) {
        return res.status(HttpStatusCode.NotFound).json({
          message: "User or Product not found",
        });
      }

      const order = new OrderModel({
        user: userId,
        product: productId,
        quantity,
      });
      await order.save();
      res.status(HttpStatusCode.Created).json({
        data: order,
      });
    } catch (error: any) {
      res.status(HttpStatusCode.InternalServerError).json({
        message: error.message,
      });
    }
  },
  getAllOrders: async (req: Request, res: Response) => {
    try {
      const orders = await OrderModel.find()
        .populate("user", "name")
        .populate("product", "productName price");
      res
        .status(HttpStatusCode.OK)
        .json({ message: "Get All Order Successfully!", data: orders });
    } catch (error: any) {
      res.status(HttpStatusCode.InternalServerError).json({
        message: error.message,
      });
    }
  },

  getOrderById: async (req: Request, res: Response) => {
    try {
      const order = await OrderModel.findById(req.params.id)
        .populate("user", "name")
        .populate("product", "productName price");
      res
        .status(HttpStatusCode.OK)
        .json({ message: "Get Order Successfully!", data: order });
    } catch (error: any) {
      res.status(HttpStatusCode.InternalServerError).json({
        message: error.message,
      });
    }
  },

  updateOrder: async (req: Request, res: Response) => {
    try {
      const order = await OrderModel.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!order)
        return res
          .status(HttpStatusCode.NotFound)
          .json({ message: "Order not found" });
      res.status(HttpStatusCode.OK).json({
        message: "Update Order successfully",
        data: order,
      });
    } catch (error: any) {
      res.status(HttpStatusCode.InternalServerError).json({
        message: error.message,
      });
    }
  },

  deleteOrders: async (req: Request, res: Response) => {
    try {
      const { ids } = req.body;
      if (ids.length === 1) {
        const deleteOrder = await OrderModel.findByIdAndDelete(ids[0]);
        if (!deleteOrder) {
          return res.status(HttpStatusCode.NotFound).json({
            message: "Order not found!",
          });
        }
        return res.status(HttpStatusCode.OK).json({
          message: "Delete Order successfully!",
        });
      }
      const order = await OrderModel.deleteMany({
        _id: { $in: ids },
      });
      if (!order) {
        return res
          .status(HttpStatusCode.NotFound)
          .json({ message: "Order not found" });
      }

      res.status(HttpStatusCode.NoContent).json({
        data: "Delete order successfully!",
      });
    } catch (error: any) {
      res.status(HttpStatusCode.InternalServerError).json({
        message: error.message,
      });
    }
  },
};

export default orderController;
