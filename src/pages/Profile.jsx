import React, { useEffect, useState } from "react";
import { profileService } from "../appwrite/profileService";
import { ProfileForm, Button, FollowBtn } from "../components/index";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { storageService } from "../appwrite/storageService";
import { dbService } from "../appwrite/dbService";
import toast from "react-hot-toast";

export function Profile() {
  const [profile, setProfile] = useState(null);
  const userData = useSelector((state) => state.auth.userData);
  const { userId } = useParams();
  const isOwner = profile && userData ? profile.userId === userData.$id : false;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followerProfiles, setFollowerProfiles] = useState([]);
  const [followingProfiles, setFollowingProfiles] = useState([]);
  //Fetching Profile:
  useEffect(() => {
    (async () => {
      if (userId) {
        const get = await profileService.getUserProfile(userId);
        setProfile(get);
        setLoading(false);
      }
    })();
    (() => {
      //Count:
      (async () => {
        const { followersCount, followingCount } =
          await profileService.getFollowCount(userId);
        setFollowers(followersCount);
        setFollowing(followingCount);
      })();
    })();
  }, [userId, profile]);
  //Delete Handler:
  const deleteHandler = async () => {
    try {
      const deleted = await profileService.deleteUserProfile();
      if (deleted) {
        storageService.deleteFile(profile.profilePic);
        toast.success("Deleted successfully");
        navigate("/");
      }
    } catch (error) {
      console.log(error.message);
      toast.error(error.message || "Failed to delete");
    }
  };
  //Fetching userPosts:
  useEffect(() => {
    (async () => {
      try {
        if (userId) {
          const get = await dbService.getUserPosts(userId);
          if (get) {
            setPosts(get.documents);
          }
        }
      } catch (error) {
        console.log("fdzsfsr");
      }
    })();
  }, [userId]);
  //Fetching followersProfile:
  const fetchingFollowersProfile = async () => {
    try {
      const followers = await profileService.getFollowers(userId);
      const profiles = [];
      for (let followerId of followers) {
        const profile = await profileService.getUserProfile(followerId);
        profiles.push(profile);
      }
      setFollowerProfiles(profiles);
    } catch (error) {
      console.error("Failed to fetch follower profiles:", error.message);
    }
  };
  //Fetching followersProfile:
  const fetchingFollowingProfiles = async () => {
    try {
      const following = await profileService.getFollowing(userId);
      const profiles = [];
      for (let followedId of following) {
        const profile = await profileService.getUserProfile(followedId);
        profiles.push(profile);
      }
      setFollowingProfiles(profiles);
    } catch (error) {
      console.error("Failed to fetch followed profiles:", error.message);
    }
  };
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <span className="loading loading-infinity loading-lg text-red-500"></span>
      </div>
    );
  } else {
    return profile ? (
      <div className="w-full h-screen flex justify-center overflow-y-auto">
        <div className="">
          <div className="flex flex-col p-4 lg:p-8 relative">
            {/* First Line */}
            <div className="flex justify-between  flex-col lg:flex-row">
              {/* First Component */}
              {/* Buttons */}
              <div className="flex gap-2 mb-4 text-sm lg:text-[1rem] absolute top-1 md:top-2 lg:top-8 right-2">
                {isOwner && (
                  <>
                    {/*  Add post */}
                    <Link to={"/add-post"}>
                      <Button
                        type="submit"
                        className="bg-blue-500 text-gray-50 rounded"
                      >
                        <i className="fa-regular fa-plus"></i>{" "}
                      </Button>
                    </Link>
                    {/* Edit Profile */}
                    <Link to={`/edit-profile/${profile.$id}`}>
                      <Button
                        type="submit"
                        className="bg-black text-gray-50 rounded"
                      >
                        <i className="fa-regular fa-pen-to-square"></i>{" "}
                      </Button>
                    </Link>

                    {/* Delete Profile */}
                    <Button
                      className="bg-red-500 text-gray-50 rounded h-fit"
                      type="submit"
                      onClick={deleteHandler}
                    >
                      <i className="fa-regular fa-trash-can"></i>
                    </Button>
                  </>
                )}
              </div>
              {/* Second Component */}
              <div className="flex items-center gap-4">
                {/* ProfilePic */}
                {profile.profilePic ? (
                  <div className="flex justify-center">
                    <img
                      src={storageService.previewFile(profile.profilePic)}
                      alt="dp"
                      className="w-[15vw] md:w-[15vw] lg:w-[10vw] rounded-full aspect-square mb-2 object-cover"
                    />
                  </div>
                ) : (
                  <i className="fa-regular fa-user py-3 text-center px-4 rounded-full bg-gray-400 text-[1rem] md:text-lg lg:text-xl w-fit"></i>
                )}
                <div className="flex flex-col gap-4">
                  {/* Username */}
                  <div className="">
                    <span className="mb-3 font-mono lg:text-xl mr-1">
                      {profile.userName}
                    </span>
                    <i className="fa-solid fa-circle-check text-blue-500 text-sm lg:text-[1rem]"></i>{" "}
                  </div>
                  <div className="flex gap-2 md:gap-8 text-sm md:text-lg lg:text-xl">
                    {/* Posts Length */}
                    <span className="font-mono">
                      {posts.length} <strong>Posts</strong>
                    </span>
                    {/* Followers Length */}
                    <button
                      className="flex items-center p-0 bg-transparent hover:bg-transparent"
                      onClick={() => {
                        document.getElementById("my_modal_2").showModal(),
                          fetchingFollowersProfile();
                      }}
                    >
                      <span className="font-mono">
                        {followers} <strong>Followers</strong>
                      </span>
                    </button>
                    <dialog id="my_modal_2" className="modal">
                      <div className="modal-box w-[70vw] md:w-[50vw] lg:w-[40vw] xl:w-[25vw] border dark:border-gray-600 p-0 rounded h-[20vh] md:h-[30vh] lg:h-[25vh] xl:h-[30vh] overflow-y-auto">
                        {followerProfiles.length > 0 ? (
                          followerProfiles.map((follower) => (
                            <Link
                              key={follower.$id}
                              to={`/profile/${follower.userId}`}
                              className="flex items-center gap-2 my-2 p-1 hover:bg-gray-200 dark:hover:bg-[#323232] duration-300"
                            >
                              <img
                                src={storageService.previewFile(
                                  follower.profilePic
                                )}
                                alt="dp"
                                className="w-[8vw] md:w-[6vw] lg:w-[4vw] xl:w-[3vw] aspect-square object-cover rounded-full"
                              />
                              <span className="hover:underline text-sm">
                                {follower.userName}
                              </span>
                            </Link>
                          ))
                        ) : (
                          <div className="text-center mt-8">
                            <span>No follower found</span>
                          </div>
                        )}
                      </div>
                      <form method="dialog" className="modal-backdrop">
                        <button>close</button>
                      </form>
                    </dialog>
                    {/* Following Length */}{" "}
                    <button
                      className="flex items-center p-0 bg-transparent hover:bg-transparent"
                      onClick={() => {
                        document.getElementById("my_modal_3").showModal(),
                          fetchingFollowingProfiles();
                      }}
                    >
                      <span className="font-mono">
                        {following}&nbsp;
                        <strong>Following</strong>
                      </span>
                    </button>
                    <dialog id="my_modal_3" className="modal">
                      <div className="modal-box  w-[70vw] md:w-[50vw] lg:w-[40vw] xl:w-[25vw] dark:border dark:border-gray-600 p-0 rounded h-[20vh] md:h-[30vh] lg:h-[25vh] xl:h-[30vh] overflow-y-auto">
                        {followingProfiles.length > 0 ? (
                          followingProfiles.map((followedProfile) => (
                            <Link
                              key={followedProfile.$id}
                              to={`/profile/${followedProfile.userId}`}
                              className="flex items-center gap-2 my-2 p-1 hover:bg-gray-200 dark:hover:bg-[#1d1c1c] duration-300"
                            >
                              <img
                                src={storageService.previewFile(
                                  followedProfile.profilePic
                                )}
                                alt="dp"
                                className="w-[8vw] md:w-[6vw] lg:w-[4vw] xl:w-[3vw] aspect-square object-cover rounded-full"
                              />
                              <span className="hover:underline text-sm">
                                {followedProfile.userName}
                              </span>
                            </Link>
                          ))
                        ) : (
                          <div className="text-center mt-8">
                            <span>No follower found</span>
                          </div>
                        )}
                      </div>
                      <form method="dialog" className="modal-backdrop">
                        <button>close</button>
                      </form>
                    </dialog>
                  </div>
                  {/* Follow Button */}
                  <div className="">
                    {!isOwner && <FollowBtn userId={profile.userId} />}
                  </div>
                </div>
              </div>
            </div>
            {/* Second Line */}
            <div className="mb-2">
              <span className="p-1 bg-gray-200 dark:bg-gray-600 rounded text-xs md:text-sm font-mono">
                {profile.gender}
              </span>
            </div>
            {/* Third line */}
            <div className=" mb-3">
              {profile.bio && (
                <span className="font-ubuntu text-sm md:text-[1rem]">
                  {profile.bio}
                </span>
              )}
            </div>
            {/* Fourth Line */}
            <div className="flex flex-col">
              <h1 className="font-mono font-semibold text-center text-lg md:text-2xl">
                Posts
              </h1>
              <div className="mt-4 w-full grid-cols-3 grid gap-1">
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <Link
                      to={`/posts/${profile.$id}`}
                      key={post.$id}
                      className="flex justify-center border-2 border-gray-700 rounded dark:border-gray-500  lg:w-[20vw] lg:h-[20vw]"
                    >
                      <img
                        src={storageService.previewFile(post.featuredImage)}
                        className="object-cover aspect-square"
                      />
                    </Link>
                  ))
                ) : (
                  <div className="w-full mt-2">
                    <h1 className="font-mono text-lg md:text-xl absolute left-[25%] md:left-[28%] lg:left-[32%]">
                      <strong>{profile.userName}&nbsp; </strong>has no posts
                      <i className="fa-solid fa-face-rolling-eyes ml-1"></i>
                    </h1>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div className="w-full flex justify-center">
        <div className="mt-10 px-8 py-4">
          <ProfileForm />
        </div>
      </div>
    );
  }
}
