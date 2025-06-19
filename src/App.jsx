import React, { useState } from "react";
import { marked } from "marked";
import AutoAnalyzer from "./components/AutoAnalyzer";
import ManualDocEditor from "./components/ManualDocEditor";
import ParamsTable from "./components/ParamsTable";
import Toast from "./components/Toast";
import TryItLive from "./components/TryItLive";

export default function App() {
  const [mode, setMode] = useState("analyzer");
  const [data, setData] = useState({
    baseUrl: "",
    path: "",
    method: "GET",
    headers: { "Content-Type": "application/json" },
    requestBody: {},
    response: {},
    meta: { title: "", description: "" },
    integrationNotes: "",
  });
  const [requestParams, setRequestParams] = useState([]);
  const [responseParams, setResponseParams] = useState([]);
  const [toast, setToast] = useState("");
  const [showNotesPreview, setShowNotesPreview] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  // Versioning
  const [versions, setVersions] = useState([]);

  // Auth
  const [authType, setAuthType] = useState("");
  const [authValue, setAuthValue] = useState("");

  React.useEffect(() => {
    if (!exportOpen) return;
    function handler(e) {
      if (!e.target.closest("#exportDropdown")) setExportOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [exportOpen]);

  // Handle Export
  const handleExportPDF = async () => setToast("Exported as PDF!");
  const handleExportMarkdown = () => setToast("Exported as Markdown!");
  const handleExportHTML = () => setToast("Exported as HTML!");
  const handleExportOpenAPI = () => setToast("Exported as OpenAPI Spec!");

  // Versioning logic
  const handleSaveVersion = () => {
    const name = prompt("Version name (e.g. v1.1, 'Initial Draft', etc):") || `v${versions.length + 1}`;
    setVersions([
      { 
        name, 
        timestamp: new Date().toLocaleString(), 
        doc: JSON.parse(JSON.stringify({ data, requestParams, responseParams })) 
      },
      ...versions,
    ]);
    setToast(`Saved version: ${name}`);
  };
  const handleRestoreVersion = (ver) => {
    setData(ver.doc.data);
    setRequestParams(ver.doc.requestParams);
    setResponseParams(ver.doc.responseParams);
    setToast(`Restored version: ${ver.name}`);
  };

  // Auth: inject into headers or endpoint as needed
  let actualHeaders = { ...data.headers };
  if (authType === "bearer" && authValue) actualHeaders["Authorization"] = "Bearer " + authValue;
  if (authType === "apikey-header" && authValue) actualHeaders["X-API-KEY"] = authValue;
  if (authType === "basic" && authValue) actualHeaders["Authorization"] = "Basic " + btoa(authValue);

  let actualEndpoint = data.baseUrl + (data.path || "");
  if (authType === "apikey-query" && authValue) {
    actualEndpoint += (actualEndpoint.includes("?") ? "&" : "?") + authValue;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans">
      <div className="max-w-5xl mx-auto py-8 px-2">
        <h1 className="text-3xl font-extrabold mb-10 text-indigo-700 dark:text-indigo-300 tracking-tight">
          📘 API Documentation Builder
        </h1>
        {/* Versioning & Auth */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <button
            onClick={handleSaveVersion}
            className="bg-green-600 text-white px-3 py-1 rounded font-semibold"
            title="Save current doc as a version"
          >
            Save Version
          </button>
          {versions.length > 0 && (
            <div className="ml-2">
              <span className="text-xs font-bold text-gray-500 mr-2">Versions:</span>
              {versions.map((ver, i) => (
                <button
                  key={i}
                  className="bg-gray-200 dark:bg-gray-700 rounded px-2 py-1 text-xs mx-1"
                  onClick={() => handleRestoreVersion(ver)}
                  title={`Restore: ${ver.name} (${ver.timestamp})`}
                >
                  {ver.name}
                </button>
              ))}
            </div>
          )}
          {/* Auth UI */}
          <div className="ml-auto flex items-center gap-2">
            <span className="font-semibold">Auth:</span>
            <select
              className="border rounded px-2 py-1 bg-white dark:bg-gray-800"
              value={authType}
              onChange={e => {
                setAuthType(e.target.value);
                setAuthValue("");
              }}
            >
              <option value="">None</option>
              <option value="bearer">Bearer Token</option>
              <option value="apikey-header">API Key (Header)</option>
              <option value="apikey-query">API Key (Query)</option>
              <option value="basic">Basic Auth</option>
            </select>
            {authType === "bearer" && (
              <input
                className="border rounded px-2 py-1 w-40"
                value={authValue}
                onChange={e => setAuthValue(e.target.value)}
                placeholder="Token..."
              />
            )}
            {authType === "apikey-header" && (
              <input
                className="border rounded px-2 py-1 w-28"
                value={authValue}
                onChange={e => setAuthValue(e.target.value)}
                placeholder="X-API-KEY..."
              />
            )}
            {authType === "apikey-query" && (
              <input
                className="border rounded px-2 py-1 w-28"
                value={authValue}
                onChange={e => setAuthValue(e.target.value)}
                placeholder="api_key=..."
              />
            )}
            {authType === "basic" && (
              <input
                className="border rounded px-2 py-1 w-20"
                value={authValue}
                onChange={e => setAuthValue(e.target.value)}
                placeholder="user:pass"
              />
            )}
          </div>
        </div>
        {/* Mode Switch */}
        <div className="mb-6 flex gap-4">
          <button
            className={`px-4 py-2 rounded font-semibold ${
              mode === "analyzer"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 dark:bg-gray-700"
            }`}
            onClick={() => setMode("analyzer")}
          >
            Auto Analyzer
          </button>
          <button
            className={`px-4 py-2 rounded font-semibold ${
              mode === "manual"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 dark:bg-gray-700"
            }`}
            onClick={() => setMode("manual")}
          >
            Manual Entry
          </button>
        </div>
        {/* Main Editor */}
        <div className="grid md:grid-cols-2 gap-10">
          <div className="md:border-r md:pr-8">
            {mode === "analyzer" ? (
              <AutoAnalyzer
                setData={setData}
                setRequestParams={setRequestParams}
                setResponseParams={setResponseParams}
                headers={actualHeaders}
                endpoint={actualEndpoint}
              />
            ) : (
              <ManualDocEditor
                data={data}
                setData={setData}
                requestParams={requestParams}
                setRequestParams={setRequestParams}
                responseParams={responseParams}
                setResponseParams={setResponseParams}
              />
            )}
            <ParamsTable
              title="Request Parameters"
              params={requestParams}
              setParams={setRequestParams}
              hasRequired={true}
              editable={true}
            />
            <ParamsTable
              title="Response Parameters"
              params={responseParams}
              setParams={setResponseParams}
              hasRequired={false}
              editable={true}
            />
            {/* Integration notes */}
            <div className="mb-8 mt-8">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-lg mb-0 text-indigo-700 dark:text-indigo-300">
                  Integration Notes
                </h2>
                <button
                  className="text-xs text-indigo-600 underline px-2 py-1"
                  onClick={() => setShowNotesPreview((v) => !v)}
                >
                  {showNotesPreview ? "Edit" : "Preview"}
                </button>
              </div>
              {showNotesPreview ? (
                <div className="prose prose-sm dark:prose-invert bg-gray-50 dark:bg-gray-900 rounded p-3 overflow-auto min-h-[6rem]">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: marked.parse(data.integrationNotes || ""),
                    }}
                  />
                </div>
              ) : (
                <textarea
                  className="w-full border px-2 py-2 rounded resize-y text-black dark:text-white bg-white dark:bg-gray-800"
                  rows={4}
                  value={data.integrationNotes || ""}
                  onChange={(e) =>
                    setData((d) => ({
                      ...d,
                      integrationNotes: e.target.value,
                    }))
                  }
                  placeholder="E.g. authentication steps, error codes, usage tips… (Markdown supported)"
                />
              )}
              <div className="text-xs text-gray-500 mt-1">
                Supports{" "}
                <a
                  href="https://www.markdownguide.org/cheat-sheet/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Markdown
                </a>
              </div>
            </div>
          </div>
          {/* Live Preview and Export */}
          <div>
            <h2 className="font-semibold text-xl mb-4 text-indigo-700 dark:text-indigo-300">
              API Documentation Preview
            </h2>
            {/* Export dropdown */}
            <div className="relative mb-4" id="exportDropdown">
              <button
                className="bg-indigo-600 text-white px-3 py-2 rounded font-semibold"
                onClick={() => setExportOpen((v) => !v)}
              >
                Export Documentation ▼
              </button>
              {exportOpen && (
                <div className="absolute mt-1 bg-white dark:bg-gray-800 border rounded shadow-lg z-10 min-w-[180px]">
                  <button
                    onClick={() => {
                      handleExportPDF();
                      setExportOpen(false);
                    }}
                    className="block w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => {
                      handleExportMarkdown();
                      setExportOpen(false);
                    }}
                    className="block w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Markdown
                  </button>
                  <button
                    onClick={() => {
                      handleExportHTML();
                      setExportOpen(false);
                    }}
                    className="block w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    HTML
                  </button>
                  <button
                    onClick={() => {
                      handleExportOpenAPI();
                      setExportOpen(false);
                    }}
                    className="block w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    OpenAPI
                  </button>
                </div>
              )}
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-4">
              {/* LIVE PREVIEW */}
              <h3 className="text-lg font-bold">
                {data.meta?.title || "API Name"}
              </h3>
              <p className="text-sm mb-2 text-gray-700 dark:text-gray-300">
                {data.meta?.description ||
                  "Enter your endpoint above or use Auto Analyzer."}
              </p>
              <div>
                <div>
                  <span className="font-mono font-semibold bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                    {data.method}
                  </span>{" "}
                  <span className="font-mono text-sm break-all">
                    {actualEndpoint}
                  </span>
                </div>
                {/* Show active version if any */}
                {versions.length > 0 && (
                  <div className="text-xs mt-1">
                    <span className="bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded">
                      Current Version: {versions[0].name}
                    </span>
                  </div>
                )}
              </div>
              <ParamsTable
                title="Request Parameters"
                params={requestParams}
                hasRequired={true}
                editable={false}
              />
              <ParamsTable
                title="Response Parameters"
                params={responseParams}
                hasRequired={false}
                editable={false}
              />
              {data.integrationNotes && (
                <div>
                  <h4 className="font-semibold mt-4">Integration Notes</h4>
                  <div className="prose prose-sm dark:prose-invert bg-gray-100 dark:bg-gray-900 p-2 rounded">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: marked.parse(data.integrationNotes || ""),
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            {/* Try It Live section */}
            <TryItLive
              data={data}
              requestParams={requestParams}
              responseParams={responseParams}
              method={data.method}
              headers={actualHeaders}
              endpoint={actualEndpoint}
              bodyType={data.bodyType}
            />
          </div>
        </div>
        <Toast message={toast} onClose={() => setToast("")} />
        <footer className="text-center text-xs text-gray-400 mt-12 pt-8">
          Built by{" "}
          <a href="https://github.com/shantanuweb" className="underline">
            Shantanu Kaushik
          </a>{" "}
          • MIT Licensed
        </footer>
      </div>
    </div>
  );
}
