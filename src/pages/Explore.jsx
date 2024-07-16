import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { dbService } from "../appwrite/dbService";
import { PostCard } from "../components/index";
import { profileService } from "../appwrite/profileService";
import { useSelector } from "react-redux";
import { useNavigate, useOutletContext } from "react-router-dom";

export function Explore() {
  const setProgress = useOutletContext().setProgress;
  const [postsData, setPostsData] = useState({
    posts: [],
    userProfiles: {},
    loading: true,
    error: "",
  });
  useEffect(() => {
    //Fetching Posts and Profiles:
    (async () => {
      setProgress(10);
      //Fetching Posts
      try {
        const postsResult = await dbService.getPosts([]);
        if (!postsResult || !postsResult.documents) {
          throw new Error("Failed to fetch posts");
        }
        const posts = postsResult.documents;
        setProgress(30);
        //Getting userIDs from posts
        const userIds = [...new Set(posts.map((post) => post.userId))];
        //Fetching Profiles
        const userProfiles = {};
        for (let userId of userIds) {
          try {
            const profile = await profileService.getUserProfile(userId);
            userProfiles[userId] = profile;
            setProgress(50);
          } catch (error) {
            throw new Error(`Failed to fetch profile for user ${userId}`);
          }
        }
        setPostsData({
          posts,
          userProfiles,
          loading: false,
          error: "",
        });
        setProgress(100);
      } catch (error) {
        console.log("Failed to fetch Posts and Profiles");
        setPostsData((prev) => ({
          ...prev,
          loading: false,
          error: "",
        }));
        setProgress(100);
      }
    })();
  }, [setProgress]);
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
  if (postsData.loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <span className="loading loading-infinity loading-lg text-red-500"></span>
      </div>
    );
  }
  if (postsData.error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <span>{postsData.error}</span>
      </div>
    );
  }
  return (
    <div className="w-full h-screen py-4 overflow-y-scroll">
      {profile
        ? postsData.posts?.map((post) => (
            <div className="" key={post.$id}>
              <PostCard
                post={post}
                userProfile={postsData.userProfiles[post.userId]}
              />
            </div>
          ))
        : null}
    </div>
  );
}
