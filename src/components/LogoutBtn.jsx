import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { authService } from "../appwrite/authService";
import { logout } from "../store/authSlice";
import toast from "react-hot-toast";

export function LogoutBtn() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handler = async () => {
    await authService
      .logout()
      .then(() => {
        dispatch(logout());
        toast.success("Logged out successfully");
        navigate("/login");
      })
      .catch((error) => {
        console.log("Failed to logout", error);
        toast.error(error.message || "Failed to logout");
      });
  };
  return (
    <button
      className="hover:bg-red-500 hover:text-gray-50 duration-200 rounded"
      onClick={handler}
    >
      <i className="fa-solid fa-right-from-bracket mr-2"></i>
      <span>Log Out</span>
    </button>
  );
}
