import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export function BottomNavbar() {
  const authStatus = useSelector((state) => state.auth.status);
  return (
    authStatus && (
      <div className="w-full h-auto lg:hidden flex justify-between py-2 px-5 sticky bottom-0 z-[1] bg-white dark:bg-black border-t-2 border-gray-700">
        <Link to={"/"}>
          <i className="fa-solid fa-house"></i>{" "}
        </Link>
        <Link to={"/search"}>
          <i className="fa-solid fa-magnifying-glass"></i>{" "}
        </Link>
        <Link to={"/explore"}>
          <i className="fa-solid fa-eye"></i>{" "}
        </Link>
        <Link to={"/add-post"}>
          <i className="fa-solid fa-plus"></i>{" "}
        </Link>
      </div>
    )
  );
}
