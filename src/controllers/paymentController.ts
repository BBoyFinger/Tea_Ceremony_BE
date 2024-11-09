import { Request, Response } from "express";
import OrderModel from "../models/orderModel";
import querystring from "qs";
import crypto from "crypto";
import sha256 from "sha256";
import { format } from "date-fns";
import * as dotenv from "dotenv";
dotenv.config();

const tmnCode = process.env.VNP_TMN_CODE as string;
const secretKey = process.env.VNP_SECRET_KEY as string; // Ensure this is set in your environment
const url = process.env.VNP_URL as string;
const returnUrl = process.env.VNP_RETURN_URL as string;


const paymentController = {
  createPayment: async (req: Request, res: Response) => {
    
    let vnpUrl = url;
    const date = new Date();
    const ipAddr = req.ip || "127.0.0.1"; // Use request IP or fallback
    const createDate = format(date, "yyyyMMddHHmmss"); // Use date-fns to format the date

    let vnp_Params: Record<string, string> = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: tmnCode,
      vnp_Locale: "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: "1231Sdasd",
      vnp_OrderInfo: "Test",
      vnp_OrderType: "topup",
      vnp_Amount: (100000 * 100).toString(), // Amount * 100
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
      vnp_BankCode: "Ncb",
    };

    vnp_Params = sortObject(vnp_Params);
    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;
    vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });

    console.log(vnpUrl);
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
        console.log("else");
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
