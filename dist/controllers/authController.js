"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const HttpStatusCode_1 = __importDefault(require("../utils/HttpStatusCode"));
const userModel_1 = __importDefault(require("../models/userModel"));
const permission_1 = __importDefault(require("../utils/permission"));
const cartProduct_1 = __importDefault(require("../models/cartProduct"));
const authController = {
    userSignUp: async (req, res) => {
        try {
            const { name, email, password } = req.body;
            // Kiểm tra xem email đã tồn tại chưa
            const isEmail = await userModel_1.default.findOne({ email });
            if (isEmail) {
                return res.status(HttpStatusCode_1.default.Conflict).json({
                    message: "User already exists!",
                    error: true,
                    success: false,
                });
            }
            // Kiểm tra các trường bắt buộc
            if (!email || !password || !name) {
                return res.status(HttpStatusCode_1.default.BadRequest).json({
                    message: "Please fill in all required fields!",
                    error: true,
                    success: false,
                });
            }
            // Tạo salt và hash mật khẩu
            const salt = bcrypt_1.default.genSaltSync(10);
            const hashPassword = bcrypt_1.default.hashSync(password, salt);
            if (!hashPassword) {
                throw new Error("Something went wrong while hashing the password!");
            }
            // Tạo payload người dùng
            const payload = {
                ...req.body,
                password: hashPassword,
            };
            const registerUser = new userModel_1.default(payload);
            const saveUser = await registerUser.save();
            return res.status(HttpStatusCode_1.default.OK).json({
                message: "User created successfully!",
                data: saveUser,
                error: false,
                success: true,
            });
        }
        catch (error) {
            return res.status(HttpStatusCode_1.default.InternalServerError).json({
                message: error.message || "An error occurred",
                error: true,
                success: false,
            });
        }
    },
    userSignIn: async (req, res) => {
        try {
            const { email, password } = req.body;
            // Kiểm tra email và password có tồn tại
            if (!email || !password) {
                return res.status(HttpStatusCode_1.default.BadRequest).json({
                    message: "Please enter both email and password!",
                    error: true,
                    success: false,
                });
            }
            // Tìm người dùng
            const user = await userModel_1.default.findOne({ email });
            if (!user) {
                return res.status(HttpStatusCode_1.default.NotFound).json({
                    message: "User not found!",
                    error: true,
                    success: false,
                });
            }
            // So sánh mật khẩu
            const checkPassword = bcrypt_1.default.compareSync(password, user.password);
            if (!checkPassword) {
                return res.status(HttpStatusCode_1.default.Unauthorized).json({
                    message: "Invalid password!",
                    error: true,
                    success: false,
                });
            }
            const payload = {
                _id: user.id,
                email: user.email,
            };
            const token = await jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET_KEY || "default-secret-key", {
                expiresIn: 60 * 60 * 24,
            });
            const tokenOption = {
                httpOnly: true,
                secure: true,
                sameSite: "none",
            };
            // Trả về kết quả đăng nhập thành công
            return res
                .cookie("token", token, tokenOption)
                .status(HttpStatusCode_1.default.OK)
                .json({
                message: "Login successful!",
                data: { token },
                error: false,
                success: true,
            });
        }
        catch (error) {
            return res.status(HttpStatusCode_1.default.InternalServerError).json({
                message: error.message || "An error occurred",
                error: true,
                success: false,
            });
        }
    },
    userDetail: async (req, res) => {
        try {
            const userDetail = await userModel_1.default.findById(req.userId).select("-password");
            if (!userDetail) {
                throw new Error("Something went wrong");
            }
            return res.status(HttpStatusCode_1.default.OK).json({
                message: "Get user successfully!",
                data: userDetail,
                error: false,
                success: true,
            });
        }
        catch (error) {
            return res.status(HttpStatusCode_1.default.InternalServerError).json({
                message: error.message || error,
                error: true,
                sucess: false,
            });
        }
    },
    userLogout: async (req, res) => {
        try {
            res.clearCookie("token");
            return res.status(HttpStatusCode_1.default.OK).json({
                message: "Logged out successfully",
                error: false,
                success: true,
                data: [],
            });
        }
        catch (error) {
            return res.status(HttpStatusCode_1.default.InternalServerError).json({
                message: error.message || error,
                error: true,
                sucess: false,
            });
        }
    },
    refreshToken: async (req, res) => {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return res.status(HttpStatusCode_1.default.Unauthorized).json({
                    message: "No refresh token provided",
                });
            }
            const refreshSecretKey = process.env.REFRESH_SECRET_KEY;
            if (!refreshSecretKey) {
                console.error("Refresh secret key is not set in environment variables");
                return res.status(500).json({ message: "Internal server error" });
            }
            jsonwebtoken_1.default.verify(refreshToken, refreshSecretKey, (err, user) => {
                if (err) {
                    return res.status(403).json({ message: "Invalid refresh token" });
                }
                // Generate new tokens
                const tokens = generateTokens(user); // Assume generateTokens is a function that creates new tokens
                res.cookie("refreshToken", tokens.refreshToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "strict",
                });
                res.json({ accessToken: tokens.accessToken });
            });
        }
        catch (error) {
            return res.status(HttpStatusCode_1.default.InternalServerError).json({
                message: error.message || error,
                error: true,
                sucess: false,
            });
        }
    },
    getAllUser: async (req, res) => {
        try {
            const { name, email, role } = req.query;
            // Tạo object query tìm kiếm
            const query = {};
            if (name) {
                query.name = { $regex: name, $options: "i" }; // Tìm kiếm không phân biệt chữ hoa/thường
            }
            if (email) {
                query.email = { $regex: email, $options: "i" };
            }
            if (role) {
                query.role = role; // Lọc chính xác theo role
            }
            const users = await userModel_1.default.find(query);
            const sessionUserId = req.userId;
            if (!(0, permission_1.default)(sessionUserId)) {
                res.status(HttpStatusCode_1.default.Unauthorized).json({
                    message: "Permission denied",
                });
            }
            if (!users) {
                throw new Error("Something went wrong ");
            }
            return res.status(200).json({
                message: "Get All User successfully",
                data: users,
                error: true,
                sucess: false,
            });
        }
        catch (error) {
            return res.status(HttpStatusCode_1.default.InternalServerError).json({
                message: error.message || error,
                error: true,
                sucess: false,
            });
        }
    },
    deleteUsers: async (req, res) => {
        const { ids } = req.body;
        if (!ids || ids.length === 0) {
            return res.status(400).json({ message: "No user IDs provided" });
        }
        try {
            if (ids.length === 1) {
                const deleteUser = await userModel_1.default.findByIdAndDelete(ids[0]);
                if (!deleteUser) {
                    return res
                        .status(HttpStatusCode_1.default.NotFound)
                        .json({ user: "User not found!" });
                }
                return res
                    .status(HttpStatusCode_1.default.OK)
                    .json({ message: "User deleted successfully" });
            }
            const deleteManyUsers = await userModel_1.default.deleteMany({ _id: { $in: ids } });
            return res.status(200).json({
                message: `${deleteManyUsers.deletedCount} users deleted successfully`,
            });
        }
        catch (error) {
            return res.status(HttpStatusCode_1.default.InternalServerError).json({
                message: error.message || error,
                error: true,
                sucess: false,
            });
        }
    },
    updateUser: async (req, res) => {
        try {
            const userSession = req.userId;
            const { userId, email, name, role, status, phone, address, pictureImg } = req.body;
            const payload = {
                ...(email && { email: email }),
                ...(name && { name: name }),
                ...(phone && { phone: phone }),
                ...(address && { address: address }),
                ...(role && { role: role }),
                ...(status && { status: status }),
                ...(pictureImg && { pictureImg: pictureImg }),
            };
            const updateUser = await userModel_1.default.findByIdAndUpdate(userId, payload);
            return res.status(HttpStatusCode_1.default.OK).json({
                data: updateUser,
                message: "Update user successfully!",
                success: true,
                error: false,
            });
        }
        catch (error) {
            return res.status(HttpStatusCode_1.default.InternalServerError).json({
                message: error.message || error,
                error: true,
                sucess: false,
            });
        }
    },
    addToCart: async (req, res) => {
        try {
            const { productId } = req.body;
            const user = req.userId;
            // Tìm sản phẩm trong giỏ hàng của người dùng
            const existingCartItem = await cartProduct_1.default.findOne({
                productId,
                userId: user,
            });
            if (existingCartItem) {
                // Nếu sản phẩm đã tồn tại, tăng quantity lên 1
                existingCartItem.quantity = existingCartItem.quantity ?? 0;
                existingCartItem.quantity += 1;
                await existingCartItem.save();
                return res.status(HttpStatusCode_1.default.OK).json({
                    message: "Product quantity updated in cart!",
                    data: existingCartItem,
                    success: true,
                    error: false,
                });
            }
            // Nếu sản phẩm chưa tồn tại, thêm sản phẩm mới vào giỏ hàng
            const payload = {
                productId: productId,
                quantity: 1,
                userId: user,
            };
            const newAddToCart = new cartProduct_1.default(payload);
            const saveProduct = await newAddToCart.save();
            return res.status(HttpStatusCode_1.default.Created).json({
                message: "Product added to cart!",
                data: saveProduct,
                success: true,
                error: false,
            });
        }
        catch (error) {
            return res.status(HttpStatusCode_1.default.InternalServerError).json({
                message: error.message || error,
                error: true,
                success: false,
            });
        }
    },
    countAddToCart: async (req, res) => {
        try {
            const userId = req.userId;
            const count = await cartProduct_1.default.countDocuments({
                userId: userId,
            });
            return res.status(HttpStatusCode_1.default.OK).json({
                data: {
                    count: count,
                },
                message: "OK",
            });
        }
        catch (error) {
            return res.status(HttpStatusCode_1.default.InternalServerError).json({
                message: error.message || error,
                error: true,
                sucess: false,
            });
        }
    },
    viewProductCart: async (req, res) => {
        try {
            const userId = req.userId;
            const allProduct = await cartProduct_1.default
                .find({
                userId: userId,
            })
                .populate("productId");
            return res.status(HttpStatusCode_1.default.OK).json({
                data: allProduct,
                message: "OK",
            });
        }
        catch (error) {
            return res.status(HttpStatusCode_1.default.InternalServerError).json({
                message: error.message || error,
                error: true,
                sucess: false,
            });
        }
    },
    updateAddToCartProduct: async (req, res) => {
        try {
            const userId = req.userId;
            const addToCartProductId = req.body._id;
            const qty = req.body.quantity;
            const updateProduct = await cartProduct_1.default.updateOne({ _id: addToCartProductId, userId }, {
                ...(qty && { quantity: qty }),
            });
            return res.status(HttpStatusCode_1.default.OK).json({
                message: "Product Updated Successfully",
                data: updateProduct,
            });
        }
        catch (error) {
            return res.status(HttpStatusCode_1.default.InternalServerError).json({
                message: error.message || error,
                error: true,
                sucess: false,
            });
        }
    },
    deleteAddToCartProduct: async (req, res) => {
        try {
            const userId = req.userId;
            const addToCartProductId = req.body._id;
            const deleteProduct = await cartProduct_1.default.deleteOne({
                _id: addToCartProductId,
            });
            return res.status(HttpStatusCode_1.default.OK).json({
                message: "Product Deleted from cart Successfully",
                data: deleteProduct,
            });
        }
        catch (error) {
            return res.status(HttpStatusCode_1.default.InternalServerError).json({
                message: error.message || error,
                error: true,
                sucess: false,
            });
        }
    },
    removeAllProductsFromCart: async (req, res) => {
        try {
            const userId = req.userId; // Assuming user ID is passed as a URL parameter
            if (!userId) {
                return res.status(HttpStatusCode_1.default.BadRequest).json({
                    message: "User ID is required",
                });
            }
            // Delete all cart items for the user
            const result = await cartProduct_1.default.deleteMany({ userId });
            if (result.deletedCount === 0) {
                return res.status(HttpStatusCode_1.default.NotFound).json({
                    message: "No products found in cart for this user",
                });
            }
            res.status(HttpStatusCode_1.default.OK).json({
                message: "All products removed from cart successfully",
            });
        }
        catch (error) {
            res.status(HttpStatusCode_1.default.InternalServerError).json({
                message: error.message,
            });
        }
    },
    changePassword: async (req, res) => {
        const userId = req.userId; // Assuming userId is set in the request, e.g., via middleware
        const { currentPassword, newPassword } = req.body;
        try {
            const user = await userModel_1.default.findById(userId);
            if (!user) {
                return res.status(HttpStatusCode_1.default.NotFound).json({
                    message: "User not found",
                });
            }
            // Check if the current password is correct
            const isMatch = await bcrypt_1.default.compare(currentPassword, user?.password);
            if (!isMatch) {
                return res.status(HttpStatusCode_1.default.Unauthorized).json({
                    message: "Current password is incorrect",
                });
            }
            // Hash the new password
            const salt = await bcrypt_1.default.genSalt(10);
            user.password = await bcrypt_1.default.hash(newPassword, salt);
            await user.save();
            return res.status(HttpStatusCode_1.default.OK).json({
                message: "Password updated successfully",
            });
        }
        catch (error) {
            return res.status(HttpStatusCode_1.default.InternalServerError).json({
                message: "An error occurred while updating the password",
                error: error.message,
            });
        }
    },
};
exports.default = authController;
const generateTokens = (user) => {
    const accessToken = jsonwebtoken_1.default.sign({ id: user.id }, process.env.SECRET_KEY, {
        expiresIn: "1d",
    });
    const refreshToken = jsonwebtoken_1.default.sign({ id: user.id }, process.env.REFRESH_SECRET_KEY, { expiresIn: "7d" });
    return { accessToken, refreshToken };
};
