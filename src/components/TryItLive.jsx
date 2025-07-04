import React, { useState } from "react";

// Generate a mock response from documented responseParams (array of {name,type})
function mockResponseFromParams(params) {
  const valByType = (type) => {
    switch (type) {
      case "integer": return 123;
      case "float": return 3.14;
      case "boolean": return true;
      case "array": return [];
      case "object": return {};
      case "string":
      default: return "string";
    }
  };
  const result = {};
  params.forEach((p) => {
    if (p.name) result[p.name] = valByType(p.type);
  });
  return result;
}

export default function TryItLive({
  data,
  requestParams,
  responseParams,
  method,
  headers,
  endpoint,
  bodyType,
}) {
  const [useMock, setUseMock] = useState(false);
  const [reqInput, setReqInput] = useState({});
  const [liveResponse, setLiveResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Compose endpoint with path/query
  let liveEndpoint = endpoint;
  const pathKeys = (endpoint.match(/\{(\w+)\}/g) || []).map((m) =>
    m.replace(/[{}]/g, "")
  );
  liveEndpoint = liveEndpoint.replace(/\{(\w+)\}/g, (_, k) =>
    reqInput[k] !== undefined ? encodeURIComponent(reqInput[k]) : `{${k}}`
  );

  if (method === "GET") {
    const queryPairs = requestParams
      .filter((p) => !pathKeys.includes(p.name))
      .map((p) => [p.name, reqInput[p.name]])
      .filter(([, v]) => v !== undefined && v !== "");

    if (queryPairs.length) {
      const qs = queryPairs
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join("&");
      liveEndpoint += (liveEndpoint.includes("?") ? "&" : "?") + qs;
    }
  }

  const handleSend = async () => {
    setIsLoading(true);
    setError("");
    setLiveResponse("");

    if (useMock) {
      // Simulate mock response based on schema
      setTimeout(() => {
        setLiveResponse(JSON.stringify(mockResponseFromParams(responseParams), null, 2));
        setIsLoading(false);
      }, 500);
      return;
    }

    try {
      const res = await fetch(liveEndpoint, {
        method,
        headers,
        body: method === "GET" ? undefined :
          bodyType === "form" ? new URLSearchParams(reqInput).toString() : JSON.stringify(reqInput),
      });
      let responseText = await res.text();
      setLiveResponse(responseText);
      setIsLoading(false);
    } catch (e) {
      setError("Request failed: " + e.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="my-6 p-4 bg-indigo-50 dark:bg-gray-900 rounded-xl shadow">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-indigo-700 dark:text-indigo-300 text-lg">
          Try It Live
        </h4>
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={useMock}
            onChange={() => setUseMock((v) => !v)}
            className="accent-indigo-600"
          />
          Use Mock Server
        </label>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        {useMock
          ? "Responses are simulated from your schema—great for demo/testing!"
          : "Live request will be sent to the documented endpoint."}
      </div>
      {/* Editable Request Input */}
      <div className="mb-3">
        {requestParams.length > 0 && (
          <table className="w-full border mb-2 text-xs">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="border px-2 py-1">Param</th>
                <th className="border px-2 py-1">Value</th>
              </tr>
            </thead>
            <tbody>
              {requestParams.map((p, i) => (
                <tr key={i}>
                  <td className="border px-2 py-1">{p.name}</td>
                  <td className="border px-2 py-1">
                    <input
                      className="w-full border px-1 py-1 rounded"
                      value={reqInput[p.name] ?? ""}
                      onChange={(e) =>
                        setReqInput((input) => ({
                          ...input,
                          [p.name]: e.target.value,
                        }))
                      }
                      placeholder={p.example || ""}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <button
        className="bg-indigo-600 text-white px-4 py-2 rounded font-semibold"
        disabled={isLoading}
        onClick={handleSend}
      >
        {isLoading ? "Sending..." : useMock ? "Simulate" : "Send Request"}
      </button>
      {error && <div className="text-red-600 mt-2">{error}</div>}
      {liveResponse && (
        <div className="mt-4">
          <div className="font-semibold mb-1 text-xs">Response:</div>
          <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs overflow-x-auto">
            {liveResponse}
          </pre>
        </div>
      )}
    </div>
  );
}
