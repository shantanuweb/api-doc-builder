import React, { useState, useEffect } from "react";
import flattenSchema from "../utils/flattenSchema";

export default function ManualDocEditor({
  data,
  setData,
  requestParams,
  setRequestParams,
  responseParams,
  setResponseParams,
}) {
  // Local state for the fields
  const [endpoint, setEndpoint] = useState(data.baseUrl + (data.path || ""));
  const [method, setMethod] = useState(data.method || "GET");
  const [bodyJson, setBodyJson] = useState("");
  const [queryParams, setQueryParams] = useState([{ name: "", value: "" }]);
  const [pathParams, setPathParams] = useState({});

  // Path Params handling
  const pathParamsUI =
    (endpoint.match(/\{(\w+)\}/g) || []).map((m) => m.replace(/[{}]/g, ""));

  // Sync baseUrl, path and method to data
  useEffect(() => {
    let pathMatch = endpoint.match(/(https?:\/\/[^/]+)(\/.*)/);
    let baseUrl = endpoint, path = "";
    if (pathMatch) {
      baseUrl = pathMatch[1];
      path = pathMatch[2];
    }
    setData((d) => ({
      ...d,
      baseUrl,
      path,
      method,
    }));
    // eslint-disable-next-line
  }, [endpoint, method]);

  // Handle param tables for GET and for POST/PUT/PATCH
  useEffect(() => {
    // Path params to request params
    const pathParamsKeys =
      (endpoint.match(/\{(\w+)\}/g) || []).map((m) => m.replace(/[{}]/g, ""));
    if (pathParamsKeys.length) {
      setRequestParams((existing) => [
        ...pathParamsKeys.map((key) => ({
          name: key,
          type: "string",
          required: true,
          description: "Path parameter",
        })),
        ...existing.filter(
          (p) => !pathParamsKeys.includes(p.name) || p.description !== "Path parameter"
        ),
      ]);
    }

    if (method === "GET") {
      // Add query params to request params
      const paramsForTable = queryParams
        .filter((p) => p.name.trim() !== "")
        .map((p) => ({
          name: p.name,
          type: "string",
          required: false,
          description: "Query parameter",
        }));
      setRequestParams((existing) => [
        ...paramsForTable,
        ...existing.filter((p) => p.description !== "Query parameter"),
      ]);
    }

    if (["POST", "PUT", "PATCH"].includes(method)) {
      let bodyObj;
      try {
        bodyObj = bodyJson ? JSON.parse(bodyJson) : {};
      } catch {
        bodyObj = {};
      }
      setRequestParams(flattenSchema(bodyObj));
    }
    // eslint-disable-next-line
  }, [method, bodyJson, queryParams, endpoint]);

  // Query Params table handlers
  const handleQueryParamChange = (idx, field, value) => {
    setQueryParams((params) =>
      params.map((p, i) =>
        i === idx ? { ...p, [field]: value } : p
      )
    );
  };
  const handleAddQueryParam = () => {
    setQueryParams((params) => [...params, { name: "", value: "" }]);
  };
  const handleRemoveQueryParam = (idx) => {
    setQueryParams((params) => params.filter((_, i) => i !== idx));
  };


  // Path param values UI (auto-generated from endpoint)
  // If you want to collect sample/example values for path params, add input fields below

  return (
    <div>
      <label className="font-medium">Endpoint</label>
      <input
        type="text"
        value={endpoint}
        onChange={(e) => setEndpoint(e.target.value)}
        className="border px-2 py-1 rounded text-black dark:text-white bg-white dark:bg-gray-800 w-full mb-2"
        placeholder="https://api.example.com/users/{userId}"
      />

      {/* Path Params (auto-detected) */}
      {pathParamsUI.length > 0 && (
        <div className="mb-2">
          <label className="font-medium">Path Parameters</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {pathParamsUI.map((key) => (
              <div key={key} className="flex items-center gap-1">
                <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{key}</span>
                {/* Optionally add sample value field */}
                {/* <input
                  type="text"
                  value={pathParams[key] || ""}
                  onChange={(e) =>
                    setPathParams((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                  className="border px-1 py-1 rounded text-black dark:text-white bg-white dark:bg-gray-800 w-24"
                  placeholder="value"
                /> */}
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Document the meaning of <code className="font-mono">{endpoint}</code> path parameters above.
          </div>
        </div>
      )}

      <label className="font-medium">Method</label>
      <select
        value={method}
        onChange={(e) => setMethod(e.target.value)}
        className="border px-2 py-1 rounded text-black dark:text-white bg-white dark:bg-gray-800 w-full mb-2"
      >
        <option>GET</option>
        <option>POST</option>
        <option>PUT</option>
        <option>PATCH</option>
        <option>DELETE</option>
      </select>

      {/* Query Params for GET */}
      {method === "GET" && (
        <div className="mb-2">
          <label className="font-medium">Query Parameters</label>
          <table className="w-full border mb-2 text-xs mt-1">
            <thead>
              <tr>
                <th className="border px-2 py-1">Name</th>
                <th className="border px-2 py-1">Value</th>
                <th className="border px-2 py-1"></th>
              </tr>
            </thead>
            <tbody>
              {queryParams.map((param, idx) => (
                <tr key={idx}>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      value={param.name}
                      onChange={(e) =>
                        handleQueryParamChange(idx, "name", e.target.value)
                      }
                      className="w-full border px-1 py-1 rounded text-black dark:text-white bg-white dark:bg-gray-800"
                      placeholder="key"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      value={param.value}
                      onChange={(e) =>
                        handleQueryParamChange(idx, "value", e.target.value)
                      }
                      className="w-full border px-1 py-1 rounded text-black dark:text-white bg-white dark:bg-gray-800"
                      placeholder="value"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    {queryParams.length > 1 && (
                      <button
                        className="text-red-600 hover:text-red-800 text-xs px-1"
                        onClick={() => handleRemoveQueryParam(idx)}
                        title="Remove"
                      >
                        ✕
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={handleAddQueryParam}
            className="bg-gray-200 dark:bg-gray-700 text-xs px-2 py-1 rounded"
            type="button"
          >
            + Add Param
          </button>
        </div>
      )}

      {/* Body Params for POST/PUT/PATCH */}
        {(method === "POST" || method === "PUT" || method === "PATCH") && (
          <>
            <label className="font-medium">Body (JSON)</label>
            <textarea
              value={bodyJson}
              onChange={(e) => setBodyJson(e.target.value)}
              className="border px-2 py-1 rounded font-mono text-black dark:text-white bg-white dark:bg-gray-800 w-full"
              rows={3}
              placeholder='{"key":"value"}'
            />
          </>
        )}
      </div>
    );
  }
