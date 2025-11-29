import { api } from "@/lib/api";

// Register
export const registerUser = async (
  name: string,
  email: string,
  password: string
) => {
  return api.post("/auth/register", { name, email, password }, { skipAuth: true });
};

// Login
export const loginUser = async (email: string, password: string) => {
  return api.post("/auth/login", { email, password }, { skipAuth: true });
};

// Get Profile
export const getProfile = async () => {
  return api.get("/auth/profile");
};

// Update Profile
export const updateProfile = async (data: {
  name?: string;
  email?: string;
  profileImage?: string;
}) => {
  return api.put("/auth/profile", data);
};

// Change Password
export const changePassword = async (
  currentPassword: string,
  newPassword: string
) => {
  return api.put("/auth/change-password", {
    currentPassword,
    newPassword,
  });
};

// Delete Account
export const deleteAccount = async () => {
  return api.delete("/auth/account");
};
