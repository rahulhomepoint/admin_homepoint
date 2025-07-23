import axios from "axios";
import { toast } from "react-toastify";

export const loginAPI = async (email: any, password: any) => {
  try {
    console.log("Sending login data:", email, password);
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/login`, {
      email,
      password,
    });
    console.log("API response:", response);
    if (response?.data?.success == true) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("username", response.data.userName);
      toast.success("Login successful");
    } else {
      toast.error("Login failed");
    }
    return response.data;
  } catch (error: any) {
    console.error("API error:", error);
    toast.error(
      "Login failed: " + (error.response?.data?.message || error.message),
    );
    return error.response?.data;
  }
};

export const forgetPasswordRequest = async (email: any) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/request-password-reset`,
      {
        email,
      },
    );

    console.log("this is the response " + response?.data);
    if (response?.data?.success == true) {
      toast.success("OTP sent to your email");
    } else {
      toast.error("OTP request failed");
    }
    return response.data;
  } catch (error: any) {
    console.error("API error:", error);
    toast.error(error.response?.data?.message || error.message);
    return error.response?.data;
  }
};

export const resetPasswordOtp = async (
  email: any,
  otp: any,
  newPassword: any,
) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/reset-password-otp`,
      {
        email,
        otp,
        newPassword,
      },
    );
    if (response?.data?.success == true) {
      toast.success("Password reset successful");
    } else {
      toast.error("Password reset failed");
    }
    return response.data;
  } catch (error: any) {
    console.error("API error:", error);
    toast.error(error.response?.data?.message || error.message);
    return error.response?.data;
  }
};
