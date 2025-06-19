import React, { useState } from "react";

// Helper to infer param types from JSON
function inferParamsFromObject(obj) {
  if (!obj || typeof obj !== "object") return [];
  return Object.entries(obj).map(([key, value]) => ({
    name: key,
    type: Array.isArray(value)
      ? "array"
      : value === null
      ? "null"
      : typeof value,
    required: true,
    description: "",
  }));
}

export default function AutoAnalyzer({
  setData,
  setRequestParams,
  setResponseParams,
}) {
  const [endpoint, setEndpoint] = useState("");
  const [method, setMethod] = useState("GET");
  const [headers, setHeaders] = useState('{"Content-Type": "application/json"}');
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [apiResponse, setApiResponse] = useState(null);
  const [queryParams, setQueryParams] = useState([{ name: "", value: "" }]);

  // Build full URL for GET
  const buildUrlWithQuery = () => {
    if (method !== "GET" || !queryParams.length) return endpoint;
    const params = queryParams
      .filter((p) => p.name.trim() !== "")
      .map(
        (p) =>
          `${encodeURIComponent(p.name)}=${encodeURIComponent(p.value ?? "")}`
      )
      .join("&");
    if (!params) return endpoint;
    return endpoint.includes("?")
      ? `${endpoint}&${params}`
      : `${endpoint}?${params}`;
  };

  const handleAnalyze = async () => {
    setError("");
    setApiResponse(null);
    let parsedHeaders = {};
    try {
      parsedHeaders = headers ? JSON.parse(headers) : {};
    } catch (e) {
      setError("Headers must be valid JSON.");
      return;
    }

    // POST/PUT/PATCH: infer request params from body JSON
    if (["POST", "PUT", "PATCH"].includes(method)) {
      if (
        !parsedHeaders["Content-Type"] ||
        parsedHeaders["Content-Type"] !== "application/json"
      ) {
        setError(
          "Please set Content-Type to application/json for POST/PUT/PATCH requests."
        );
        return;
      }
      let bodyObj;
      try {
        bodyObj = body ? JSON.parse(body) : null;
      } catch (e) {
        setError("Body is not valid JSON.");
        return;
      }
      if (!bodyObj || Object.keys(bodyObj).length === 0) {
        setError("Please provide a non-empty JSON body.");
        return;
      }
      setRequestParams(inferParamsFromObject(bodyObj));
    }

    // GET: infer request params from query table
    if (method === "GET") {
      const paramsForTable = queryParams
        .filter((p) => p.name.trim() !== "")
        .map((p) => ({
          name: p.name,
          type: "string",
          required: false,
          description: "",
        }));
      setRequestParams(paramsForTable);
    }

    // Compose URL for fetch
    const fetchUrl = method === "GET" ? buildUrlWithQuery() : endpoint;

    try {
      const res = await fetch(fetchUrl, {
        method,
        headers: parsedHeaders,
        body: ["POST", "PUT", "PATCH"].includes(method) ? body : undefined,
      });
      let responseText = await res.text();
      let json;
      try {
        json = JSON.parse(responseText);
        setError("");
      } catch (e) {
        setError("Response is not valid JSON. See raw response below.");
        json = { raw: responseText };
      }

      setApiResponse(json);
      setResponseParams(inferParamsFromObject(json));
      setData((d) => ({
        ...d,
        baseUrl: endpoint.replace(/\/[\w\-]+$/, ""),
        path: endpoint.match(/\/[\w\-]+$/)?.[0] || "",
        method,
        headers: parsedHeaders,
        requestBody: body ? JSON.parse(body) : {},
        response: json,
      }));
    } catch (err) {
      setError(
        "Cannot fetch! This may be due to:\n" +
          "• API endpoint is wrong\n" +
          "• JSON in headers or body is invalid\n" +
          "• CORS (the API blocks browser access)\n\n" +
          "Try Manual Entry mode if you are stuck, or use a mock API endpoint."
      );
    }
  };

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

  return (
    <div className="mb-4">
      <div className="flex flex-col gap-2">
        <label className="font-medium">Endpoint</label>
        <input
          type="text"
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          className="border px-2 py-1 rounded text-black dark:text-white bg-white dark:bg-gray-800"
          placeholder="https://api.example.com/auth/login"
        />
        <label className="font-medium">Method</label>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="border px-2 py-1 rounded text-black dark:text-white bg-white dark:bg-gray-800"
        >
          <option>GET</option>
          <option>POST</option>
          <option>PUT</option>
          <option>PATCH</option>
          <option>DELETE</option>
        </select>

        {/* Show query params editor only for GET */}
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
            <div className="mt-1 text-xs text-gray-500">
              Final GET URL:{" "}
              <span className="font-mono">{buildUrlWithQuery()}</span>
            </div>
          </div>
        )}

        <label className="font-medium">Headers (JSON)</label>
        <textarea
          value={headers}
          onChange={(e) => setHeaders(e.target.value)}
          className="border px-2 py-1 rounded font-mono text-black dark:text-white bg-white dark:bg-gray-800"
          rows={2}
          placeholder='{"Content-Type": "application/json"}'
        />
        {(method === "POST" ||
          method === "PUT" ||
          method === "PATCH") && (
          <>
            <label className="font-medium">Body (JSON)</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="border px-2 py-1 rounded font-mono text-black dark:text-white bg-white dark:bg-gray-800"
              rows={3}
              placeholder='{"key":"value"}'
            />
          </>
        )}
        <button
          onClick={handleAnalyze}
          className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
        >
          Submit &amp; Generate
        </button>
        {error && (
          <div className="text-red-600 mt-2 whitespace-pre-line">
            {error}
          </div>
        )}
        {apiResponse && (
          <div className="mt-4 bg-gray-100 dark:bg-gray-900 p-2 rounded font-mono text-xs overflow-x-auto">
            <b>Response:</b>
            <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
