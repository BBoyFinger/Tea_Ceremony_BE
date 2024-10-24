import UserModel from "../models/userModel";

const uploadProductPermission = async (userId: string) => {
  const user = await UserModel.findById(userId);

  if (user?.role !== "ADMIN") {
    return false;
  }

  return true;
};

export default uploadProductPermission;
