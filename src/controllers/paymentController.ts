import { Request, Response } from "express";
import OrderModel from "../models/orderModel";
import querystring from "qs";
import crypto from "crypto";
import sha256 from "sha256";
import { format } from "date-fns";
import * as dotenv from "dotenv";
import { v4 as uuidv4 } from 'uuid';
dotenv.config();

const tmnCode = process.env.VNP_TMN_CODE as string;
const secretKey = process.env.VNP_SECRET_KEY as string; // Ensure this is set in your environment
const url = process.env.VNP_URL as string;
const returnUrl = process.env.VNP_RETURN_URL as string;


// Ngân hàng	NCB
// Số thẻ	9704198526191432198
// Tên chủ thẻ	NGUYEN VAN A
// Ngày phát hành	07/15
// Mật khẩu OTP	123456
const uniqueTxnRef = uuidv4();

const paymentController = {
  createPayment: async (req: Request, res: Response) => {
<<<<<<< HEAD
  
=======
>>>>>>> fd9f3123a7f5d54b1569b58c727666f8cc32364c
    let vnpUrl = url;
    const date = new Date();
    const ipAddr = req.ip || "127.0.0.1";
    const createDate = format(date, "yyyyMMddHHmmss");

    // Generate a unique transaction reference
    const uniqueTxnRef = uuidv4();
    console.log("Generated UUID for transaction:", uniqueTxnRef);

    let vnp_Params: Record<string, string> = {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode: tmnCode,
        vnp_Locale: "vn",
        vnp_CurrCode: "VND",
        vnp_TxnRef: uniqueTxnRef,
        vnp_OrderInfo: "Test",
        vnp_OrderType: "topup",
        vnp_Amount: (100000 * 100).toString(),
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate,
        vnp_BankCode: "Ncb",
    };

    console.log("VNPay Parameters:", vnp_Params);

    vnp_Params = sortObject(vnp_Params);
    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;
    vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });

    console.log("Generated VNPay URL:", vnpUrl);
    res.status(200).json({ code: "00", data: vnpUrl });
},

  returnPayment: async (req: Request, res: Response) => {
    console.log("returnPayment");
    try {
      let vnp_Params = req.query as Record<string, string>;
      const secureHash = vnp_Params.vnp_SecureHash;

      delete vnp_Params.vnp_SecureHash;
      delete vnp_Params.vnp_SecureHashType;

      vnp_Params = sortObject(vnp_Params);
      const signData =
        secretKey + querystring.stringify(vnp_Params, { encode: false });
      const checkSum = sha256(signData);

      const id = vnp_Params.vnp_TxnRef;

      if (secureHash === checkSum) {
        console.log("if 1");
        if (vnp_Params.vnp_ResponseCode === "00") {
          console.log("if 2");
          res.status(200).json({ code: vnp_Params.vnp_ResponseCode });
        } else {
          const DeleteOrder = await OrderModel.findById(id);
          if (DeleteOrder) {
            await DeleteOrder.deleteOne({ _id: id });
          }
          res.status(200).json({ code: vnp_Params.vnp_ResponseCode });
        }
      } else {
        res.status(200).json({ code: "97" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
  inpPayment: async (req: Request, res: Response) => {
    console.log("inpPayment");
    let vnp_Params = req.query as Record<string, string>;
    const secureHash = vnp_Params.vnp_SecureHash;

    delete vnp_Params.vnp_SecureHash;
    delete vnp_Params.vnp_SecureHashType;

    vnp_Params = sortObject(vnp_Params);

    const signData =
      secretKey + querystring.stringify(vnp_Params, { encode: false });
    const checkSum = sha256(signData);

    if (secureHash === checkSum) {
      res.status(200).json({ RspCode: "00", Message: "success" });
    } else {
      res.status(200).json({ RspCode: "97", Message: "Fail checksum" });
    }
  },
};

function sortObject(obj: Record<string, string>): Record<string, string> {
  const sorted: Record<string, string> = {};
  const keys = Object.keys(obj).sort();
  keys.forEach((key) => {
    sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, "+");
  });
  return sorted;
}

export default paymentController;
