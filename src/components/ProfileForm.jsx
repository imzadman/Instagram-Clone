import React, { useEffect, useState } from "react";
import { profileService } from "../appwrite/profileService";
import { useForm } from "react-hook-form";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useSelector } from "react-redux";
import { storageService } from "../appwrite/storageService";
import { Input, Button, Select } from "./index";
import toast from "react-hot-toast";

export function ProfileForm({ profile }) {
  const setProgress = useOutletContext().setProgress;
  const userData = useSelector((state) => state.auth.userData);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, getValues, reset } = useForm({
    defaultValues: {
      userName: profile?.userName || userData.name,
      bio: profile?.bio || "",
      gender: profile?.gender || "Male",
      status: profile?.status || "Public",
    },
  });
  useEffect(() => {
    reset({
      userName: profile?.userName || userData.name,
      bio: profile?.bio || "",
      gender: profile?.gender || "Male",
      status: profile?.status || "Public",
    });
  }, [reset, profile, userData.name]);
  const navigate = useNavigate();
  const handler = async (data) => {
    //Update Profile:
    if (profile) {
      setLoading(true);
      setProgress(10);
      try {
        const file = data.image[0]
          ? await storageService.uploadFile(data.image[0])
          : null;
        if (file) {
          storageService.deleteFile(profile.profilePic);
          setProgress(40);
        }
        const dbProfile = await profileService.updateUserProfile({
          ...data,
          profilePic: file ? file.$id : undefined,
        });
        if (dbProfile) {
          toast.success("Updated successfully");
          navigate(`/profile/${dbProfile.$id}`);
          setLoading(false);
          setProgress(100);
        }
      } catch (error) {
        toast.error(error.message || "Failed to update");
        setLoading(false);
        setProgress(100);
      }
    }
    //Create Profile:
    else {
      setLoading(true);
      setProgress(10);
      try {
        const file = data.image[0]
          ? await storageService.uploadFile(data.image[0])
          : null;
        if (file) {
          const fileID = file.$id;
          data.profilePic = fileID;
          setProgress(40);
        }
        const dbProfile = await profileService.createUserProfile({
          ...data,
          userId: userData.$id,
        });
        if (dbProfile) {
          toast.success("Created successfully");
          setLoading(false);
          navigate(`/profile/${dbProfile.$id}`);
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
        <form
          onSubmit={handleSubmit(handler)}
          className="flex flex-col py-4 px-6 shadow-lg"
        >
          {/* Logo */}
          <div className="text-center mb-4">
            <span className="font-mono font-semibold text-lg md:text-2xl">
              {profile ? "Update Profile 😉" : "Create Profile 😉"}
            </span>
          </div>
          {/* Img Preview */}
          {profile && (
            <div className="flex justify-center">
              <img
                src={storageService.previewFile(profile.profilePic)}
                alt={profile.userName}
                className=" w-[30vw] md:w-[20vw] lg:w-[7vw] rounded-full object-cover aspect-square mb-3"
              />
            </div>
          )}
          {/* Profile Pic */}
          <Input
            type="file"
            accept="image/*"
            className="file-input border-dashed border-2 py-2 max-w-xs outline-none mb-4"
            label="Profile Pic:(optional) "
            {...register("image", {
              required: false,
            })}
          />
          {/* Username */}
          <Input
            type="text"
            label="Username:"
            className="mb-4 "
            value={getValues("userName") || userData.name}
            {...register("userName", {
              required: true,
            })}
          />
          {/* Bio */}
          <Input
            type="text"
            label="Bio:(optional)"
            className="mb-4 "
            {...register("bio", {
              required: false,
            })}
          />
          {/* Gender */}
          <Select
            options={["Male", "Female"]}
            label="Gender: "
            className="mb-4 border-green-700 dark:bg-[#0f0f0f] rounded-lg"
            {...register("gender", { required: true })}
          />
          {/* Status */}
          <Select
            options={["Public", "Private"]}
            label="Status: "
            className="mb-4 border-green-700 dark:bg-[#0f0f0f] rounded-lg"
            {...register("status", { required: true })}
          />
          {/* Button */}
          <Button
            type="submit"
            className={`${
              profile
                ? "dark:bg-green-600 bg-black"
                : "dark:bg-blue-500 bg-black"
            } w-full mb-4 text-gray-50 rounded duration-200`}
          >
            {profile
              ? loading
                ? "Updating..."
                : "Update"
              : loading
              ? "Creating..."
              : "Save"}
          </Button>
          {/* Error */}
        </form>
      </div>
    </>
  );
}
