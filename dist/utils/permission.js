"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = __importDefault(require("../models/userModel"));
const uploadProductPermission = async (userId) => {
    const user = await userModel_1.default.findById(userId);
    if (user?.role !== "ADMIN") {
        return false;
    }
    return true;
};
exports.default = uploadProductPermission;
