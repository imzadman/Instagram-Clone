import React, { useEffect, useState } from "react";
import { dbService } from "../appwrite/dbService";
import { storageService } from "../appwrite/storageService";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { Input, Button, Select } from "./index";
import toast from "react-hot-toast";

export function PostForm({ post }) {
  const setProgress = useOutletContext().setProgress;
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);
  const [loading, setLoading] = useState(false);
  function formatDate(timestamp) {
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, "0");
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      caption: "",
      status: "Public",
      createdAt: formatDate(Date.now()),
      updatedAt: formatDate(Date.now()),
      likes: 0,
      comments: [],
    },
  });
  useEffect(() => {
    reset({
      caption: post?.caption || "",
      status: post?.status || "Public",
      createdAt: post?.createdAt || formatDate(Date.now()),
      updatedAt: post?.updatedAt || formatDate(Date.now()),
      likes: post?.likes || [],
      comments: post?.comments || [],
    });
  }, [reset, post]);
  const handler = async (data) => {
    //Updating post:
    if (post) {
      setLoading(true);
      setProgress(10);
      try {
        const file = data.image[0]
          ? await storageService.uploadFile(data.image[0])
          : null;
        if (file) {
          await storageService.deleteFile(post.featuredImage);
          setProgress(40);
        }
        const dbPost = await dbService.updatePost(post.$id, {
          ...data,
          featuredImage: file ? file.$id : undefined,
        });
        if (dbPost) {
          toast.success("Updated successfully");
          navigate(`/post/${dbPost.$id}`);
          setLoading(false);
          setProgress(100);
        }
      } catch (error) {
        toast.error(error.message || "Failed to update post");
        setLoading(false);
        setProgress(100);
      }
    } //Creating post:
    else {
      setLoading(true);
      setProgress(10);
      try {
        const file = data.image[0]
          ? await storageService.uploadFile(data.image[0])
          : null;
        if (file) {
          const fileId = file.$id;
          data.featuredImage = fileId;
          setProgress(30);
        }
        const dbPost = await dbService.createPost({
          ...data,
          userId: userData.$id,
        });
        if (dbPost) {
          toast.success("Created successfully");
          setLoading(false);
          navigate(`/post/${dbPost.$id}`);
          setProgress(100);
        }
      } catch (error) {
        console.log(error.message);
        toast.error(error.message || "Failed to create");
        setLoading(false);
        setProgress(100);
      }
    }
  };
  return (
    <>
      <div className="w-full rounded-lg py-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="font-mono font-semibold text-lg md:text-2xl">
            {post ? "Update your post 🙃" : "Share your Post 😀"}
          </span>
        </div>
        <form
          onSubmit={handleSubmit(handler)}
          className="flex flex-col gap-4 p-4"
        >
          {/* FeaturedImage */}
          <div className="flex flex-col">
            <Input
              type="file"
              className="file-input border-2 border-dashed w-full max-w-xs outline-none mb-1"
              accept="image/*"
              label="Featured Image: "
              {...register("image", {
                required: !post && "Image is required",
              })}
            />
            {errors.image?.message && (
              <span className="text-red-500 text-xs">
                {errors.image.message}
              </span>
            )}
          </div>
          {/* Img preview */}
          {post && (
            <div className="flex justify-center">
              <img
                src={storageService.previewFile(post.featuredImage)}
                alt="img"
                className="w-[40vw] md:w-[20vw] lg:w-[15vw]"
              />
            </div>
          )}
          {/* Caption */}
          <div className="flex flex-col">
            <Input
              type="text"
              label="Caption: "
              placeholder="Write something..."
              className="mb-1"
              {...register("caption", {
                required: "Caption is required",
              })}
            />
            {errors.caption?.message && (
              <span className="text-red-500 text-xs">
                {errors.caption.message}
              </span>
            )}
          </div>
          {/* Status */}
          <div className="flex flex-col">
            <Select
              options={["Public", "Private"]}
              label="Status: "
              {...register("status", {
                required: "Status is required",
              })}
              className="dark:bg-[#0f0f0f] rounded-lg"
            />
            {errors.status?.message && (
              <span className="text-red-500 text-xs">
                {errors.status.message}
              </span>
            )}
          </div>
          {/* Button */}
          <Button
            type="submit"
            className={`${
              post ? "dark:bg-green-600 bg-black" : "dark:bg-blue-500 bg-black"
            } mb-3 rounded text-gray-50`}
          >
            {post
              ? loading
                ? "Updating..."
                : "Update"
              : loading
              ? "Creating..."
              : "Post"}
          </Button>
        </form>
      </div>
    </>
  );
}
