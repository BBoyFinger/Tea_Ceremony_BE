import mongoose, { Model, Schema } from "mongoose";
import { ICategory } from "../utils/type";

const categorySchema: Schema<ICategory> = new Schema({
  name: {
    type: String,
    require: true,
  },
  description: String,
  productCount: {
    type: Number,
    default: 0,
  },
});

const CategoryModel: Model<ICategory> = mongoose.model(
  "Category",
  categorySchema
);

export default CategoryModel;
