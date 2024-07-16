import React, { useEffect, useState } from "react";
import { Input, Button } from "../components/index";
import { Link, useNavigate } from "react-router-dom";
import { storageService } from "../appwrite/storageService";
import { profileService } from "../appwrite/profileService";
import { useSelector } from "react-redux";

export function Search() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      setError("");
      try {
        const get = await profileService.getUsersProfile(search);
        setUsers(get.documents);
        setLoading(false);
      } catch (error) {
        console.log("Failed to get users", error);
        setLoading(false);
        setError(error.message);
      }
    };
    const debounceTimer = setTimeout(() => {
      fetchUsers();
    }, 200);
    return () => clearTimeout(debounceTimer);
  }, [search]);
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
  return profile ? (
    <div className="w-full h-screen flex justify-center">
      <div className=" h-[30vh] md:h-[40vh] xl:h-[50vh] mt-10 px-4 md:px-8 py-4 flex flex-col items-center shadow-lg dark:border-gray-700 border rounded-lg">
        {/* First */}
        <div className="w-full flex items-center gap-1">
          <Input
            type="search"
            placeholder="Search users"
            className="px-2 rounded-none"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
          />
          <Button
            type="submit"
            onClick={() => {
              setSearch("");
            }}
            className="bg-black dark:bg-red-500 text-gray-50"
          >
            <i className="fa-solid fa-xmark"></i>
          </Button>
        </div>
        {/* Second */}
        <div className="w-full flex flex-col gap-0 overflow-y-auto">
          {error ? (
            //If error:
            <span className="text-sm font-mono text-center mt-8">{error}</span>
          ) : loading ? (
            // If loading:
            <div className="flex items-center justify-center">
              <span className="loading loading-infinity loading-lg text-green-500 text-center mt-8"></span>
            </div>
          ) : //If users:
          users.length > 0 ? (
            users?.map((user) => (
              <li key={user.userId} className="list-none ">
                <Link
                  to={`/profile/${user.userId}`}
                  className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-[#1d1d1d] duration-100 rounded-lg"
                >
                  {user.profilePic ? (
                    <img
                      src={storageService.previewFile(user.profilePic)}
                      alt={""}
                      className="rounded-full aspect-square w-[7vw] md:w-[4.5vw] lg:w-[4vw] xl:w-[2.7vw]"
                    />
                  ) : (
                    <i className="fa-regular fa-user bg-gray-300 dark:bg-gray-600 dark:text-black rounded-full py-1 px-2 md:py-2 md:px-3 lg:py-2.5 lg:px-3.5 text-sm"></i>
                  )}
                  <span className="font-mono text-sm duration-100 hover:underline">
                    {user.userName}
                  </span>
                </Link>
              </li>
            ))
          ) : (
            <div className="text-center mt-8">
              <span className="text-sm font-semibold">No users found</span>
            </div>
          )}
        </div>
      </div>
    </div>
  ) : (
    <div className="w-full h-screen"></div>
  );
}
