import React from "react";

export default function PDFExport({
  data,
  requestParams,
  responseParams,
  integrationNotes,
}) {
  const handleExport = async () => {
    // Dynamic import to avoid issues
    const html2pdf = (await import("html2pdf.js")).default;
    const element = document.createElement("div");
    element.innerHTML = `
      <h1>${data.meta?.title || "API Documentation"}</h1>
      <p><b>Description:</b> ${data.meta?.description || ""}</p>
      <p><b>Endpoint:</b> ${data.method || "GET"} ${data.baseUrl || ""}${
      data.path || ""
    }</p>
      <h2>Request Parameters</h2>
      <table border="1" cellspacing="0" cellpadding="2">
        <tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr>
        ${
          requestParams.length
            ? requestParams
                .map(
                  (p) =>
                    `<tr><td>${p.name}</td><td>${p.type}</td><td>${
                      p.required ? "Yes" : "No"
                    }</td><td>${p.description}</td></tr>`
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
    html2pdf().from(element).save(
      `${(data.meta?.title || "api-doc").replace(/\s+/g, "_")}.pdf`
    );
  };

  return (
    <button
      onClick={handleExport}
      className="bg-red-600 text-white px-4 py-2 rounded transition-colors duration-200 hover:bg-red-700"
    >
      📄 Export PDF
    </button>
  );
}
