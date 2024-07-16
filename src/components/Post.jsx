import React, { useEffect, useState } from "react";
import { dbService } from "../appwrite/dbService";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { profileService } from "../appwrite/profileService";
import { storageService } from "../appwrite/storageService";
import toast from "react-hot-toast";

export function Post() {
  const [post, setPost] = useState("");
  const { postId } = useParams();
  const userData = useSelector((state) => state.auth.userData);
  const [profile, setProfile] = useState("");
  const navigate = useNavigate();
  const isAuthor = post && userData ? post.userId === userData.$id : false;
  useEffect(() => {
    //Getting post:
    (async () => {
      if (postId) {
        try {
          const get = await dbService.getPost(postId);
          if (get) {
            setPost(get);
          }
        } catch (error) {
          console.log(error.message);
        }
      }
    })();
    //Getting profile:
    (async () => {
      try {
        const get = await profileService.getUserProfile(userData.$id);
        if (get) {
          setProfile(get);
        }
      } catch (error) {
        console.log(error.message);
      }
    })();
  }, [postId, userData.$id]);
  //Delete post:
  const deleteHandler = async () => {
    try {
      const deleted = await dbService.deletePost(post.$id);
      if (deleted) {
        await storageService.deleteFile(post.featuredImage);
        toast.success("Post deleted successfully");
        navigate(`/profile/${profile.$id}`);
      }
    } catch (error) {
      console.log(error.message);
      toast.error(error.message || "Failed to delete");
    }
  };
  return (
    <div className=" w-full h-screen py-4 flex justify-center">
      <div className=" h-[40vh] w-full md:w-[70vw] lg:w-[40vw] container flex flex-col px-4">
        {/* First Container */}
        <div className=" w-full flex items-center justify-between">
          {/* Logo and Name */}
          <Link to={`/profile/${profile.userId}`}>
            <div className="flex items-center gap-2">
              {profile.profilePic ? (
                <img
                  src={storageService.previewFile(profile.profilePic)}
                  alt="dp"
                  className="rounded-full aspect-square w-[5%] mr-2"
                />
              ) : (
                <i className="fa-regular fa-user bg-gray-400 rounded-full p-2"></i>
              )}
              <p className="mr-1 font-mono text-sm">
                {profile.userName || "Unknown"}
              </p>
            </div>
          </Link>
          {/* Dropdown */}
          <details
            className="dropdown dropdown-left lg:dropdown-right"
            onClick={() => {
              document.getElementById("dots").classList.toggle("fa-xmark");
            }}
          >
            <summary className="btn bg-transparent hover:bg-transparent border-none">
              <i id="dots" className="fa-solid fa-ellipsis-vertical"></i>
            </summary>
            <ul className="menu dropdown-content bg-base-100 dark:bg-gray-600 rounded z-[1] w-40 p-0 shadow-lg text-xs lg:text-[1rem]">
              {" "}
              {isAuthor && (
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
                      onClick={deleteHandler}
                      className="hover:bg-red-500 hover:text-gray-50 duration-200 rounded"
                    >
                      Delete Post
                    </button>
                  </li>
                </>
              )}
              <li>
                <Link
                  to={`/profile/${profile.$id}`}
                  className="hover:bg-blue-500 hover:text-gray-50 duration-200 rounded"
                >
                  Profile
                </Link>
              </li>
            </ul>
          </details>
        </div>
        {/* Second Container */}
        <div className=" w-full flex justify-center ">
          <img
            src={storageService.previewFile(post.featuredImage)}
            alt={post.caption}
            className="w-full mb-1"
          />
        </div>
        {/* Third Container */}
        <div className=" w-full flex gap-3 items-center mb-2">
          <i className="fa-regular fa-heart text-xl"></i>
          <i className="fa-regular fa-comment text-xl"></i>
        </div>
        {/* Fourth Container */}
        <div className=" w-full mb-2">
          <p className="line-clamp-3 text-sm">{post.caption}</p>
        </div>
        {/* Fifth Container  */}
        <div className="mb-1 w-full">
          <input
            type="text"
            placeholder="Add a comment..."
            className="w-[90%] outline-none focus:border-blue-700 font-mono duration-100 border-b-2 border-gray-400 bg-transparent"
          />
          <button type="submit" className=" w-[10%]">
            <i className="fa-solid fa-plane"></i>
          </button>
        </div>
        {/* Sixth Container */}
        <div className="w-full">
          <span className="text-xs font-mono">{post.updatedAt}</span>
        </div>
        {/* Seventh Container */}
        {isAuthor ? (
          <Link
            to={"/explore"}
            className="p-2 bg-black text-gray-50 text-center mt-4 font-mono dark:bg-green-700"
          >
            Done ✔
          </Link>
        ) : null}
      </div>
    </div>
  );
}
