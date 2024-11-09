import express from "express";
import authController from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";
import categoryController from "../controllers/categoryController";
import { productController } from "../controllers/productController";
import orderController from "../controllers/orderController";
import addToCartModel from "../models/cartProduct";
import blogController from "../controllers/blogController";
import paymentControlle from "../controllers/paymentController";
import paymentController from "../controllers/paymentController";

const router = express.Router();

router.post("/addtocart", authMiddleware, authController.addToCart);
router.post("/signup", authController.userSignUp);
router.post("/signin", authController.userSignIn);
router.get("/user-detail", authMiddleware, authController.userDetail);
router.get("/logout", authController.userLogout);
router.get("/users", authMiddleware, authController.getAllUser);
router.delete("/users", authMiddleware, authController.deleteUsers);
router.post("/update-user", authMiddleware, authController.updateUser);
router.get(
  "/countAddToCartProduct",
  authMiddleware,
  authController.countAddToCart
);
router.get(
  "/view-cart-product",
  authMiddleware,
  authController.viewProductCart
);

router.post(
  "/update-cart-product",
  authMiddleware,
  authController.updateAddToCartProduct
);

router.post(
  "/delete-cart-product",
  authMiddleware,
  authController.deleteAddToCartProduct
);

router.post("/change-password", authMiddleware, authController.changePassword);

//Category
router.post("/category", authMiddleware, categoryController.addCategory);
router.put("/category/:id", authMiddleware, categoryController.editCategory);
router.delete("/category", authMiddleware, categoryController.deleteCategories);
router.get("/category", categoryController.getAllCategories);
router.get("/category/:id", categoryController.getCategoryById);

//Product
router.post("/upload-product", authMiddleware, productController.createProduct);
router.put("/product/:id", authMiddleware, productController.updateProduct);
router.delete("/product", authMiddleware, productController.deleteProducts);
router.get("/products", productController.getAllProducts);
router.get("/product/:id", productController.getProductById);
router.get("/products/search/", productController.searchProduct);
router.get(
  "/products/category/:category",
  productController.getProductByCategory
);
router.get("/products/best-sellers", productController.getProductBestSellers);
router.get("/products/best-reviewed", productController.getProductBestReviews);
router.get("/products/new-arrivals", productController.getProductNewArrivals);
router.get("/products/product-featured", productController.getFeaturedProducts);

//Order
router.post("/order", authMiddleware, orderController.createOrder);
router.put("/order/:id", authMiddleware, orderController.updateOrder);
router.delete("/order", authMiddleware, orderController.deleteOrders);
router.get("/orders", orderController.getAllOrders);
router.get("/order/:id", orderController.getOrderById);

//blog
router.post("/blog", authMiddleware, blogController.createBlog);
router.get("/blogs", blogController.getAllBlogs);
router.get("/blog/:id", blogController.getBlogById);
router.put("/blog/:id", authMiddleware, blogController.updateBlog);
router.delete("/blogs", authMiddleware, blogController.deleteBlogs);
router.get("/blogs/search", blogController.searchBlogs);

//VN Pay Payment
router.post("/payment", paymentController.createPayment);
router.get("/inpPayment", paymentController.inpPayment);
router.get("/vnpay_return", paymentController.returnPayment);

export default router;
