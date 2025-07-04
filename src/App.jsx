import React, { useState, useEffect } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import AutoAnalyzer from "./components/AutoAnalyzer";
import ManualDocEditor from "./components/ManualDocEditor";
import ParamsTable from "./components/ParamsTable";
import Toast from "./components/Toast";
import TryItLive from "./components/TryItLive";
import CodeSamples from "./components/CodeSamples";
import SwaggerExplorerView from "./components/SwaggerExplorerView";
import RequestSettings from "./components/RequestSettings";

export default function App() {
  // State for projects/endpoints and active endpoint
  const [projectEndpoints, setProjectEndpoints] = useState([]);
  const [activeEndpointIdx, setActiveEndpointIdx] = useState(0);

  // Single endpoint doc state
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
  const [rawBody, setRawBody] = useState("");
  const [toast, setToast] = useState("");
  const [showNotesPreview, setShowNotesPreview] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [mode, setMode] = useState("analyzer");
  const [versions, setVersions] = useState([]);
  const [authType, setAuthType] = useState("");
  const [authValue, setAuthValue] = useState("");
  const [explorerView, setExplorerView] = useState(false);

  // ---- Import Collection ----
  const handleImportCollection = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();

    let endpoints = [];
    try {
      const data = JSON.parse(text);
      if (data.openapi || data.swagger) {
        // OpenAPI
        for (const [path, methods] of Object.entries(data.paths)) {
          for (const [method, info] of Object.entries(methods)) {
            endpoints.push({
              method: method.toUpperCase(),
              path,
              summary: info.summary || "",
            });
          }
        }
      } else if (data.info && data.item) {
        // Postman
        data.item.forEach(item => {
          endpoints.push({
            method: item.request.method,
            path: item.request.url?.raw || "",
            summary: item.name,
          });
        });
      }
      setProjectEndpoints(endpoints);
      setActiveEndpointIdx(0);
      setToast("Imported collection!");
    } catch (err) {
      setToast("Failed to parse OpenAPI/Postman file");
    }
  };

  // Load endpoint details when active changes
  useEffect(() => {
    if (projectEndpoints.length && activeEndpointIdx >= 0) {
      const ep = projectEndpoints[activeEndpointIdx];
      setData((prev) => ({
        ...prev,
        method: ep.method,
        path: ep.path,
        meta: { ...prev.meta, title: ep.summary },
      }));
    }
    // eslint-disable-next-line
  }, [activeEndpointIdx, projectEndpoints]);

  // ---- Versioning ----
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

  // ---- Auth injection ----
  let actualHeaders = { ...data.headers };
  if (authType === "bearer" && authValue) actualHeaders["Authorization"] = "Bearer " + authValue;
  if (authType === "apikey-header" && authValue) actualHeaders["X-API-KEY"] = authValue;
  if (authType === "basic" && authValue) actualHeaders["Authorization"] = "Basic " + btoa(authValue);

  let actualEndpoint = data.baseUrl + (data.path || "");
  if (authType === "apikey-query" && authValue) {
    actualEndpoint += (actualEndpoint.includes("?") ? "&" : "?") + authValue;
  }

  // ---- Export Handlers ----
  const handleExportPDF = async () => setToast("Exported as PDF!");
  const handleExportMarkdown = () => setToast("Exported as Markdown!");
  const handleExportHTML = () => setToast("Exported as HTML!");
  const handleExportOpenAPI = () => setToast("Exported as OpenAPI Spec!");

  // ---- Export Dropdown UX ----
  useEffect(() => {
    if (!exportOpen) return;
    function handler(e) {
      if (!e.target.closest("#exportDropdown")) setExportOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [exportOpen]);

  // ---- Body Handling ----

  // Prepare request body from raw text
  const getRequestBody = () => {
    if (data.method === "GET" || !rawBody) return undefined;
    try {
      return JSON.parse(rawBody);
    } catch {
      return rawBody;
    }
  };

  // ---- UI Render ----
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans">
      {/* App header/toolbar (always visible) */}
      <header className="w-full flex flex-wrap items-center justify-between mb-6 px-2 py-4 bg-white/80 dark:bg-gray-900/80 shadow rounded-xl">
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold text-indigo-700 dark:text-indigo-300 tracking-tight">
            API Doc Builder
          </span>
          <label className="bg-blue-600 text-white px-3 py-2 rounded cursor-pointer font-semibold ml-2">
            Import OpenAPI / Postman
            <input type="file" accept=".json,.yaml,.yml" hidden onChange={handleImportCollection} />
          </label>
          <button
            className="ml-3 px-3 py-2 rounded bg-gray-600 text-white font-semibold"
            onClick={() => setExplorerView((v) => !v)}
          >
            {explorerView ? "Editor View" : "Explorer View"}
          </button>
        </div>
          {/* Export Dropdown */}
          <div className="relative" id="exportDropdown">
            <button
              className="ml-4 bg-indigo-600 text-white px-3 py-2 rounded"
              onClick={() => setExportOpen((v) => !v)}
            >
              Export Documentation ▼
            </button>
            {exportOpen && (
              <div className="absolute mt-1 bg-white dark:bg-gray-800 border rounded shadow-lg z-10 min-w-[180px]">
                <button
                  onClick={() => { handleExportPDF(); setExportOpen(false); }}
                  className="block w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  PDF
                </button>
                <button
                  onClick={() => { handleExportMarkdown(); setExportOpen(false); }}
                  className="block w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Markdown
                </button>
                <button
                  onClick={() => { handleExportHTML(); setExportOpen(false); }}
                  className="block w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  HTML
                </button>
                <button
                  onClick={() => { handleExportOpenAPI(); setExportOpen(false); }}
                  className="block w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  OpenAPI
                </button>
              </div>
            )}
          </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 px-2 flex">
        {/* Sidebar (only if endpoints imported) */}
        {projectEndpoints.length > 0 && (
          <div className="w-64 mr-8">
            <label className="block font-bold mb-2 text-xs">Endpoints</label>
            <ul>
              {projectEndpoints.map((ep, i) => (
                <li key={i}>
                  <button
                    className={`w-full text-left px-2 py-1 rounded ${activeEndpointIdx === i ? 'bg-indigo-100 dark:bg-indigo-900' : ''}`}
                    onClick={() => setActiveEndpointIdx(i)}
                  >
                    <span className="font-mono font-semibold">{ep.method}</span>
                    <span className="ml-2">{ep.path}</span>
                    {ep.summary && <span className="block text-xs text-gray-500">{ep.summary}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Main panel */}
        <div className="flex-1">
          {explorerView ? (
            <SwaggerExplorerView endpoints={projectEndpoints.length ? projectEndpoints : [{...data, ...data.meta, requestParams, responseParams}]} />
          ) : (
          <>
            {/* Mode Switch & Versioning */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <button
                onClick={handleSaveVersion}
                className="bg-green-600 text-white px-3 py-1 rounded font-semibold"
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
                    >
                      {ver.name}
                    </button>
                  ))}
                </div>
              )}
              <div className="ml-auto flex gap-2">
                <button
                  className={`px-4 py-2 rounded font-semibold ${mode === "analyzer" ? "bg-indigo-600 text-white" : "bg-gray-200 dark:bg-gray-700"}`}
                  onClick={() => setMode("analyzer")}
                >
                  Auto Analyzer
                </button>
                <button
                  className={`px-4 py-2 rounded font-semibold ${mode === "manual" ? "bg-indigo-600 text-white" : "bg-gray-200 dark:bg-gray-700"}`}
                  onClick={() => setMode("manual")}
                >
                  Manual Entry
                </button>
              </div>
            </div>
            {/* Main Editor */}
            <div className="grid md:grid-cols-2 gap-10">
              <div className="md:border-r md:pr-8">
                <RequestSettings
                  authType={authType}
                  setAuthType={setAuthType}
                  authValue={authValue}
                  setAuthValue={setAuthValue}
                  contentType={data.headers["Content-Type"] || ""}
                  setContentType={(val) =>
                    setData((d) => ({
                      ...d,
                      headers: { ...d.headers, "Content-Type": val },
                    }))
                  }
                />
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
                {/* Request Body */}
                <div className="mb-6">
                  {data.method !== "GET" && (
                    <textarea
                      className="w-full border px-2 py-2 rounded resize-y text-black dark:text-white bg-white dark:bg-gray-800"
                      rows={4}
                      placeholder="Request body (JSON or text)"
                      value={rawBody}
                      onChange={e => setRawBody(e.target.value)}
                    />
                  )}
                </div>
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
                          __html: DOMPurify.sanitize(
                            marked.parse(data.integrationNotes || "")
                          ),
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
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-4">
                  <h3 className="text-lg font-bold">
                    {data.meta?.title || "API Name"}
                  </h3>
                  <p className="text-sm mb-2 text-gray-700 dark:text-gray-300">
                    {data.meta?.description ||
                      "Enter your endpoint above or use Auto Analyzer."}
                  </p>
                  <div>
                    <span className="font-mono font-semibold bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                      {data.method}
                    </span>{" "}
                    <span className="font-mono text-sm break-all">
                      {actualEndpoint}
                    </span>
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
                            __html: DOMPurify.sanitize(
                              marked.parse(data.integrationNotes || "")
                            ),
                          }}
                        />
                      </div>
                    </div>
                  )}
                  <CodeSamples
                    endpoint={actualEndpoint}
                    method={data.method}
                    headers={actualHeaders}
                    params={requestParams.reduce((a, p) => (a[p.name]=p.example||"", a), {})}
                    body={getRequestBody()}
                    authType={authType}
                    authValue={authValue}
                  />
                </div>
                <TryItLive
                  data={data}
                  requestParams={requestParams}
                  responseParams={responseParams}
                  method={data.method}
                  headers={actualHeaders}
                  endpoint={actualEndpoint}
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
          </>
          )}
        </div>
      </div>
    </div>
  );
}
