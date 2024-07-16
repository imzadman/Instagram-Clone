import React, { useEffect, useState } from "react";
import { storageService } from "../appwrite/storageService";
import { profileService } from "../appwrite/profileService";
import { Link, useNavigate } from "react-router-dom";
import { dbService } from "../appwrite/dbService";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FollowBtn } from "./index";

export function PostCard({ post, userProfile }) {
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);
  const isAuthor = post && userData ? post.userId === userData.$id : false;
  const { register, handleSubmit, reset } = useForm();
  const [comments, setComments] = useState([]);
  const [commentProfiles, setCommentProfiles] = useState({});
  const [likes, setLikes] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  //Format Date:
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
  // Delete Post:
  const deleteHandler = async () => {
    try {
      const deleted = await dbService.deletePost(post.$id);
      if (deleted) {
        await storageService.deleteFile(post.featuredImage);
        toast.success("Post deleted");
        navigate("/main-profile");
      }
    } catch (error) {
      console.log(error.message || "Failed to delete post");
      toast.error(error.message || "Failed to delete post");
    }
  };

  //Add Comment:
  const addComment = async (data) => {
    try {
      const newComment = await dbService.addComment(
        post.$id,
        userData.$id,
        data.comment,
        formatDate(Date.now())
      );
      setComments((prevComments) => [
        ...prevComments,
        {
          id: newComment.id,
          content: data.comment,
          createdAt: formatDate(Date.now()),
        },
      ]);
      toast.success("Comment posted");
      reset({ comment: "" });
    } catch (error) {
      console.log(error.message || "Failed to add comment");
      toast.error(error.message || "Failed to add comment");
    }
  };
  //Fetching Comments:
  const fetchingComments = async () => {
    setLoading(true);
    try {
      const fetchedComments = await dbService.getComments(post.$id);
      if (fetchedComments) {
        setComments(fetchedComments);
        setLoading(false);
      }
      // Fetch user profiles for each comment
      const profiles = {};
      for (let comment of fetchedComments) {
        if (!profiles[comment.userId]) {
          const profile = await profileService.getUserProfile(comment.userId);
          profiles[comment.userId] = profile;
        }
      }
      setCommentProfiles(profiles);
    } catch (error) {
      console.log("Failed to fetch comments", error);
      setLoading(false);
    }
  };
  //Delete Comment:
  const deleteComment = async (commentId) => {
    try {
      const deleted = await dbService.deleteComment(post.$id, commentId);
      if (deleted) {
        toast.success("Comment deleted");
        setComments(comments.filter((comment) => comment.id !== commentId));
      }
    } catch (error) {
      console.log(error.message || "Failed to delete comment");
      toast.error(error.message || "Failed to delete comment");
    }
  };
  //Unique ID for each comment section:
  const [id, setId] = useState("");
  useEffect(() => {
    setId(`model${post.$id}`);
  }, [post.$id]);
  //Unique ID for each like section:
  const [id2, setId2] = useState("");
  useEffect(() => {
    setId2(`like${post.$id}`);
  }, [post.$id]);

  //Fetching likes:
  useEffect(() => {
    const fetchingLikes = async () => {
      try {
        const get = await dbService.getLikes(post.$id);
        setLikes(get);
        setIsLiked(get.includes(userData.$id));
      } catch (error) {
        console.log(error.message || "Failed to get likes");
      }
    };
    fetchingLikes();
  }, [post.$id, userData.$id, likes]);
  //HandleLike:
  const handleLike = async () => {
    if (isLiked) {
      await dbService.deleteLike(post.$id, userData.$id);
      setLikes(likes.filter((id) => id !== userData.$id));
      toast.success("Unliked 👎");
      setIsLiked(false);
    } else if (!isLiked) {
      const newlike = await dbService.addLike(post.$id, userData.$id);
      setLikes((prevLikes) => [...prevLikes, newlike]);
      toast.success("Liked 👍");
      setIsLiked(true);
    }
  };
  return (
    <div className="w-full flex justify-center">
      <div className="w-full md:w-[70vw] lg:w-[40vw] container flex flex-col px-4">
        {/* First Container */}
        <div className="w-full flex items-center justify-between">
          {/* Logo and Name */}
          <Link to={`/profile/${userProfile.$id}`}>
            <div className="flex items-center">
              {userProfile.profilePic ? (
                <img
                  src={storageService.previewFile(userProfile.profilePic)}
                  alt="dp"
                  className="rounded-full aspect-square w-[10%] xl:w-[8%] mr-2"
                />
              ) : (
                <i className="fa-regular fa-user bg-gray-400 rounded-full p-2"></i>
              )}
              <p className="font-ubuntu">{userProfile.userName || "Unknown"}</p>
            </div>
          </Link>
          {/* Dropdown & FollowBtn */}
          <div className="flex items-center">
            {!isAuthor && <FollowBtn userId={userProfile.$id} />}
            <div className="dropdown dropdown-left dropdown-bottom lg:dropdown-right lg:dropdown-bottom">
              <div
                tabIndex={0}
                role="button"
                className="btn bg-transparent hover:bg-transparent border-none"
              >
                <i className="fa-solid fa-ellipsis-vertical"></i>
              </div>
              <ul
                tabIndex={0}
                className="menu dropdown-content bg-base-100 dark:bg-gray-800 rounded z-[1] w-40 p-0 shadow-lg text-xs lg:text-[1rem]"
              >
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
                        className="hover:bg-red-500 hover:text-gray-50 duration-200 rounded"
                        onClick={deleteHandler}
                      >
                        Delete Post
                      </button>
                    </li>
                  </>
                )}
                <li>
                  <Link
                    to={`/profile/${userProfile.$id}`}
                    className="hover:bg-blue-500 hover:text-gray-50 duration-200 rounded"
                  >
                    Profile
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        {/* Second Container */}
        <div className="w-full">
          <img
            src={storageService.previewFile(post.featuredImage)}
            alt={post.caption}
            className=" mb-1 w-full h-auto"
          />
        </div>
        {/* Third Container 1*/}
        <div className="w-full flex gap-4">
          {/* Likes */}
          <div className="">
            <button onClick={handleLike}>
              <i
                id={id2}
                className={`${
                  isLiked ? "fa-solid text-red-500" : "fa-regular"
                } fa-heart text-xl`}
              ></i>
            </button>
          </div>
          {/* Comments */}
          <div className="">
            {/* Modal trigger */}
            <button
              onClick={() => {
                document.getElementById(id).classList.toggle("hidden");
                fetchingComments();
              }}
            >
              <i className="fa-regular fa-comment text-xl"></i>
            </button>
          </div>
          {/* Model ends here */}
        </div>
        {/* Third Container 2 */}
        <span className="font-mono my-1">
          {likes.length} {likes.length < 2 ? "Like" : "Likes"}
        </span>
        {/* Third Container 3 */}
        <div
          id={id}
          className="section w-full max-h-[35vh] md:max-h-[50vh] overflow-y-auto bg-gray-100 dark:bg-[#0f0f0f] hidden flex flex-col gap-2 p-4 rounded-lg font-ubuntu text-sm duration-200"
        >
          {loading ? (
            <div className="w-full flex items-center justify-center">
              <span className="loading loading-infinity loading-lg text-blue-500"></span>
            </div>
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <div
                className="flex flex-wrap w-full justify-between p-2 hover:bg-gray-200 duration-200 rounded-lg dark:hover:bg-[#1d1d1d] relative"
                key={comment.id}
              >
                <div className="flex flex-col justify-center">
                  <Link
                    to={`/profile/${comment.userId}`}
                    className="flex gap-2 items-center"
                  >
                    {commentProfiles[comment.userId]?.profilePic ? (
                      <img
                        src={storageService.previewFile(
                          commentProfiles[comment.userId]?.profilePic
                        )}
                        alt="dp"
                        className="w-[6vw] md:w-[3vw] lg:w-[2vw] aspect-square rounded-full"
                      />
                    ) : (
                      <i className="fa-regular fa-user p-1 lg:p-2 bg-gray-400 dark:text-black rounded-full"></i>
                    )}
                    <span className="font-ubuntu font-medium">
                      {commentProfiles[comment.userId]?.userName ||
                        "Unknown User"}
                    </span>
                    <span className="text-xs">{comment.createdAt}</span>
                  </Link>
                  <span className="text-sm pl-8 lg:pl-10 font-light">
                    {comment.content}
                  </span>
                </div>
                <div className="absolute right-2 top-2">
                  {comment.userId === userData.$id && (
                    <div className="dropdown dropdown-left">
                      <label tabIndex={0} className="cursor-pointer">
                        <i className="fa-solid fa-ellipsis-vertical"></i>
                      </label>
                      <ul
                        tabIndex={0}
                        className="dropdown-content menu p-0 m-3 shadow bg-base-100 hover:bg-red-500 hover:text-gray-50 rounded w-fit"
                      >
                        <li>
                          <a onClick={() => deleteComment(comment.id)}>
                            <i className="fa-solid fa-trash-can"></i>{" "}
                          </a>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <span className="text-sm text-center">No comments posted</span>
          )}
        </div>
        {/* Fourth Container 2 */}
        <div className="w-full mb-3">
          <p className="line-clamp-3 text-sm">{post.caption}</p>
        </div>
        {/* Fifth Container  */}
        <form className="w-full mb-1" onSubmit={handleSubmit(addComment)}>
          <input
            type="text"
            placeholder="Add a comment..."
            className="w-[90%] outline-none font-mono border-b-2 border-gray-400 bg-transparent focus:border-blue-700"
            {...register("comment", { required: true })}
          />
          <button type="submit" className="w-[10%]">
            <i className="fa-solid fa-plane"></i>
          </button>
        </form>
        {/* Sixth Container */}
        <div className="w-full">
          <span className="text-xs font-mono">{post.createdAt}</span>
        </div>
        {/* Seventh Container */}
        <hr className="my-4 md:my-8 border border-gray-500" />
      </div>
    </div>
  );
}
