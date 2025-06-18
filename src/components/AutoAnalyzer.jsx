import React, { useState } from "react";

export default function AutoAnalyzer({ setData }) {
  const [endpoint, setEndpoint] = useState("");
  const [method, setMethod] = useState("GET");
  const [headers, setHeaders] = useState('{"Content-Type": "application/json"}');
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    setError("");
    let parsedHeaders = {};
    try {
      parsedHeaders = headers ? JSON.parse(headers) : {};
    } catch (e) {
      setError("Headers must be valid JSON.");
      return;
    }

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
      setError("Cannot fetch! Check endpoint, CORS, headers, or body JSON.");
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
          className="border px-2 py-1 rounded"
          placeholder="https://api.example.com/auth/login"
        />
        <label className="font-medium">Method</label>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="border px-2 py-1 rounded"
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
          className="border px-2 py-1 rounded font-mono"
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
              className="border px-2 py-1 rounded font-mono"
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
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </div>
    </div>
  );
}
