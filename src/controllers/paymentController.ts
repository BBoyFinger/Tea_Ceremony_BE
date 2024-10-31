import { Request, Response } from "express";
import crypto from "crypto";
import axios from "axios";
import moment from "moment";

// APP INFO
const config = {
  app_id: "2553",
  key1: "sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn",
  key2: "trMrHtvjo6myautxDUiAcYsVtaeQ8nhf",
  endpoint: "https://sb-openapi.zalopay.vn/v2/create",
};

const paymentController = {
  createPayment: async (req: Request, res: Response) => {
    const embed_data = JSON.stringify({
      redirecturl: "http://localhost:3000/checkout",
    });

    const items = JSON.stringify([{ name: "sample item" }]);
    const transID = Math.floor(Math.random() * 1000000);

    const order = {
      app_id: config.app_id,
      app_trans_id: `${moment().format("YYMMDD")}_${transID}`,
      app_user: "user123",
      app_time: Date.now(),
      item: items,
      embed_data: embed_data,
      amount: 50000,
      description: `Lazada - Payment for the order #${transID}`,
      bank_code: "",
      mac: "",
    };

    // Tạo chữ ký MAC
    const data =
      config.app_id +
      "|" +
      order.app_trans_id +
      "|" +
      order.app_user +
      "|" +
      order.amount +
      "|" +
      order.app_time +
      "|" +
      order.embed_data +
      "|" +
      order.item;

    order.mac = crypto
      .createHmac("sha256", config.key2)
      .update(data)
      .digest("hex");

    try {
      // Gửi yêu cầu tạo thanh toán tới Zalo Pay
      const response = await axios.post(config.endpoint, order);
      if (response.data.return_code === 1) {
        res.status(200).json({ paymentUrl: response.data.order_url });
      } else {
        res.status(400).json({ message: response.data.return_message });
      }
    } catch (error: any) {
      const errorMessage = error.response ? error.response.data : error.message;
      res
        .status(500)
        .json({ message: "Lỗi tạo đơn hàng thanh toán", error: errorMessage });
    }
  },
};

export default paymentController;
