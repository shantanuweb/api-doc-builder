import React from "react";

export default function OpenAPIGenerator({ data }) {
  function generateOpenAPI() {
    const openapi = {
      openapi: "3.0.0",
      info: {
        title: data.meta?.title || "API Documentation",
        description: data.meta?.description || "",
        version: "1.0.0",
      },
      paths: {
        [`${data.path || "/endpoint"}`]: {
          [data.method?.toLowerCase() || "get"]: {
            summary: data.meta?.title || "",
            description: data.meta?.description || "",
            parameters: [],
            responses: {
              200: {
                description: "Successful response",
              },
            },
          },
        },
      },
    };
    return JSON.stringify(openapi, null, 2);
  }

  const handleExport = () => {
    const blob = new Blob([generateOpenAPI()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "openapi.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="bg-yellow-600 text-white px-4 py-2 rounded transition-colors duration-200 hover:bg-yellow-700"
    >
      📝 Export OpenAPI
    </button>
  );
}
