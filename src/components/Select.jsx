import React from "react";
import { useId } from "react";
import { forwardRef } from "react";

export const Select = forwardRef(function Select(
  { label, options = [], className = "", ...props },
  ref
) {
  const id = useId();
  return (
    <>
      {label && (
        <label
          htmlFor={id}
          className="inline-block mb-1 font-mono text-sm md:text-[1rem]"
        >
          {label}
        </label>
      )}
      <select
        id={id}
        ref={ref}
        className={`${className} select select-bordered max-w-xs w-full focus:outline-none text-sm md:text-[1rem]`}
        {...props}
      >
        {options?.map((option) => (
          <option
            key={option}
            value={option}
            className="p-1 text-sm md:text-[1rem]"
          >
            {option}
          </option>
        ))}
      </select>
    </>
  );
});
