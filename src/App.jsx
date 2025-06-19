import React, { useState } from "react";
import { marked } from "marked";
import AutoAnalyzer from "./components/AutoAnalyzer";
import ManualDocEditor from "./components/ManualDocEditor";
import ParamsTable from "./components/ParamsTable";
import Toast from "./components/Toast";

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

  // Example export handlers (replace with your actual logic)
  const handleExportPDF = async () => {
    setToast("Exported as PDF!");
  };
  const handleExportMarkdown = () => {
    setToast("Exported as Markdown!");
  };
  const handleExportHTML = () => {
    setToast("Exported as HTML!");
  };
  const handleExportOpenAPI = () => {
    setToast("Exported as OpenAPI Spec!");
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans">
      <div className="max-w-5xl mx-auto py-8 px-2">
        <h1 className="text-3xl font-extrabold mb-10 text-indigo-700 dark:text-indigo-300 tracking-tight">
          📘 API Documentation Builder
        </h1>

        {/* Empty State / Onboarding */}
        {!data.baseUrl && mode === "analyzer" && (
          <div className="mb-8 p-5 bg-indigo-50 dark:bg-gray-800 rounded shadow flex items-center gap-4">
            <span className="text-3xl">🚀</span>
            <div>
              <div className="font-bold mb-1">Get started!</div>
              <div>
                Paste your API endpoint above (e.g.{" "}
                <code className="font-mono">
                  https://jsonplaceholder.typicode.com/todos/1
                </code>
                ) and click <b>Submit &amp; Generate</b>.<br />
                Or switch to <b>Manual Entry</b> for full custom docs.
              </div>
              <button
                className="mt-2 bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700"
                onClick={() => {
                  setData({
                    ...data,
                    baseUrl: "https://jsonplaceholder.typicode.com",
                    path: "/todos/1",
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                  });
                }}
              >
                Try Sample API
              </button>
            </div>
          </div>
        )}

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

            <h2 className="font-semibold text-lg mb-2 text-indigo-700 dark:text-indigo-300 mt-8">
              Request Parameters
            </h2>
            <ParamsTable
              title=""
              params={requestParams}
              setParams={setRequestParams}
              hasRequired={true}
            />

            <h2 className="font-semibold text-lg mb-2 text-indigo-700 dark:text-indigo-300 mt-8">
              Response Parameters
            </h2>
            <ParamsTable
              title=""
              params={responseParams}
              setParams={setResponseParams}
              hasRequired={false}
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
            <div className="relative mb-4">
              <button className="bg-indigo-600 text-white px-3 py-2 rounded font-semibold">
                Export Documentation ▼
              </button>
              <div className="absolute mt-1 bg-white dark:bg-gray-800 border rounded shadow-lg z-10">
                <button
                  onClick={handleExportPDF}
                  className="block w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  PDF
                </button>
                <button
                  onClick={handleExportMarkdown}
                  className="block w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Markdown
                </button>
                <button
                  onClick={handleExportHTML}
                  className="block w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  HTML
                </button>
                <button
                  onClick={handleExportOpenAPI}
                  className="block w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  OpenAPI
                </button>
              </div>
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
                    {data.baseUrl}
                    {data.path}
                  </span>
                </div>
              </div>
              {/* Preview Params */}
              {requestParams.length > 0 && (
                <>
                  <h4 className="font-semibold mt-4">Request Params</h4>
                  <table className="w-full border text-xs">
                    <thead>
                      <tr>
                        <th className="border px-2 py-1">Name</th>
                        <th className="border px-2 py-1">Type</th>
                        <th className="border px-2 py-1">Required</th>
                        <th className="border px-2 py-1">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requestParams.map((p, i) => (
                        <tr key={i}>
                          <td className="border px-2 py-1">{p.name}</td>
                          <td className="border px-2 py-1">{p.type}</td>
                          <td className="border px-2 py-1 text-center">
                            {p.required ? "Yes" : "No"}
                          </td>
                          <td className="border px-2 py-1">{p.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
              {responseParams.length > 0 && (
                <>
                  <h4 className="font-semibold mt-4">Response Params</h4>
                  <table className="w-full border text-xs">
                    <thead>
                      <tr>
                        <th className="border px-2 py-1">Name</th>
                        <th className="border px-2 py-1">Type</th>
                        <th className="border px-2 py-1">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {responseParams.map((p, i) => (
                        <tr key={i}>
                          <td className="border px-2 py-1">{p.name}</td>
                          <td className="border px-2 py-1">{p.type}</td>
                          <td className="border px-2 py-1">{p.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
              {/* Integration Notes Preview */}
              {data.integrationNotes && (
                <div>
                  <h4 className="font-semibold mt-4">Integration Notes</h4>
                  <pre className="bg-gray-100 dark:bg-gray-900 p-2 rounded text-xs whitespace-pre-wrap">
                    {data.integrationNotes}
                  </pre>
                </div>
              )}
            </div>
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
