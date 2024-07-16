import React from "react";
import { useId } from "react";
import { forwardRef } from "react";

export const Input = forwardRef(function Input(
  { label, type = "text", className = "", ...props },
  ref
) {
  const id = useId();
  return (
    <>
      {label && (
        <label
          htmlFor={id}
          className="inline-block font-mono text-sm md:text-[1rem]"
        >
          {label}
        </label>
      )}
      <input
        type={type}
        className={`${className} border-gray-300 bg-transparent px-2 py-1 border-b-2 outline-none dark:border-gray-500 focus:border-blue-800 dark:focus:border-blue-500 duration-200 text-sm md:text-[1rem] `}
        {...props}
        id={id}
        ref={ref}
      />
    </>
  );
});
