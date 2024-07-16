import React, { useEffect, useState } from "react";
import { dbService } from "../appwrite/dbService";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { profileService } from "../appwrite/profileService";
import { storageService } from "../appwrite/storageService";
import toast from "react-hot-toast";

export function Posts() {
  const [profile, setProfile] = useState(null);
  const userData = useSelector((state) => state.auth.userData);
  const { userId } = useParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);

  // Fetching Profile
  useEffect(() => {
    (async () => {
      try {
        const get = await profileService.getUserProfile(userId);
        if (get) {
          setProfile(get);
        }
      } catch (error) {
        console.log(error);
      }
    })();
  }, [userId]);

  // Fetching userPosts
  useEffect(() => {
    (async () => {
      if (userId) {
        const get = await dbService.getUserPosts(userId);
        if (get) {
          setPosts(get.documents);
          // Initialize comments, likes, and loading states for each post
          const initialComments = {};
          const initialLikes = {};
          const initialIsLiked = {};
          const initialLoading = {};
          get.documents.forEach((post) => {
            initialComments[post.$id] = [];
            initialLikes[post.$id] = [];
            initialIsLiked[post.$id] = false;
            initialLoading[post.$id] = true;
          });
          setComments(initialComments);
          setLikes(initialLikes);
          setIsLiked(initialIsLiked);
          setLoading(initialLoading);
        }
      }
    })();
  }, [userId]);

  return (
    <div className="w-full h-screen overflow-y-auto py-4 flex flex-col items-center">
      {posts.map((post) => (
        <div
          key={post.$id}
          className="h-screen w-full md:w-[70vw] lg:w-[40vw] container flex flex-col px-4"
        >
          {/* First Container */}
          <div className="w-full flex items-center justify-between">
            {/* Logo and Name */}
            <Link to={`/profile/${profile?.userId}`}>
              <div className="flex items-center gap-2">
                {profile?.profilePic ? (
                  <img
                    src={storageService.previewFile(profile.profilePic)}
                    alt="dp"
                    className="rounded-full aspect-square w-[5%] mr-2"
                  />
                ) : (
                  <i className="fa-regular fa-user bg-gray-400 rounded-full p-2"></i>
                )}
                <p className="mr-1 font-mono text-sm">
                  {profile?.userName || "Unknown"}
                </p>
              </div>
            </Link>
            {/* Dropdown */}
            <details
              className="dropdown dropdown-left dropdown-bottom lg:dropdown-right lg:dropdown-bottom"
              onClick={() => {
                document
                  .getElementById(`dots-${post.$id}`)
                  .classList.toggle("fa-xmark");
              }}
            >
              <summary className="btn bg-transparent hover:bg-transparent border-none">
                <i
                  id={`dots-${post.$id}`}
                  className="fa-solid fa-ellipsis-vertical"
                ></i>
              </summary>
              <ul className="menu dropdown-content bg-base-100 dark:bg-gray-600 rounded z-[1] w-40 p-0 shadow-lg text-xs lg:text-[1rem]">
                {post.userId === userData?.$id && (
                  <>
                    <li>
                      <Link
                        to={`/edit-post/${post.$id}`}
                        className="hover:bg-green-500 hover:text-gray-50 duration-200 rounded"
                      >
                        Edit Post
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={async () => {
                          try {
                            const deleted = await dbService.deletePost(
                              post.$id
                            );
                            if (deleted) {
                              await storageService.deleteFile(
                                post.featuredImage
                              );
                              toast.success("Post deleted");
                              navigate(`/profile/${profile.$id}`);
                            }
                          } catch (error) {
                            console.log(error.message);
                            toast.error(
                              error.message || "Delete operation failed"
                            );
                          }
                        }}
                        className="hover:bg-red-500 hover:text-gray-50 duration-200 rounded"
                      >
                        Delete Post
                      </button>
                    </li>
                  </>
                )}
                <li>
                  <Link
                    to={`/profile/${profile?.userId}`}
                    className="hover:bg-blue-500 hover:text-gray-50 duration-200 rounded"
                  >
                    Profile
                  </Link>
                </li>
              </ul>
            </details>
          </div>
          {/* Second Container */}
          <div className="w-full">
            <img
              src={storageService.previewFile(post.featuredImage)}
              alt={post.caption}
              className="mb-1 w-full"
            />
          </div>

          {/* Third Container */}
          <div className="w-full mb-2">
            <p className="line-clamp-3 text-sm">{post.caption}</p>
          </div>

          {/* Fourth Container */}
          <div className="w-full">
            <span className="text-xs font-mono">{post.updatedAt}</span>
          </div>
          <hr className="my-4 border border-gray-600" />
        </div>
      ))}
    </div>
  );
}
