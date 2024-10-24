import mongoose from "mongoose";

const connectDb = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
};

export default connectDb;
