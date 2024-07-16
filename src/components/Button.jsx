import React from "react";

export function Button({
  children,
  type = "button",
  className = "",
  ...props
}) {
  return (
    <button
      className={`${className} py-1 px-2 font-mono duration-100 hover:opacity-[85%] active:opacity-[100%] active:text-sm`}
      {...props}
      type={type}
    >
      {children}
    </button>
  );
}
