import React, { useState } from "react";
import AutoAnalyzer from "./components/AutoAnalyzer";
import ManualDocEditor from "./components/ManualDocEditor";
import ParamsTable from "./components/ParamsTable";
import IntegrationNotes from "./components/IntegrationNotes";
import CodeSnippet from "./components/CodeSnippet";
import MockServerConfig from "./components/MockServerConfig";
import ExportDropdown from "./components/ExportDropdown"; // ← Add this

export default function App() {
  const [mode, setMode] = useState("analyzer");
  const [data, setData] = useState({
    meta: {
      title: "User Login API",
      description: "Authenticate a user and receive a JWT access token.",
    },
    baseUrl: "https://api.example.com",
    path: "/auth/login",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    requestBody: { username: "demo@example.com", password: "your_password" },
    response: { token: "JWT_TOKEN", expires: "2025-12-31T23:59:59Z" },
  });
  const [requestParams, setRequestParams] = useState([
    {
      name: "username",
      type: "string",
      required: true,
      description: "The user's email address.",
    },
    {
      name: "password",
      type: "string",
      required: true,
      description: "The user's password.",
    },
  ]);
  const [responseParams, setResponseParams] = useState([
    {
      name: "token",
      type: "string",
      description: "JWT token for authenticating subsequent requests.",
    },
    {
      name: "expires",
      type: "string",
      description: "Expiration date and time for the token.",
    },
  ]);
  const [integrationNotes, setIntegrationNotes] = useState(
    "• Always use HTTPS when calling this endpoint.\n• Store the token securely on the client.\n• The token expires after 24 hours; use the refresh endpoint to obtain a new token."
  );

  // ---- Export Handlers ----

  // Markdown
  const handleExportMarkdown = () => {
    let md = `# ${data.meta?.title || "API Documentation"}\n\n`;
    md += `**Description:** ${data.meta?.description || ""}\n\n`;
    md += `**Endpoint:** \`${data.method || "GET"} ${data.baseUrl || ""}${data.path || ""}\`\n\n`;
    md += `## Request Parameters\n`;
    if (requestParams.length) {
      md += "| Name | Type | Required | Description |\n|---|---|:---:|---|\n";
      requestParams.forEach((p) => {
        md += `| ${p.name} | ${p.type} | ${p.required ? "Yes" : "No"} | ${p.description} |\n`;
      });
    } else {
      md += "_None_\n";
    }
    md += `\n## Response Parameters\n`;
    if (responseParams.length) {
      md += "| Name | Type | Description |\n|---|---|---|\n";
      responseParams.forEach((p) => {
        md += `| ${p.name} | ${p.type} | ${p.description} |\n`;
      });
    } else {
      md += "_None_\n";
    }
    md += `\n## Integration Notes\n${integrationNotes || "_None_"}\n`;
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(data.meta?.title || "api-doc").replace(/\s+/g, "_")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // PDF
  const handleExportPDF = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    const element = document.createElement("div");
    element.innerHTML = `
      <h1>${data.meta?.title || "API Documentation"}</h1>
      <p><b>Description:</b> ${data.meta?.description || ""}</p>
      <p><b>Endpoint:</b> ${data.method || "GET"} ${data.baseUrl || ""}${data.path || ""}</p>
      <h2>Request Parameters</h2>
      <table border="1" cellspacing="0" cellpadding="2">
        <tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr>
        ${
          requestParams.length
            ? requestParams
                .map(
                  (p) =>
                    `<tr><td>${p.name}</td><td>${p.type}</td><td>${p.required ? "Yes" : "No"}</td><td>${p.description}</td></tr>`
                )
                .join("")
            : '<tr><td colspan="4">None</td></tr>'
        }
      </table>
      <h2>Response Parameters</h2>
      <table border="1" cellspacing="0" cellpadding="2">
        <tr><th>Name</th><th>Type</th><th>Description</th></tr>
        ${
          responseParams.length
            ? responseParams
                .map(
                  (p) =>
                    `<tr><td>${p.name}</td><td>${p.type}</td><td>${p.description}</td></tr>`
                )
                .join("")
            : '<tr><td colspan="3">None</td></tr>'
        }
      </table>
      <h2>Integration Notes</h2>
      <pre>${integrationNotes || "None"}</pre>
    `;
    html2pdf().from(element).save(`${(data.meta?.title || "api-doc").replace(/\s+/g, "_")}.pdf`);
  };

  // OpenAPI
  const handleExportOpenAPI = () => {
    const openapi = {
      openapi: "3.0.0",
      info: {
        title: data.meta?.title || "API Documentation",
        description: data.meta?.description || "",
        version: "1.0.0",
      },
      paths: {
        [`${data.path || "/endpoint"}`]: {
          [data.method?.toLowerCase() || "get"]: {
            summary: data.meta?.title || "",
            description: data.meta?.description || "",
            parameters: [],
            responses: {
              200: {
                description: "Successful response",
              },
            },
          },
        },
      },
    };
    const blob = new Blob([JSON.stringify(openapi, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "openapi.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // HTML
  const handleExportHTML = () => {
    const html = `
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${data.meta?.title || "API Documentation"}</title>
      </head>
      <body>
        <h1>${data.meta?.title || "API Documentation"}</h1>
        <p><b>Description:</b> ${data.meta?.description || ""}</p>
        <p><b>Endpoint:</b> ${data.method || "GET"} ${data.baseUrl || ""}${data.path || ""}</p>
        <h2>Request Parameters</h2>
        <table border="1" cellspacing="0" cellpadding="2">
          <tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr>
          ${
            requestParams.length
              ? requestParams
                  .map(
                    (p) =>
                      `<tr><td>${p.name}</td><td>${p.type}</td><td>${p.required ? "Yes" : "No"}</td><td>${p.description}</td></tr>`
                  )
                  .join("")
              : '<tr><td colspan="4">None</td></tr>'
          }
        </table>
        <h2>Response Parameters</h2>
        <table border="1" cellspacing="0" cellpadding="2">
          <tr><th>Name</th><th>Type</th><th>Description</th></tr>
          ${
            responseParams.length
              ? responseParams
                  .map(
                    (p) =>
                      `<tr><td>${p.name}</td><td>${p.type}</td><td>${p.description}</td></tr>`
                  )
                  .join("")
              : '<tr><td colspan="3">None</td></tr>'
          }
        </table>
        <h2>Integration Notes</h2>
        <pre>${integrationNotes || "None"}</pre>
      </body>
      </html>
    `;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(data.meta?.title || "api-doc").replace(/\s+/g, "_")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---- Preview Table Helper ----
  function ParamsPreviewTable({ title, params, hasRequired }) {
    if (!params.length) return null;
    return (
      <div className="mb-4">
        <h3 className="font-bold text-md mb-1">{title}</h3>
        <table className="w-full border mb-2 text-xs">
          <thead>
            <tr>
              <th className="border px-2 py-1">Name</th>
              <th className="border px-2 py-1">Type</th>
              {hasRequired && <th className="border px-2 py-1">Required</th>}
              <th className="border px-2 py-1">Description</th>
            </tr>
          </thead>
          <tbody>
            {params.map((row, idx) => (
              <tr key={idx}>
                <td className="border px-2 py-1">{row.name}</td>
                <td className="border px-2 py-1">{row.type}</td>
                {hasRequired && (
                  <td className="border px-2 py-1">
                    {row.required ? "Yes" : "No"}
                  </td>
                )}
                <td className="border px-2 py-1">{row.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // ---- Render ----
  return (
    <div className="min-h-screen p-6 dark:bg-gray-900 bg-gray-50 dark:text-white text-black transition">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        📘 API Documentation Builder
      </h1>
      <div className="mb-4 flex gap-2">
        <button
          className={`px-4 py-2 rounded ${mode === "analyzer" ? "bg-indigo-600 text-white" : "bg-gray-200 dark:bg-gray-700"}`}
          onClick={() => setMode("analyzer")}
        >
          🔍 Analyze Endpoint
        </button>
        <button
          className={`px-4 py-2 rounded ${mode === "manual" ? "bg-indigo-600 text-white" : "bg-gray-200 dark:bg-gray-700"}`}
          onClick={() => setMode("manual")}
        >
          ✍️ Manual Entry
        </button>
      </div>

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          {mode === "analyzer" ? (
            <AutoAnalyzer setData={setData} />
          ) : (
            <ManualDocEditor
              data={data}
              setData={setData}
              requestParams={requestParams}
              setRequestParams={setRequestParams}
              responseParams={responseParams}
              setResponseParams={setResponseParams}
              integrationNotes={integrationNotes}
              setIntegrationNotes={setIntegrationNotes}
            />
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

          <IntegrationNotes
            notes={integrationNotes}
            setNotes={setIntegrationNotes}
          />
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
                📄 Live Preview
              </h2>
              <ExportDropdown
                onMarkdown={handleExportMarkdown}
                onPDF={handleExportPDF}
                onOpenAPI={handleExportOpenAPI}
                onHTML={handleExportHTML}
              />
            </div>
            <div className="p-4 rounded bg-gray-50 dark:bg-gray-900 shadow text-sm overflow-auto">
              <div>
                <b>Heading:</b> {data.meta?.title || "API Documentation"}
              </div>
              <div>
                <b>Description:</b> {data.meta?.description || ""}
              </div>
              <div>
                <b>Endpoint:</b> {data.method || "GET"} {data.baseUrl}
                {data.path}
              </div>
              <ParamsPreviewTable
                title="Request Parameters"
                params={requestParams}
                hasRequired={true}
              />
              <ParamsPreviewTable
                title="Response Parameters"
                params={responseParams}
                hasRequired={false}
              />
              <div className="mt-4">
                <b>Integration Notes:</b>{" "}
                <div>{integrationNotes || <em>None</em>}</div>
              </div>
            </div>

            <CodeSnippet data={data} />
            <MockServerConfig data={data} />
          </div>
        </div>
      </div>

      <footer className="text-center text-sm text-gray-500 mt-12 border-t pt-6">
        Built by{" "}
        <a
          href="https://github.com/shantanuweb"
          className="underline hover:text-gray-700"
        >
          Shantanu Kaushik
        </a>{" "}
        • MIT Licensed
      </footer>
    </div>
  );
}
