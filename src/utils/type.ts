import mongoose from "mongoose";

export interface IUser {
  name?: string;
  email: string;
  password?: string;
  address: string;
  phone: string;
  pictureImg: string;
  role: string;
  status: string;
}

export interface Account {
  status: {
    Active: "Active";
    Inactive: "Inactive";
  };
}

export interface ICategory {
  name: string;
  description: string;
  productCount: number;
}

export interface IProduct {
  id?: string; // optional vì trong một số trường hợp có thể chưa có id khi tạo mới
  productName: string;
  description: string;
  price: number;
  quantity: number;
  images: [
    {
      url: string;
      title: string;
    }
  ]; // danh sách các URL hình ảnh sản phẩm
  category: mongoose.Types.ObjectId; // có thể là "Teapots", "Cups", "Infusers", v.v.
  material: string;
  stockQuantity: number; // số lượng sản phẩm tồn kho
  availability: string; // ví dụ: "In Stock", "Out of Stock"
  averageRating: number; // đánh giá trung bình
  reviewsCount: number; // số lượng đánh giá
  reviews: Array<{
    user: string;
    rating: number;
    comment: string;
  }>;

  discount?: number; // optional vì không phải lúc nào cũng có giảm giá
  isFeatured?: boolean; // có phải sản phẩm nổi bật hay không
  shippingInfo: string; // ví dụ: "Free Shipping", "Fast Delivery"
  brand: string; // thương hiệu
}

interface IOrderProduct {
  product: mongoose.Schema.Types.ObjectId;
  quantity: number;
  price: number;
}

interface IShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface IOrder {
  user: mongoose.Schema.Types.ObjectId;
  products: IOrderProduct[];
  totalPrice: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  paymentMethod: "Credit Card" | "PayPal" | "Cash On Delivery";
  shippingAddress: IShippingAddress;
  createdAt?: Date;
  updatedAt?: Date;
}
