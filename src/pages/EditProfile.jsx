import React, { useEffect, useState } from "react";
import { ProfileForm } from "../components/index";
import { useSelector } from "react-redux";
import { profileService } from "../appwrite/profileService";

export function EditProfile() {
  const [profile, setProfile] = useState(null);
  const userData = useSelector((state) => state.auth.userData);

  useEffect(() => {
    (async () => {
      try {
        const get = await profileService.getUserProfile(userData.$id);
        if (get) {
          setProfile(get);
        }
      } catch (error) {
        console.log("Failed to fetch profile");
      }
    })();
  }, [userData.$id]);
  return profile ? (
    <div className="w-full h-screen flex justify-center overflow-y-auto">
      <div className="w-fit mt-10 px-8 py-4">
        <ProfileForm profile={profile} />
      </div>
    </div>
  ) : (
    <div className="w-full h-screen flex items-center justify-center">
      <span className="loading loading-infinity loading-lg text-red-500"></span>
    </div>
  );
}
