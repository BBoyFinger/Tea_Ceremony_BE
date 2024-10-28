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
    const embed_data = {
      redirecturl: "http://localhost:3000/checkout"
    };

    
    console.log("Helolo")

    const items = [{}];
    const transID = Math.floor(Math.random() * 1000000);
    const order = {
      app_id: config.app_id,
      app_trans_id: `${moment().format("YYMMDD")}_${transID}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
      app_user: "user123",
      app_time: Date.now(), // miliseconds
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embed_data),
      amount: 50000,
      description: `Lazada - Payment for the order #${transID}`,
      bank_code: "",
      mac: "",
    };

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
    const mac = crypto
      .createHmac("sha256", config.key1)
      .update(data)
      .digest("hex");

    order.mac = mac;

    try {
      // Gửi yêu cầu tạo thanh toán tới Zalo Pay
      const response = await axios.post(config.endpoint, data);
      if (response.data.return_code === 1) {
        res.status(200).json({ paymentUrl: response.data.order_url });
      } else {
        res.status(400).json({ message: response.data.return_message });
      }
    } catch (error) {
      res.status(500).json({ message: "Lỗi tạo đơn hàng thanh toán" });
    }
  },
};

export default paymentController;
