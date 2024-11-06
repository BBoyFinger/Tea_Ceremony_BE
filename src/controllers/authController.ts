import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { IUser } from "../utils/type";
import HttpStatusCode from "../utils/HttpStatusCode";
import UserModel from "../models/userModel";
import uploadProductPermission from "../utils/permission";
import addToCartModel from "../models/cartProduct";

interface SearchQuery {
  name?: string;
  email?: string;
  role?: string;
}

const authController = {
  userSignUp: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { name, email, password } = req.body as IUser;

      // Kiểm tra xem email đã tồn tại chưa
      const isEmail = await UserModel.findOne({ email });

      if (isEmail) {
        return res.status(HttpStatusCode.Conflict).json({
          message: "User already exists!",
          error: true,
          success: false,
        });
      }

      // Kiểm tra các trường bắt buộc
      if (!email || !password || !name) {
        return res.status(HttpStatusCode.BadRequest).json({
          message: "Please fill in all required fields!",
          error: true,
          success: false,
        });
      }

      // Tạo salt và hash mật khẩu
      const salt = bcrypt.genSaltSync(10);
      const hashPassword = bcrypt.hashSync(password, salt);

      if (!hashPassword) {
        throw new Error("Something went wrong while hashing the password!");
      }

      // Tạo payload người dùng
      const payload: IUser = {
        ...req.body,
        password: hashPassword,
      };

      const registerUser = new UserModel<IUser>(payload);
      const saveUser = await registerUser.save();

      return res.status(HttpStatusCode.OK).json({
        message: "User created successfully!",
        data: saveUser,
        error: false,
        success: true,
      });
    } catch (error: any) {
      return res.status(HttpStatusCode.InternalServerError).json({
        message: error.message || "An error occurred",
        error: true,
        success: false,
      });
    }
  },

  userSignIn: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { email, password } = req.body;
      // Kiểm tra email và password có tồn tại
      if (!email || !password) {
        return res.status(HttpStatusCode.BadRequest).json({
          message: "Please enter both email and password!",
          error: true,
          success: false,
        });
      }

      // Tìm người dùng
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(HttpStatusCode.NotFound).json({
          message: "User not found!",
          error: true,
          success: false,
        });
      }

      // So sánh mật khẩu
      const checkPassword = bcrypt.compareSync(
        password,
        user.password as string
      );
      if (!checkPassword) {
        return res.status(HttpStatusCode.Unauthorized).json({
          message: "Invalid password!",
          error: true,
          success: false,
        });
      }

      const payload = {
        _id: user.id,
        email: user.email,
      };

      const token = await jwt.sign(
        payload,
        process.env.JWT_SECRET_KEY || "default-secret-key",
        {
          expiresIn: 60 * 60 * 24,
        }
      );

      const tokenOption = {
        httpOnly: true,
        secure: true,
        sameSite: "none" as const,
      };

      // Trả về kết quả đăng nhập thành công
      return res
        .cookie("token", token, tokenOption)
        .status(HttpStatusCode.OK)
        .json({
          message: "Login successful!",
          data: { token },
          error: false,
          success: true,
        });
    } catch (error: any) {
      return res.status(HttpStatusCode.InternalServerError).json({
        message: error.message || "An error occurred",
        error: true,
        success: false,
      });
    }
  },

  userDetail: async (req: Request, res: Response): Promise<Response> => {
    try {
      const userDetail = await UserModel.findById(req.userId).select(
        "-password"
      );

      if (!userDetail) {
        throw new Error("Something went wrong");
      }
      return res.status(HttpStatusCode.OK).json({
        message: "Get user successfully!",
        data: userDetail,
        error: false,
        success: true,
      });
    } catch (error: any) {
      return res.status(HttpStatusCode.InternalServerError).json({
        message: error.message || error,
        error: true,
        sucess: false,
      });
    }
  },

  userLogout: async (req: Request, res: Response): Promise<Response> => {
    try {
      res.clearCookie("token");
      return res.status(HttpStatusCode.OK).json({
        message: "Logged out successfully",
        error: false,
        success: true,
        data: [],
      });
    } catch (error: any) {
      return res.status(HttpStatusCode.InternalServerError).json({
        message: error.message || error,
        error: true,
        sucess: false,
      });
    }
  },

  getAllUser: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { name, email, role } = req.query as SearchQuery;

      // Tạo object query tìm kiếm
      const query: any = {};
      if (name) {
        query.name = { $regex: name, $options: "i" }; // Tìm kiếm không phân biệt chữ hoa/thường
      }
      if (email) {
        query.email = { $regex: email, $options: "i" };
      }
      if (role) {
        query.role = role; // Lọc chính xác theo role
      }
      const users = await UserModel.find(query);
      const sessionUserId = req.userId;

      if (!uploadProductPermission(sessionUserId)) {
        res.status(HttpStatusCode.Unauthorized).json({
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
    } catch (error: any) {
      return res.status(HttpStatusCode.InternalServerError).json({
        message: error.message || error,
        error: true,
        sucess: false,
      });
    }
  },
  deleteUsers: async (req: Request, res: Response): Promise<Response> => {
    const { ids } = req.body;

    if (!ids || ids.length === 0) {
      return res.status(400).json({ message: "No user IDs provided" });
    }

    try {
      if (ids.length === 1) {
        const deleteUser = await UserModel.findByIdAndDelete(ids[0]);
        if (!deleteUser) {
          return res
            .status(HttpStatusCode.NotFound)
            .json({ user: "User not found!" });
        }
        return res
          .status(HttpStatusCode.OK)
          .json({ message: "User deleted successfully" });
      }

      const deleteManyUsers = await UserModel.deleteMany({ _id: { $in: ids } });

      return res.status(200).json({
        message: `${deleteManyUsers.deletedCount} users deleted successfully`,
      });
    } catch (error: any) {
      return res.status(HttpStatusCode.InternalServerError).json({
        message: error.message || error,
        error: true,
        sucess: false,
      });
    }
  },
  updateUser: async (req: Request, res: Response): Promise<Response> => {
    try {
      const userSession = req.userId;

      const { userId, email, name, role, status, phone, address } = req.body;

      const payload = {
        ...(email && { email: email }),
        ...(name && { name: name }),
        ...(phone && { phone: phone }),
        ...(address && { address: address }),
        ...(role && { role: role }),
        ...(status && { status: status }),
      };
      const updateUser = await UserModel.findByIdAndUpdate(userId, payload);

      return res.status(HttpStatusCode.OK).json({
        data: updateUser,
        message: "Update user successfully!",
        success: true,
        error: false,
      });
    } catch (error: any) {
      return res.status(HttpStatusCode.InternalServerError).json({
        message: error.message || error,
        error: true,
        sucess: false,
      });
    }
  },
  addToCart: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { productId } = req.body;
      const user = req.userId;

      // Tìm sản phẩm trong giỏ hàng của người dùng
      const existingCartItem = await addToCartModel.findOne({
        productId,
        userId: user,
      });

      if (existingCartItem) {
        // Nếu sản phẩm đã tồn tại, tăng quantity lên 1
        existingCartItem.quantity = existingCartItem.quantity ?? 0;
        existingCartItem.quantity += 1;

        await existingCartItem.save();

        return res.status(HttpStatusCode.OK).json({
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

      const newAddToCart = new addToCartModel(payload);
      const saveProduct = await newAddToCart.save();

      return res.status(HttpStatusCode.Created).json({
        message: "Product added to cart!",
        data: saveProduct,
        success: true,
        error: false,
      });
    } catch (error: any) {
      return res.status(HttpStatusCode.InternalServerError).json({
        message: error.message || error,
        error: true,
        success: false,
      });
    }
  },
  countAddToCart: async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = req.userId;
      const count = await addToCartModel.countDocuments({
        userId: userId,
      });

      return res.status(HttpStatusCode.OK).json({
        data: {
          count: count,
        },
        message: "OK",
      });
    } catch (error: any) {
      return res.status(HttpStatusCode.InternalServerError).json({
        message: error.message || error,
        error: true,
        sucess: false,
      });
    }
  },
  viewProductCart: async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = req.userId;

      const allProduct = await addToCartModel
        .find({
          userId: userId,
        })
        .populate("productId");

      return res.status(HttpStatusCode.OK).json({
        data: allProduct,
        message: "OK",
      });
    } catch (error: any) {
      return res.status(HttpStatusCode.InternalServerError).json({
        message: error.message || error,
        error: true,
        sucess: false,
      });
    }
  },
  updateAddToCartProduct: async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const userId = req.userId;
      const addToCartProductId = req.body._id;
      const qty = req.body.quantity;

      const updateProduct = await addToCartModel.updateOne(
        { _id: addToCartProductId, userId },
        {
          ...(qty && { quantity: qty }),
        }
      );

      return res.status(HttpStatusCode.OK).json({
        message: "Product Updated Successfully",
        data: updateProduct,
      });
    } catch (error: any) {
      return res.status(HttpStatusCode.InternalServerError).json({
        message: error.message || error,
        error: true,
        sucess: false,
      });
    }
  },
  deleteAddToCartProduct: async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const userId = req.userId;
      const addToCartProductId = req.body._id;

      const deleteProduct = await addToCartModel.deleteOne({
        _id: addToCartProductId,
      });

      return res.status(HttpStatusCode.OK).json({
        message: "Product Deleted from cart Successfully",
        data: deleteProduct,
      });
    } catch (error: any) {
      return res.status(HttpStatusCode.InternalServerError).json({
        message: error.message || error,
        error: true,
        sucess: false,
      });
    }
  },

  changePassword: async (req: Request, res: Response) => {
    const userId = req.userId; // Assuming userId is set in the request, e.g., via middleware
    const { currentPassword, newPassword } = req.body;

    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(HttpStatusCode.NotFound).json({
          message: "User not found",
        });
      }

      // Check if the current password is correct
      const isMatch = await bcrypt.compare(
        currentPassword,
        user?.password as string
      );
      if (!isMatch) {
        return res.status(HttpStatusCode.Unauthorized).json({
          message: "Current password is incorrect",
        });
      }

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);

      await user.save();

      return res.status(HttpStatusCode.OK).json({
        message: "Password updated successfully",
      });
    } catch (error: any) {
      return res.status(HttpStatusCode.InternalServerError).json({
        message: "An error occurred while updating the password",
        error: error.message,
      });
    }
  },
};

export default authController;
