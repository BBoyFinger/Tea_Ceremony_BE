"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = __importDefault(require("../controllers/authController"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const categoryController_1 = __importDefault(require("../controllers/categoryController"));
const productController_1 = require("../controllers/productController");
const orderController_1 = __importDefault(require("../controllers/orderController"));
const blogController_1 = __importDefault(require("../controllers/blogController"));
const paymentController_1 = __importDefault(require("../controllers/paymentController"));
const commentController_1 = __importDefault(require("../controllers/commentController"));
const conversationController_1 = __importDefault(require("../controllers/conversationController"));
const router = express_1.default.Router();
router.post("/addtocart", authMiddleware_1.authMiddleware, authController_1.default.addToCart);
router.post("/signup", authController_1.default.userSignUp);
router.post("/signin", authController_1.default.userSignIn);
router.get("/user-detail", authMiddleware_1.authMiddleware, authController_1.default.userDetail);
router.get("/logout", authController_1.default.userLogout);
router.get("/users", authMiddleware_1.authMiddleware, authController_1.default.getAllUser);
router.delete("/users", authMiddleware_1.authMiddleware, authController_1.default.deleteUsers);
router.post("/update-user", authMiddleware_1.authMiddleware, authController_1.default.updateUser);
router.get("/countAddToCartProduct", authMiddleware_1.authMiddleware, authController_1.default.countAddToCart);
router.get("/view-cart-product", authMiddleware_1.authMiddleware, authController_1.default.viewProductCart);
router.post("/update-cart-product", authMiddleware_1.authMiddleware, authController_1.default.updateAddToCartProduct);
router.post("/delete-cart-product", authMiddleware_1.authMiddleware, authController_1.default.deleteAddToCartProduct);
router.delete("/removeProductCart", authMiddleware_1.authMiddleware, authController_1.default.removeAllProductsFromCart);
router.post("/change-password", authMiddleware_1.authMiddleware, authController_1.default.changePassword);
//Category
router.post("/category", authMiddleware_1.authMiddleware, categoryController_1.default.addCategory);
router.put("/category/:id", authMiddleware_1.authMiddleware, categoryController_1.default.editCategory);
router.delete("/category", authMiddleware_1.authMiddleware, categoryController_1.default.deleteCategories);
router.get("/category", categoryController_1.default.getAllCategories);
router.get("/category/:id", categoryController_1.default.getCategoryById);
//Product
router.post("/upload-product", authMiddleware_1.authMiddleware, productController_1.productController.createProduct);
router.put("/product/:id", authMiddleware_1.authMiddleware, productController_1.productController.updateProduct);
router.delete("/product", authMiddleware_1.authMiddleware, productController_1.productController.deleteProducts);
router.get("/products", productController_1.productController.getAllProducts);
router.get("/product/:id", productController_1.productController.getProductById);
router.get("/products/search/", productController_1.productController.searchProduct);
router.get("/products/category/:category", productController_1.productController.getProductByCategory);
router.get("/products/best-sellers", productController_1.productController.getProductBestSellers);
router.get("/products/best-reviewed", productController_1.productController.getProductBestReviews);
router.get("/products/new-arrivals", productController_1.productController.getProductNewArrivals);
router.get("/products/product-featured", productController_1.productController.getFeaturedProducts);
//Order
router.post("/order", authMiddleware_1.authMiddleware, orderController_1.default.createOrder);
router.put("/order/:id", authMiddleware_1.authMiddleware, orderController_1.default.updateOrder);
router.delete("/order/:orderId", orderController_1.default.deleteOrder);
router.get("/orders", authMiddleware_1.authMiddleware, orderController_1.default.getAllOrders);
router.get("/order/:id", orderController_1.default.getOrderById);
router.get("/orderPaypal", orderController_1.default.getAllOrderPaypal);
router.post("/update/:id", orderController_1.default.updateOrderGhn);
router.get("/orders/print/:orderId", orderController_1.default.printOrder);
router.get("/provinces", orderController_1.default.getProvinces);
router.get("/districts", orderController_1.default.getDistricts);
router.get("/wards", orderController_1.default.getWards);
router.get("/orders/user/:userId", orderController_1.default.getOrdersByUserId);
router.patch("/orders/:id/confirm", authMiddleware_1.authMiddleware, orderController_1.default.confirmOrder);
//blog
router.post("/blog", authMiddleware_1.authMiddleware, blogController_1.default.createBlog);
router.get("/blogs", blogController_1.default.getAllBlogs);
router.get("/blog/:id", blogController_1.default.getBlogById);
router.put("/blog/:id", authMiddleware_1.authMiddleware, blogController_1.default.updateBlog);
router.delete("/blogs", authMiddleware_1.authMiddleware, blogController_1.default.deleteBlogs);
router.get("/blogs/search", blogController_1.default.searchBlogs);
//VN Pay Payment
router.post("/payment", paymentController_1.default.createPayment);
router.get("/inpPayment", paymentController_1.default.inpPayment);
router.get("/vnpay_return", paymentController_1.default.returnPayment);
//Comment
router.post("/createComment", commentController_1.default.addComment);
router.get("/comments/:productId", commentController_1.default.getComments);
router.post("/reply/:commentId", commentController_1.default.replyComment);
router.delete("/comments/:commentId", authMiddleware_1.authMiddleware, commentController_1.default.deleteComment);
router.delete("/comments/:commentId/replies/:replyId", authMiddleware_1.authMiddleware, commentController_1.default.deleteReply);
//Convesation
router.get("/chats", conversationController_1.default.getAllConversation);
router.get("/chats/message", conversationController_1.default.getMessageByConversation);
router.post("/chats/save", conversationController_1.default.postSaveMessage);
exports.default = router;
