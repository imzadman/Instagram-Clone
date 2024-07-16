import React, { useEffect, useState } from "react";
import { PostCard } from "../components/index";
import { dbService } from "../appwrite/dbService";
import { profileService } from "../appwrite/profileService";
import { useSelector } from "react-redux";
import { useNavigate, useOutletContext } from "react-router-dom";
import toast from "react-hot-toast";

export function Home() {
  const setProgress = useOutletContext().setProgress;
  const [postsData, setPostsData] = useState({
    posts: [],
    userProfiles: {},
    loading: true,
    error: "",
  });
  useEffect(() => {
    //FetchingPosts & Profiles:
    (async () => {
      setProgress(10);
      try {
        //Fetching Posts
        const postsResult = await dbService.getPosts([]);
        if (!postsResult || !postsResult.documents) {
          throw new Error("Falied to fetch posts");
        }
        const posts = postsResult.documents;
        setProgress(30);
        //Fetching userId from posts
        const userIds = [...new Set(posts.map((post) => post.userId))];
        //Fetching Profiles
        const userProfiles = {};
        for (let userId of userIds) {
          try {
            const profile = await profileService.getUserProfile(userId);
            userProfiles[userId] = profile;
            setProgress(60);
          } catch (error) {
            setProgress(100);
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
        setProgress(100);
        setPostsData((prev) => ({
          ...prev,
          loading: false,
          error: "",
        }));
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
  }, [userData, navigate]);
  if (postsData.loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <span className="loading loading-infinity loading-lg text-red-500"></span>
      </div>
    );
  }
  if (postsData.error) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <span>{postsData.error}</span>
      </div>
    );
  }
  return (
    <div className="w-full h-screen py-4 flex flex-col overflow-y-scroll">
      {profile
        ? postsData.posts.map((post) => (
            <div key={post.$id}>
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
