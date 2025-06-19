import React, { useState } from "react";

function inferParamsFromObject(obj) {
  if (!obj || typeof obj !== "object") return [];
  return Object.entries(obj).map(([key, value]) => ({
    name: key,
    type: Array.isArray(value)
      ? "array"
      : value === null
      ? "null"
      : typeof value,
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

    // Infer request params from JSON body if present
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
      // Update request params
      setRequestParams(inferParamsFromObject(bodyObj));
    }

    try {
      const res = await fetch(endpoint, {
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
