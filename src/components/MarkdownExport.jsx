import React from "react";

export default function MarkdownExport({
  data,
  requestParams,
  responseParams,
  integrationNotes,
}) {
  function generateMarkdown() {
    let md = `# ${data.meta?.title || "API Documentation"}\n\n`;
    md += `**Description:** ${data.meta?.description || ""}\n\n`;
    md += `**Endpoint:** \`${data.method || "GET"} ${data.baseUrl || ""}${
      data.path || ""
    }\`\n\n`;
    md += `## Request Parameters\n`;
    if (requestParams.length) {
      md += "| Name | Type | Required | Description |\n|---|---|:---:|---|\n";
      requestParams.forEach((p) => {
        md += `| ${p.name} | ${p.type} | ${p.required ? "Yes" : "No"} | ${
          p.description
        } |\n`;
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
    return md;
  }

  const handleExport = () => {
    const blob = new Blob([generateMarkdown()], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(data.meta?.title || "api-doc").replace(
      /\s+/g,
      "_"
    )}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="bg-gray-700 text-white px-4 py-2 rounded transition-colors duration-200 hover:bg-gray-800"
    >
      ⬇️ Export Markdown
    </button>
  );
}
