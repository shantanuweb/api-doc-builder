import React, { useState, useRef } from "react";

export default function ExportDropdown({
  onMarkdown,
  onPDF,
  onOpenAPI,
  onHTML,
  onClose,
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  // Close when clicking outside
  React.useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
        if (onClose) onClose();
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () =>
      document.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        className="bg-indigo-700 text-white px-4 py-2 rounded font-medium hover:bg-indigo-800"
        onClick={() => setOpen((o) => !o)}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
      >
        📤 Export Documentation ▼
      </button>
      {open && (
        <div className="absolute z-10 bg-white dark:bg-gray-900 shadow rounded mt-1 w-48" role="menu">
          <button
            className="block w-full text-left px-4 py-2 hover:bg-indigo-50 dark:hover:bg-gray-800"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onMarkdown();
            }}
          >
            Export as Markdown
          </button>
          <button
            className="block w-full text-left px-4 py-2 hover:bg-indigo-50 dark:hover:bg-gray-800"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onPDF();
            }}
          >
            Export as PDF
          </button>
          <button
            className="block w-full text-left px-4 py-2 hover:bg-indigo-50 dark:hover:bg-gray-800"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onOpenAPI();
            }}
          >
            Export as OpenAPI (JSON)
          </button>
           <button
            className="block w-full text-left px-4 py-2 hover:bg-indigo-50 dark:hover:bg-gray-800"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onHTML(); // <-- Call the HTML handler
            }}
          >
            Export as HTML
          </button>
        </div>
      )}
    </div>
  );
}
