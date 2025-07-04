import React from "react";
import PropTypes from "prop-types";

export default function Toast({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded shadow-lg flex items-center gap-2">
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 font-bold text-lg leading-none focus:outline-none">
        ×
      </button>
    </div>
  );
}

Toast.propTypes = {
  message: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};
