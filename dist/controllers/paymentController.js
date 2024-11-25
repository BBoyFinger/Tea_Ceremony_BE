"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const orderModel_1 = __importDefault(require("../models/orderModel"));
const qs_1 = __importDefault(require("qs"));
const sha256_1 = __importDefault(require("sha256"));
const date_fns_1 = require("date-fns");
const dotenv = __importStar(require("dotenv"));
const uuid_1 = require("uuid");
const crypto_1 = require("crypto");
dotenv.config();
const tmnCode = process.env.VNP_TMN_CODE;
const secretKey = process.env.VNP_SECRET_KEY; // Ensure this is set in your environment
const url = process.env.VNP_URL;
const returnUrl = process.env.VNP_RETURN_URL;
// Ngân hàng	NCB
// Số thẻ	9704198526191432198
// Tên chủ thẻ	NGUYEN VAN A
// Ngày phát hành	07/15
// Mật khẩu OTP	123456
const paymentController = {
    createPayment: async (req, res) => {
        let vnpUrl = url;
        const date = new Date();
        const ipAddr = req.ip || "127.0.0.1";
        const createDate = (0, date_fns_1.format)(date, "yyyyMMddHHmmss");
        // Generate a unique transaction reference
        const uniqueTxnRef = (0, uuid_1.v4)();
        console.log("Generated UUID for transaction:", uniqueTxnRef);
        let vnp_Params = {
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
        const signData = qs_1.default.stringify(vnp_Params, { encode: false });
        const hmac = (0, crypto_1.createHmac)("sha256", secretKey);
        const signed = hmac
            .update(new Uint8Array(Buffer.from(signData, "utf-8")))
            .digest("hex");
        vnp_Params["vnp_SecureHash"] = signed;
        vnpUrl += "?" + qs_1.default.stringify(vnp_Params, { encode: false });
        console.log("Generated VNPay URL:", vnpUrl);
        res.status(200).json({ code: "00", data: vnpUrl });
    },
    returnPayment: async (req, res) => {
        console.log("returnPayment");
        try {
            let vnp_Params = req.query;
            const secureHash = vnp_Params.vnp_SecureHash;
            delete vnp_Params.vnp_SecureHash;
            delete vnp_Params.vnp_SecureHashType;
            vnp_Params = sortObject(vnp_Params);
            const signData = secretKey + qs_1.default.stringify(vnp_Params, { encode: false });
            const checkSum = (0, sha256_1.default)(signData);
            const id = vnp_Params.vnp_TxnRef;
            if (secureHash === checkSum) {
                console.log("if 1");
                if (vnp_Params.vnp_ResponseCode === "00") {
                    console.log("if 2");
                    res.status(200).json({ code: vnp_Params.vnp_ResponseCode });
                }
                else {
                    const DeleteOrder = await orderModel_1.default.findById(id);
                    if (DeleteOrder) {
                        await DeleteOrder.deleteOne({ _id: id });
                    }
                    res.status(200).json({ code: vnp_Params.vnp_ResponseCode });
                }
            }
            else {
                res.status(200).json({ code: "97" });
            }
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    inpPayment: async (req, res) => {
        console.log("inpPayment");
        let vnp_Params = req.query;
        const secureHash = vnp_Params.vnp_SecureHash;
        delete vnp_Params.vnp_SecureHash;
        delete vnp_Params.vnp_SecureHashType;
        vnp_Params = sortObject(vnp_Params);
        const signData = secretKey + qs_1.default.stringify(vnp_Params, { encode: false });
        const checkSum = (0, sha256_1.default)(signData);
        if (secureHash === checkSum) {
            res.status(200).json({ RspCode: "00", Message: "success" });
        }
        else {
            res.status(200).json({ RspCode: "97", Message: "Fail checksum" });
        }
    },
};
function sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    keys.forEach((key) => {
        sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, "+");
    });
    return sorted;
}
exports.default = paymentController;
