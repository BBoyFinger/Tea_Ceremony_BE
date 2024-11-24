import { Request, Response } from "express";
import OrderModel from "../models/orderModel";
import ProductModel from "../models/productModel";
import UserModel from "../models/userModel";
import HttpStatusCode from "../utils/HttpStatusCode";
import axios from "axios";

interface OrderItem {
  _id: string;
  qty: number;
}

interface Productitem {
  productName: string;
  quantity: number;
  price: number;
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
  updateOrderGhn: async (req: Request, res: Response) => {
    try {
      const updateOrder = await OrderModel.findById(req.params.id).populate({
        path: "orderItems",
        populate: {
          path: "product",
          model: "Product",
          select: "productName price images",
        },
      });

      if (!updateOrder) {
        return res.status(404).json({ message: "Order not found" });
      }

      const items = updateOrder.orderItems.map((x: any) => ({
        productName: x.product.productName,
        quantity: parseInt(x.quantity.toString(), 10),
        price: x.price,
      }));

      // Ensure these values are correct and match GHN's expected values
      const toProvinceName = "Hồ Chí Minh"; // Example: Use the official name
      const toDistrictName = "Quận 11"; // Example: Use the official name
      const toWardName = "Phường 5"; // Example: Use the official name

      // const orderGhn = {
      //   payment_type_id: 2,
      //   note: "Tintest 123",
      //   from_name: "Tin",
      //   from_phone: "0705944385",
      //   from_address: "123 Đường 3/2",
      //   from_ward_name: "Phường 5",
      //   from_district_name: "Quận 11",
      //   from_province_name: "HCM",
      //   required_note: "KHONGCHOXEMHANG",
      //   return_name: "Hoang Tien Anh",
      //   return_phone: "0705944385",
      //   return_address: "K1050 Ngo Quyen",
      //   return_ward_name: "An Hai Bac",
      //   return_district_name: "Quận Sơn Tra",
      //   return_province_name: "HCM",
      //   client_order_code: "",
      //   to_name: updateOrder.shippingAddress.name,
      //   to_phone: updateOrder.shippingAddress.phone,
      //   to_address: `${toProvinceName}, ${toDistrictName}, ${toWardName}, ${updateOrder.shippingAddress.detail}`,
      //   to_ward_name: toWardName,
      //   to_district_name: toDistrictName,
      //   to_province_name: toProvinceName,
      //   cod_amount:
      //     updateOrder.paymentMethod === "payOnline"
      //       ? 0
      //       : updateOrder.totalPrice,
      //   content: "Theo New York Times",
      //   weight: 200,
      //   length: 1,
      //   width: 19,
      //   height: 10,
      //   cod_failed_amount: 2000,
      //   pick_station_id: 1444,
      //   deliver_station_id: null,
      //   insurance_value: 10000000,
      //   service_id: 0,
      //   service_type_id: 2,
      //   coupon: null,
      //   pick_shift: null,
      //   pickup_time: 1665272576,
      //   items: [
      //     {
      //       name: "Áo Polo",
      //       code: "Polo123",
      //       quantity: 1,
      //       price: 200000,
      //       length: 12,
      //       width: 12,
      //       height: 12,
      //       weight: 1200,
      //       category: {
      //         level1: "Áo",
      //       },
      //     },
      //   ],
      // };

      const orderGhn = {
        payment_type_id: 2,
        note: "Tintest 123",
        required_note: "KHONGCHOXEMHANG",
        from_name: "TinTest124",
        from_phone: "0987654321",
        from_address: "72 Thành Thái, Phường 14, Quận 10, Hồ Chí Minh, Vietnam",
        from_ward_name: "Phường 14",
        from_district_name: "Quận 10",
        from_province_name: "HCM",
        return_name: "Hoang Tien Anh", // Assuming this remains unchanged
        return_phone: "0332190444",
        return_address: "39 NTT",
        return_ward_name: "", // Assuming this is intentionally left blank
        return_district_name: null, // Assuming this is intentionally left null
        return_province_name: "HCM", // Assuming this remains unchanged
        client_order_code: "",
        to_name: updateOrder.shippingAddress.name,
        to_phone: updateOrder.shippingAddress.phone,
        to_address: `${toProvinceName}, ${toDistrictName}, ${toWardName}, ${updateOrder.shippingAddress.detail}`,
        to_ward_code: "20308",
        to_district_id: 1444,
        cod_amount:
          updateOrder.paymentMethod === "payOnline"
            ? 0
            : updateOrder.totalPrice,
        content: "Theo New York Times",
        weight: 200,
        length: 1,
        width: 19,
        height: 10,
        cod_failed_amount: 2000, // Assuming this remains unchanged
        pick_station_id: 1444,
        deliver_station_id: null,
        insurance_value: 100000,
        service_id: 0,
        service_type_id: 2,
        coupon: null,
        pick_shift: [2],
        pickup_time: 1665272576, // Assuming this remains unchanged
        items: [
          {
            name: "Áo Polo",
            code: "Polo123",
            quantity: 1,
            price: 2000,
            length: 12,
            width: 12,
            height: 12,
            weight: 1200,
            category: {
              level1: "Áo",
            },
          },
        ],
      };

      const headers = {
        "Content-Type": "application/json",
        ShopId: "5441049",
        Token: "497989ae-9cc3-11ef-abbe-867a64c2e80d",
      };

      const response = await axios.post(
        "https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/create",
        orderGhn,
        { headers }
      );

      const data = response.data;
      console.log(data);

      const order_code = data.order_code;
      updateOrder.order_code = order_code;
      await updateOrder.save();
      res.json(data);

      // ... rest of your function
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(400).json({
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  printOrder: async (req: Request, res: Response) => {
    try {
      // Fetch the order by ID

      const order = await OrderModel.findById(req.params.orderId);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      try {
        // Request a token from GHN API
        const { data } = await axios.get(
          "https://online-gateway.ghn.vn/shiip/public-api/v2/a5/gen-token",
          {
            headers: {
              Token: "497989ae-9cc3-11ef-abbe-867a64c2e80d", // Replace with your actual token
            },
            params: {
              order_codes: order?.order_code,
            },
          }
        );

        const token = data.data.token;
        order.token = token; // Save the token to the order if needed
        await order.save();

        // Generate the print URL using the token
        const result = await axios.get(
          `https://online-gateway.ghn.vn/a5/public-api/printA5?token=${token}`,
          {
            headers: {
              Token: "497989ae-9cc3-11ef-abbe-867a64c2e80d", // Replace with your actual token
            },
          }
        );

        // Send the print URL back to the client
        res.send(result.config.url);
      } catch (error) {
        console.error("Error generating print URL:", error);
        res.status(500).json({ message: "Error generating print URL" });
      }
    } catch (error: any) {
      console.error("Error fetching order:", error);
      res.status(400).json({ message: error.message });
    }
  },
  getProvinces: async (req: Request, res: Response) => {
    try {
      const response = await axios.get(
        "https://online-gateway.ghn.vn/shiip/public-api/master-data/province",
        {
          headers: {
            token: process.env.TOKEN_GHN, // Use the token from environment variables
          },
        }
      );
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch provinces" });
    }
  },

  getDistricts: async (req: Request, res: Response) => {
    const { province_id } = req.query; // Get province_id from query parameters
    try {
      const response = await axios.get(
        "https://online-gateway.ghn.vn/shiip/public-api/master-data/district",
        {
          headers: {
            token: process.env.TOKEN_GHN, // Use the token from environment variables
          },
          params: {
            province_id,
          },
        }
      );
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },

  getWards: async (req: Request, res: Response) => {
    const { district_id } = req.query; // Get district_id from query parameters
    try {
      const response = await axios.get(
        "https://online-gateway.ghn.vn/shiip/public-api/master-data/ward",
        {
          headers: {
            token: process.env.TOKEN_GHN, // Use the token from environment variables
          },
          params: {
            district_id,
          },
        }
      );
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wards" });
    }
  },

  getAllOrderPaypal: async (req: Request, res: Response) => {
    try {
      const Order = await OrderModel.find({ paymentMethod: "payOnline" }).sort({
        createdAt: -1,
      });
      if (Order) {
        res.json(Order);
      } else {
        res.status(401).json({ message: "no order" });
      }
    } catch (error: any) {
      res.status(400).json({ message: error.message });
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
