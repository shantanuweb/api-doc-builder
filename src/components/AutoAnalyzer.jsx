import React, { useState, useEffect } from "react";
import flattenSchema from "../utils/flattenSchema";
import Spinner from "./Spinner";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight, oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function AutoAnalyzer({
  setData,
  setRequestParams,
  setResponseParams,
  headers: incomingHeaders = { "Content-Type": "application/json" },
  endpoint: incomingEndpoint = "",
}) {
  const [endpoint, setEndpoint] = useState(incomingEndpoint);
  const [method, setMethod] = useState("GET");
  const [headers, setHeaders] = useState(
    JSON.stringify(incomingHeaders, null, 2)
  );
  const [bodyFields, setBodyFields] = useState([{ name: "", value: "" }]);
  const [queryParams, setQueryParams] = useState([{ name: "", value: "" }]);
  const [pathParams, setPathParams] = useState({});
  const [error, setError] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Update local endpoint and headers when incoming props change
  useEffect(() => {
    setEndpoint(incomingEndpoint);
  }, [incomingEndpoint]);


  const incomingHeadersStr = JSON.stringify(incomingHeaders, null, 2);
  useEffect(() => {
    setHeaders(incomingHeadersStr);
  }, [incomingHeadersStr]);

  // Compose endpoint with path params
  const endpointWithPathParams = endpoint.replace(/\{(\w+)\}/g, (_, k) => pathParams[k] || `{${k}}`);

  // Build GET URL with query params
  const buildUrlWithQuery = () => {
    if (method !== "GET" || !queryParams.length) return endpointWithPathParams;
    const params = queryParams
      .filter((p) => p.name.trim() !== "")
      .map(
        (p) =>
          `${encodeURIComponent(p.name)}=${encodeURIComponent(p.value ?? "")}`
      )
      .join("&");
    if (!params) return endpointWithPathParams;
    return endpointWithPathParams.includes("?")
      ? `${endpointWithPathParams}&${params}`
      : `${endpointWithPathParams}?${params}`;
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    setApiResponse(null);
    let parsedHeaders = {};
    try {
      parsedHeaders = headers ? JSON.parse(headers) : {};
    } catch (e) {
      setError({ message: "Headers must be valid JSON." });
      setIsLoading(false);
      return;
    }

    // Path params: add to request params
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

    // POST/PUT/PATCH: handle request body and params
    if (["POST", "PUT", "PATCH"].includes(method)) {
      parsedHeaders["Content-Type"] = "application/json";
      const bodyObj = {};
      bodyFields.forEach((p) => {
        if (p.name.trim() !== "") bodyObj[p.name] = p.value;
      });
      if (Object.keys(bodyObj).length === 0) {
        setError({ message: "Please provide at least one body field." });
        setIsLoading(false);
        return;
      }
      setRequestParams(flattenSchema(bodyObj));
    }

    // GET: handle request params from query
    if (method === "GET") {
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

    // Compose fetch URL
    const fetchUrl = method === "GET" ? buildUrlWithQuery() : endpointWithPathParams;

    // Compose body for fetch
    let fetchBody = undefined;
    if (["POST", "PUT", "PATCH"].includes(method)) {
      const bodyObj = {};
      bodyFields.forEach((p) => {
        if (p.name.trim() !== "") bodyObj[p.name] = p.value;
      });
      fetchBody = JSON.stringify(bodyObj);
    }

    try {
      const res = await fetch(fetchUrl, {
        method,
        headers: parsedHeaders,
        body: fetchBody,
      });
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }
      let responseText = await res.text();
      let json;
      try {
        json = JSON.parse(responseText);
        setError(null);
      } catch (e) {
        setError({ message: "Response is not valid JSON. See raw response below." });
        json = { raw: responseText };
      }

      setApiResponse(json);
      setResponseParams(flattenSchema(json));

      let baseUrl = endpointWithPathParams;
      let path = "";
      try {
        const urlObj = new URL(endpointWithPathParams);
        baseUrl = urlObj.origin;
        path = urlObj.pathname;
      } catch {
        const m = endpointWithPathParams.match(/(https?:\/\/[^/]+)(\/.*)/);
        if (m) {
          baseUrl = m[1];
          path = m[2];
        }
      }

      setData((d) => ({
        ...d,
        baseUrl,
        path,
        method,
        headers: parsedHeaders,
        requestBody: fetchBody,
        response: json,
      }));
    } catch (err) {
      setError({
        message: err.message || "",
        details: [
          "API endpoint is wrong",
          "JSON in headers or body is invalid",
          "CORS (the API blocks browser access)",
        ],
        suggestion:
          "Try Manual Entry mode if you are stuck, or use a mock API endpoint.",
      });
    } finally {
      setIsLoading(false);
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

  // Body fields table handlers
  const handleBodyFieldChange = (idx, field, value) => {
    setBodyFields((fields) =>
      fields.map((f, i) => (i === idx ? { ...f, [field]: value } : f))
    );
  };
  const handleAddBodyField = () => {
    setBodyFields((fields) => [...fields, { name: "", value: "" }]);
  };
  const handleRemoveBodyField = (idx) => {
    setBodyFields((fields) => fields.filter((_, i) => i !== idx));
  };


  // Path param values UI (auto-generated from endpoint)
  const pathParamsUI =
    (endpoint.match(/\{(\w+)\}/g) || []).map((m) => m.replace(/[{}]/g, ""));

  return (
    <div className="mb-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="auto-endpoint" className="font-medium">Endpoint</label>
        <input
          id="auto-endpoint"
          type="text"
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          className="border px-2 py-1 rounded text-black dark:text-white bg-white dark:bg-gray-800"
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
                  <input
                    aria-label={`${key} value`}
                    type="text"
                    value={pathParams[key] || ""}
                    onChange={(e) =>
                      setPathParams((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    className="border px-1 py-1 rounded text-black dark:text-white bg-white dark:bg-gray-800 w-24"
                    placeholder="value"
                  />
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Fill values for <code className="font-mono">{endpoint}</code>
            </div>
          </div>
        )}

        <label htmlFor="auto-method" className="font-medium">Method</label>
        <select
          id="auto-method"
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
                        aria-label="Query parameter name"
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
                        aria-label="Query parameter value"
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

        <label htmlFor="auto-headers" className="font-medium">Headers (JSON)</label>
        <textarea
          id="auto-headers"
          value={headers}
          onChange={(e) => setHeaders(e.target.value)}
          className="border px-2 py-1 rounded font-mono text-black dark:text-white bg-white dark:bg-gray-800"
          rows={2}
          placeholder='{"Content-Type": "application/json"}'
        />

        {(method === "POST" || method === "PUT" || method === "PATCH") && (
          <div className="mb-2">
            <label className="font-medium">Request Body</label>
            <table className="w-full border mb-2 text-xs mt-1">
              <thead>
                <tr>
                  <th className="border px-2 py-1">Field</th>
                  <th className="border px-2 py-1">Value</th>
                  <th className="border px-2 py-1"></th>
                </tr>
              </thead>
              <tbody>
                {bodyFields.map((field, idx) => (
                  <tr key={idx}>
                    <td className="border px-2 py-1">
                      <input
                        aria-label="Body field name"
                        type="text"
                        value={field.name}
                        onChange={(e) => handleBodyFieldChange(idx, "name", e.target.value)}
                        className="w-full border px-1 py-1 rounded text-black dark:text-white bg-white dark:bg-gray-800"
                        placeholder="key"
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <input
                        aria-label="Body field value"
                        type="text"
                        value={field.value}
                        onChange={(e) => handleBodyFieldChange(idx, "value", e.target.value)}
                        className="w-full border px-1 py-1 rounded text-black dark:text-white bg-white dark:bg-gray-800"
                        placeholder="value"
                      />
                    </td>
                    <td className="border px-2 py-1">
                      {bodyFields.length > 1 && (
                        <button
                          className="text-red-600 hover:text-red-800 text-xs px-1"
                          onClick={() => handleRemoveBodyField(idx)}
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
              onClick={handleAddBodyField}
              className="bg-gray-200 dark:bg-gray-700 text-xs px-2 py-1 rounded"
              type="button"
            >
              + Add Field
            </button>
          </div>
        )}

        <button
          onClick={handleAnalyze}
          className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
        >
          Submit &amp; Generate
        </button>
        {isLoading && <Spinner className="ml-2" />}
        {error && (
          <div className="text-red-600 mt-2">
            {typeof error === "string" ? (
              <span>{error}</span>
            ) : (
              <>
                {error.message && <p>{error.message}</p>}
                {error.details && (
                  <>
                    <p>Cannot fetch! This may be due to:</p>
                    <ul className="list-disc list-inside pl-4">
                      {error.details.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </>
                )}
                {error.suggestion && <p className="mt-2">{error.suggestion}</p>}
              </>
            )}
          </div>
        )}
        {apiResponse && (
          <div className="mt-4 bg-gray-100 dark:bg-gray-900 p-2 rounded font-mono text-xs overflow-x-auto">
            <b>Response:</b>
            <SyntaxHighlighter
              language="json"
              style={document.documentElement.classList.contains('dark') ? oneDark : oneLight}
              customStyle={{ background: 'transparent', fontSize: 'inherit', margin: 0 }}
            >
              {JSON.stringify(apiResponse, null, 2)}
            </SyntaxHighlighter>
          </div>
        )}
      </div>
    </div>
  );
}
