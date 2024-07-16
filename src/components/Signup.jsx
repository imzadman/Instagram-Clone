import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { authService } from "../appwrite/authService";
import { login } from "../store/authSlice";
import { Input, Button } from "./index";
import toast from "react-hot-toast";

export function Signup() {
  const setProgress = useOutletContext().setProgress;
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const signupHandler = async (data) => {
    setLoading(true);
    setProgress(10);
    try {
      const session = await authService.createAccount(data);
      toast.success("Signed up");
      setProgress(50);
      if (session) {
        const userData = await authService.getUser();
        setProgress(70);
        if (userData) {
          dispatch(login(userData));
          toast.success("Logged in successfully");
          setLoading(false);
          navigate("/");
          setProgress(100);
        }
      }
    } catch (error) {
      toast.error(error.message || "Failed to create account");
      setLoading(false);
      setProgress(100);
    }
  };
  const password = watch("password");
  return (
    <>
      <div className="w-full h-screen flex justify-center py-4">
        <div className="">
          <form
            onSubmit={handleSubmit(signupHandler)}
            className="main shadow-lg flex flex-col gap-4 p-8 rounded-lg mt-10 dark:bg-[#0f0f0f]"
          >
            {/* Logo */}
            <div className="logo mb-4 flex justify-center">
              <span className="font-mono text-2xl font-semibold">
                {" "}
                <span>Sign up</span>
                <i className="fa-regular fa-face-smile ml-3"></i>
              </span>
            </div>
            {/* Name */}
            <div className="flex flex-col">
              <Input
                type="text"
                label="Full Name: "
                className="focus:border-blue-800 dark:focus:border-blue-500 duration-200"
                {...register("name", {
                  required: "Your name is required",
                  validate: {
                    minlength: (v) =>
                      v.length >= 3 || "Your name must have 3 char...",
                  },
                })}
              />
              {errors.name?.message && (
                <span className="text-red-500 text-xs ">
                  {errors.name.message}
                </span>
              )}
            </div>
            {/* Email */}
            <div className="flex flex-col">
              <Input
                type="email"
                label="Email: "
                className="focus:border-blue-800 dark:focus:border-blue-500 duration-200"
                {...register("email", {
                  required: true,
                  validate: {
                    matchPattern: (v) =>
                      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) ||
                      "Email address must be a valid address",
                    maxLength: (v) =>
                      v.length <= 50 ||
                      "Email should have at most 50 characters",
                  },
                })}
              />
              {errors.email?.message && (
                <span className="text-red-500 text-xs ">
                  {errors.email.message}
                </span>
              )}
            </div>
            {/* Password */}
            <div className="flex flex-col">
              <Input
                type="password"
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
                <span className="text-red-500 text-xs ">
                  {errors.password.message}
                </span>
              )}
            </div>
            {/* Confirm Password */}
            <div className="flex flex-col">
              <Input
                type="password"
                label="Confirm: "
                className="focus:border-blue-800 dark:focus:border-blue-500 duration-200"
                {...register("confirmPassword", {
                  required: "Password must be confirmed",
                  validate: {
                    match: (v) => v === password || "Password does not match",
                  },
                })}
              />
              {errors.confirmPassword?.message && (
                <span className="text-red-500 text-xs mb-4">
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>
            {/* Button */}
            <Button
              type="submit"
              className="dark:bg-blue-500 bg-black w-full text-gray-50 duration-300 rounded"
            >
              {loading ? "Creating..." : "Sign up"}
            </Button>
            {/* Message */}
            <p className="font-mono text-xs text-center">
              Already have an account?&nbsp;
              <Link
                to="/login"
                className="text-sm hover:text-green-700 duration-100"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
