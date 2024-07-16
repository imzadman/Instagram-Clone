import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { authService } from "../appwrite/authService";
import { login } from "../store/authSlice";
import { useForm } from "react-hook-form";
import { Input, Button } from "./index";
import toast from "react-hot-toast";

export function Login() {
  const setProgress = useOutletContext().setProgress;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const loginHandler = async (data) => {
    setLoading(true);
    setProgress(10);
    try {
      const session = await authService.login(data);
      setProgress(40);
      if (session) {
        const userData = await authService.getUser();
        setProgress(80);
        if (userData) {
          dispatch(login(userData));
          toast.success("Logged in successfully");
          setLoading(false);
          navigate("/");
          setProgress(100);
        }
      }
    } catch (error) {
      toast.error(error.message || "Failed to log in");
      setLoading(false);
      setProgress(100);
    }
  };
  return (
    <>
      <div className="w-full h-screen flex justify-center py-4 ">
        <div className="">
          <form
            onSubmit={handleSubmit(loginHandler)}
            className="flex flex-col gap-4 p-4 mt-10 shadow-lg rounded-lg dark:bg-[#0f0f0f]"
          >
            {/* Logo */}
            <div className="mb-4 text-center">
              <span className="font-mono text-2xl font-semibold">
                <span>Log in</span>
                <i className="fa-regular fa-face-smile ml-3"></i>
              </span>
            </div>
            {/* Email */}
            <div className="flex flex-col">
              <Input
                type="email"
                className="focus:border-blue-800 dark:focus:border-blue-500 duration-200"
                label="Email: "
                {...register("email", {
                  required: "Email is required",
                  validate: {
                    matchPattern: (v) =>
                      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) ||
                      "Email address must be a valid address",
                    matchLength: (v) =>
                      v.length <= 50 ||
                      "Email should have at most 50 characters",
                  },
                })}
              />
              {errors.email?.message && (
                <span className="text-red-500 text-xs">
                  {errors.email.message}
                </span>
              )}
            </div>
            {/* Password */}
            <div className="flex flex-col">
              <Input
                type="password"
                placeholder=""
                label="Password: "
                className="focus:border-blue-800 dark:focus:border-blue-500 duration-200"
                {...register("password", {
                  required: "Password is required",
                  validate: {
                    minlength: (v) =>
                      v.length >= 8 || "Password length must atleast be 8",
                  },
                })}
              />
              {errors.password?.message && (
                <span className="text-red-500 text-xs">
                  {errors.password.message}
                </span>
              )}
            </div>
            {/* Button */}
            <Button
              type="submit"
              className="dark:bg-green-500 duration-200 bg-black w-full mb-3 text-gray-50 rounded"
            >
              {loading ? "Processing..." : "Log in"}
            </Button>
            {/* Message */}
            <p className="font-mono text-xs text-center">
              Don&apos;t have an account?&nbsp;
              <Link
                to="/signup"
                className="text-sm hover:text-blue-500 duration-100"
              >
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
