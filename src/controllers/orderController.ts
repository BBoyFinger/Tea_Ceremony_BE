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
        // .populate("user", "name")
        // .populate("product", "productName price");
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
