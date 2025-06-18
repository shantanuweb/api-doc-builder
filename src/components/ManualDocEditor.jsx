import React from "react";
import ParamsTable from "./ParamsTable";
import IntegrationNotes from "./IntegrationNotes";

export default function ManualDocEditor({
  data,
  setData,
  requestParams,
  setRequestParams,
  responseParams,
  setResponseParams,
  integrationNotes,
  setIntegrationNotes,
}) {
  const handleDataChange = (key, value) =>
    setData((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="flex flex-col gap-2 mb-4">
      <label className="font-medium">Title</label>
      <input
        className="border rounded px-2 py-1"
        value={data.meta?.title || ""}
        onChange={(e) =>
          handleDataChange("meta", {
            ...(data.meta || {}),
            title: e.target.value,
            description: data.meta?.description || "",
          })
        }
      />

      <label className="font-medium">Description</label>
      <textarea
        className="border rounded px-2 py-1"
        value={data.meta?.description || ""}
        onChange={(e) =>
          handleDataChange("meta", {
            ...(data.meta || {}),
            title: data.meta?.title || "",
            description: e.target.value,
          })
        }
      />

      <label className="font-medium">Base URL</label>
      <input
        className="border rounded px-2 py-1"
        value={data.baseUrl || ""}
        onChange={(e) => handleDataChange("baseUrl", e.target.value)}
      />

      <label className="font-medium">Path</label>
      <input
        className="border rounded px-2 py-1"
        value={data.path || ""}
        onChange={(e) => handleDataChange("path", e.target.value)}
      />

      <label className="font-medium">Method</label>
      <select
        className="border rounded px-2 py-1"
        value={data.method || "GET"}
        onChange={(e) => handleDataChange("method", e.target.value)}
      >
        <option>GET</option>
        <option>POST</option>
        <option>PUT</option>
        <option>PATCH</option>
        <option>DELETE</option>
      </select>

      <label className="font-medium">Headers (JSON)</label>
      <textarea
        className="border rounded px-2 py-1 font-mono"
        value={JSON.stringify(data.headers || {}, null, 2)}
        onChange={(e) => {
          try {
            handleDataChange("headers", JSON.parse(e.target.value));
          } catch {
            /* do nothing */
          }
        }}
      />

      {(data.method === "POST" ||
        data.method === "PUT" ||
        data.method === "PATCH") && (
        <>
          <label className="font-medium">Body (JSON)</label>
          <textarea
            className="border rounded px-2 py-1 font-mono"
            value={JSON.stringify(data.requestBody || {}, null, 2)}
            onChange={(e) => {
              try {
                handleDataChange("requestBody", JSON.parse(e.target.value));
              } catch {
                /* do nothing */
              }
            }}
          />
        </>
      )}

      <ParamsTable
        title="Request Parameters"
        params={requestParams}
        setParams={setRequestParams}
        hasRequired={true}
      />
      <ParamsTable
        title="Response Parameters"
        params={responseParams}
        setParams={setResponseParams}
        hasRequired={false}
      />
      <IntegrationNotes notes={integrationNotes} setNotes={setIntegrationNotes} />
    </div>
  );
}
