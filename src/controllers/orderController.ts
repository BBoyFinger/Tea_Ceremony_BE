import { Request, Response } from "express";
import OrderModel from "../models/orderModel";
import ProductModel from "../models/productModel";
import UserModel from "../models/userModel";
import HttpStatusCode from "../utils/HttpStatusCode";

interface OrderItem {
  _id: string;
  qty: number;
}

interface ShippingAddress {
  province: string;
  district: string;
  ward: string;
  more: string;
  name: string;
  phone: string;
}

interface PaymentResult {
  id: string;
  status: string;
  update_time: string;
  payer: {
    email_address: string;
  };
}

interface OrderRequest extends Request {
  body: {
    orderItems: OrderItem[];
    to_ward_code: string;
    to_district_id: string;
    shippingAddress: ShippingAddress;
    paymentMethod: string;
    paymentResult?: PaymentResult;
    totalPrice: number;
    status?: string;
    name: string;
    user: string;
  };
}

const orderController = {
  createOrder: async (req: OrderRequest, res: Response) => {
    try {
      if (req.body.orderItems.length === 0) {
        res.json({ message: "Cart is empty" });
      } else {
        const itemIds = req.body.orderItems.map((item) => item._id);
        const itemQuantities = req.body.orderItems.map((item) => item.qty);
        const products = await ProductModel.find({ _id: { $in: itemIds } });

        if (products.length > 0) {
          for (let i = 0; i < products.length; i++) {
            const updatedQuantity = products[i].quantity - itemQuantities[i];
            await ProductModel.updateOne(
              { _id: products[i]._id },
              { $set: { amount: updatedQuantity } }
            ).exec();
          }
        }

        const order = await OrderModel.create({
          order_code: "",
          to_ward_code: req.body.to_ward_code,
          to_district_id: req.body.to_district_id,
          cancelOrder: false,
          orderItems: req.body.orderItems,
          shippingAddress: req.body.shippingAddress,
          paymentMethod: req.body.paymentMethod,
          paymentResult: req.body.paymentResult || "",
          totalPrice: req.body.totalPrice,
          status: req.body.status || "pending",
          name: req.body.name,
          user: req.body.user,
        });

        if (order) {
          res
            .status(HttpStatusCode.Created)
            .send({ message: "New order created", order });
        } else {
          res.status(HttpStatusCode.BadRequest);
          throw new Error("Invalid user data");
        }
      }
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
  getAllOrders: async (req: Request, res: Response) => {
    try {
      const orders = await OrderModel.find({})
        .sort({ createdAt: -1 })
        .populate("user", "name")
        .populate({
          path: "orderItems",
          populate: {
            path: "product",
            model: "Product", // Ensure this matches your Product model name
            select: "productName price images", // Select fields you want to include
          },
        });

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
      const user = req.userId;
      const order = await OrderModel.findById(user)
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

  confirmOrder: async (req: Request, res: Response) => {
    try {
      const { id } = req.params; // Get the order ID from the request parameters
      const updatedOrder = await OrderModel.findByIdAndUpdate(
        id,
        { status: "Processing" }, // Update the status to "Delivering"
        { new: true } // Return the updated document
      );

      if (!updatedOrder) {
        return res.status(HttpStatusCode.NotFound).json({
          message: "Order not found",
        });
      }

      res.status(HttpStatusCode.OK).json({
        message: "Order status updated successfully",
        data: updatedOrder,
      });
    } catch (error: any) {
      res.status(HttpStatusCode.InternalServerError).json({
        message: error.message,
      });
    }
  },

  getOrdersByUserId: async (req: Request, res: Response) => {
    try {
      const orders = await OrderModel.find({ user: req.params.userId }) // Find orders by user ID
        .populate("user", "name") // Populate user details
        .populate("orderItems.product", "productName price images "); // Populate product details in orderItems

      res
        .status(HttpStatusCode.OK)
        .json({ message: "Get Orders Successfully!", data: orders });
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

  deleteOrder: async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const userId = req.userId; // Assuming user ID is available in req.user

    try {
      const order = await OrderModel.findById(orderId);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      await order.deleteOne();

      res.status(200).json({ message: "Order deleted successfully", order });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },
};

export default orderController;
