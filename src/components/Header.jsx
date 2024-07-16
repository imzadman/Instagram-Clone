import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, NavLink } from "react-router-dom";
import { LogoutBtn, ThemeBtn } from "./index";
import { storageService } from "../appwrite/storageService";
import { profileService } from "../appwrite/profileService";

export function Header() {
  const authStatus = useSelector((state) => state.auth.status);
  const userData = useSelector((state) => state.auth.userData);
  const navItems = [
    {
      name: "Home",
      status: authStatus,
      path: "/",
      icon: <i className="fa-solid fa-house"></i>,
    },
    {
      name: "Search",
      status: authStatus,
      path: "/search",
      icon: <i className="fa-solid fa-magnifying-glass"></i>,
    },
    {
      name: "Explore",
      status: authStatus,
      path: "/explore",
      icon: <i className="fa-regular fa-eye text-sm"></i>,
    },
    {
      name: "Create",
      status: authStatus,
      path: "/add-post",
      icon: <i className="fa-regular fa-square-plus"></i>,
    },
  ];
  //Theme:
  const [theme, setTheme] = useState(
    localStorage.getItem("theme")
      ? JSON.parse(localStorage.getItem("theme"))
      : "light"
  );
  useEffect(() => {
    localStorage.setItem("theme", JSON.stringify(theme));
    document.querySelector("html").setAttribute("data-theme", theme);
  }, [theme]);
  //HandleToggle:
  const handleToggle = (e) => {
    if (e.target.checked) {
      setTheme("black");
    } else {
      setTheme("light");
    }
  };
  //For profile:
  const [profile, setProfile] = useState("");

  useEffect(() => {
    (async () => {
      const get = await profileService.getUserProfile(userData.$id);
      if (get) {
        setProfile(get);
      }
    })();
  }, [userData, profile]);

  return (
    <div className="h-auto lg:h-screen w-full lg:w-[20vw] flex flex-row lg:flex-col items-center justify-between py-2 lg:py-8 pl-4 pr-2 lg:px-2 border-b sticky top-0 z-[1] lg:z-0 lg:border-r border-gray-600 dark:border-gray-800 bg-white dark:bg-black">
      {/* First Container */}
      {/* Logo */}
      <div className="">
        <Link to={"/"}>
          <span className="font-semibold text-sm md:text-xl font-playwrite dark:text-gray-100">
            Insta Clone
          </span>
        </Link>
      </div>
      {/* Second Container */}
      {/* Navbar */}
      <div className="lg:flex hidden">
        <ul>
          {navItems.map((item) =>
            item.status ? (
              <li key={item.name} className="list-none mb-4">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `${
                      isActive ? "text-blue-400" : undefined
                    } duration-100 font-ubuntu font-medium`
                  }
                >
                  <div className="">
                    <span className="text-lg mr-1">{item.icon}</span>
                    <span> {item.name}</span>
                  </div>
                </NavLink>
              </li>
            ) : null
          )}
        </ul>
      </div>
      {/* Third Container */}
      <div className="flex flex-row lg:flex-col gap-1">
        {/* Theme Btn */}
        <ThemeBtn onChange={handleToggle} />
        {/* UserData Dropdown */}
        {authStatus && (
          <div className="dropdown-left dropdown-bottom dropdown lg:dropdown-right lg:dropdown">
            <div
              tabIndex={0}
              role="button"
              className="btn bg-transparent hover:bg-transparent border-none"
            >
              {profile.profilePic ? (
                <img
                  src={storageService.previewFile(profile.profilePic)}
                  alt="dp"
                  className="w-[2vw] hidden lg:flex aspect-square rounded-full border-2 dark:border-red-500"
                />
              ) : (
                <i className="fa-regular fa-user hidden lg:flex bg-gray-400 rounded-full p-2"></i>
              )}
              <span className="text-xs md:text-[1rem]">{userData.name}</span>
              <i className="fa-solid fa-angle-down"></i>
            </div>
            <ul
              tabIndex={0}
              className="menu dropdown-content bg-base-100 dark:bg-gray-900 rounded z-[1] lg:w-40 p-0 shadow-lg text-xs lg:text-[1rem]"
            >
              {" "}
              <NavLink
                to={"/main-profile"}
                className={({ isActive }) => {
                  `${
                    isActive ? "text-blue-500" : "text-black dark:text-gray-100"
                  } font-mono duration-100`;
                }}
              >
                <li>
                  <button className="hover:bg-blue-500 hover:text-gray-50 duration-200 rounded">
                    <i className="fa-regular fa-user mr-2"></i>
                    <span>Profile</span>
                  </button>
                </li>
              </NavLink>
              {/* Logout btn */}
              <li className="list-none">
                <LogoutBtn />
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
