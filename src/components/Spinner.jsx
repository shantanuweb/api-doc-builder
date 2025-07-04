import React from "react";

export default function Spinner({ className = "" }) {
  return (
    <span
      className={`inline-block h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin ${className}`}
    />
  );
}
