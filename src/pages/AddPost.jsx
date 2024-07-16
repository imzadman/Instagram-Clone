import React, { useEffect, useState } from "react";
import { PostForm } from "../components/index";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { profileService } from "../appwrite/profileService";

export function AddPost() {
  //For profile:
  const [profile, setProfile] = useState(null);
  const userData = useSelector((state) => state.auth.userData);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const get = await profileService.getUserProfile(userData.$id);
        if (get) {
          setProfile(get);
        }
      } catch (error) {
        navigate("/main-profile");
      }
    })();
  }, [userData.$id, navigate]);
  return (
    <div className="w-full h-screen flex justify-center">
      <div className="mt-10">
        {profile ? (
          <PostForm />
        ) : (
          <div className="w-full h-screen flex items-center justify-center">
            <span className="loading loading-infinity loading-lg text-red-500"></span>
          </div>
        )}
      </div>
    </div>
  );
}
