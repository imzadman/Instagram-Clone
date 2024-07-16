import React, { useEffect, useState } from "react";
import { profileService } from "../appwrite/profileService";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

export function FollowBtn({ userId }) {
  const userData = useSelector((state) => state.auth.userData);
  const [isFollowing, setisFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  //Following Status:
  useEffect(() => {
    (async () => {
      try {
        const status = await profileService.isFollowing(userId, userData.$id);
        setisFollowing(status);
      } catch (error) {
        console.log(error.message || "Failed to check following status");
      }
    })();
  }, [userId, userData]);
  //HandleFollow:
  const handleFollow = async () => {
    setLoading(true);
    try {
      if (isFollowing) {
        await profileService.deleteFollower(userId, userData.$id);
        toast.success("Unfollowed", userId.userName);
        setLoading(false);
      } else {
        await profileService.addFollower(userId, userData.$id);
        toast.success("Followed", userId.userName);
        setLoading(false);
      }
      setisFollowing(!isFollowing);
    } catch (error) {
      toast.error("Failed to update follow status");
    } finally {
      setLoading(false);
    }
  };
  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className="text-xs font-ubuntu text-blue-500"
    >
      <span>{loading ? "..." : isFollowing ? "Unfollow" : "Follow"}</span>
    </button>
  );
}
