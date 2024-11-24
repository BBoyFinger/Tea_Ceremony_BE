import mongoose from "mongoose";

// Define the IUser interface
export interface IUser extends Document {
  name?: string;
  email: string;
  password?: string;
  phone?: string;
  address?: string;
  pictureImg?: string;
  cart: any[]; // Adjust the type based on your cart structure
  status?: string;
  role?: string;
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
  orderItems: {
    product: mongoose.Schema.Types.ObjectId;
    quantity: number;
    price: number;
  }[];
  totalPrice: number;
  status: "Pending" | "Confirmed" | "Processing" | "Shipped" | "Delivering" | "Delivered" | "Cancelled";
  paymentMethod?: string;
  shippingAddress: {
    province?: string;
    district?: string;
    ward?: string;
    detail?: string;
    name?: string;
    phone?: string;
  };
  paymentResult?: {
    id?: string;
    status?: string;
    update_time?: string;
    email_address?: string;
  };
  order_code?: string;
  to_ward_code?: string;
  to_district_id?: number;
  token?: string;
  cancelOrder?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}