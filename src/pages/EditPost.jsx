import React, { useEffect, useState } from "react";
import { PostForm } from "../components/index";
import { useParams } from "react-router-dom";
import { dbService } from "../appwrite/dbService";

export function EditPost() {
  const [post, setPost] = useState(null);
  const { postId } = useParams();
  useEffect(() => {
    (async () => {
      try {
        if (postId) {
          const get = await dbService.getPost(postId);
          if (get) {
            setPost(get);
          }
        }
      } catch (error) {
        console.log("Failed to get post");
      }
    })();
  }, [postId]);
  return post ? (
    <div className="w-full h-screen flex justify-center overflow-y-auto">
      <div className="w-fit mt-10 px-8 py-4">
        <PostForm post={post} />
      </div>
    </div>
  ) : (
    <div className="w-full h-screen flex items-center justify-center">
      <span className="loading loading-infinity loading-lg text-red-500"></span>
    </div>
  );
}
