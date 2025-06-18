import React, { useState } from "react";

function generateCode(data, lang) {
  const params = data.queryParams || {};
  const queryString = Object.keys(params).length
    ? "?" +
      Object.entries(params)
        .map(
          ([k, v]) =>
            `${encodeURIComponent(k)}=${encodeURIComponent(v)}`
        )
        .join("&")
    : "";
  const url = `${data.baseUrl || ""}${data.path || ""}${queryString}`;
  const headers = data.headers || {};
  const headerLines = Object.entries(headers)
    .map(([k, v]) => `-H "${k}: ${v}"`)
    .join(" ");
  const body = data.requestBody
    ? JSON.stringify(data.requestBody, null, 2)
    : "";

  switch (lang) {
    case "curl":
      return `curl -X ${data.method || "GET"} "${url}" ${headerLines} ${
        data.method !== "GET" ? `-d '${body}'` : ""
      }`.trim();
    case "fetch":
      return `fetch("${url}", {
  method: "${data.method || "GET"}",
  headers: {
${Object.entries(headers)
  .map(([k, v]) => `    "${k}": "${v}"`)
  .join(",\n")}
  },${
    data.method !== "GET" ? `\n  body: JSON.stringify(${body})` : ""
  }
})
  .then(res => res.json())
  .then(data => console.log(data));
`;
    case "python":
      return `import requests

response = requests.request(
    method="${data.method || "GET"}",
    url="${url}",
    headers={
${Object.entries(headers)
  .map(([k, v]) => `    "${k}": "${v}"`)
  .join(",\n")}
    },${
      data.method !== "GET" ? `\n    json=${body},` : ""
    }
)

print(response.json())`;
    case "okhttp":
      return `OkHttpClient client = new OkHttpClient();

Request request = new Request.Builder()
    .url("${url}")
    .method("${data.method || "GET"}", 
      ${
        data.method !== "GET"
          ? `RequestBody.create("${body}", MediaType.get("application/json"))`
          : "null"
      }
    )
${Object.entries(headers)
  .map(([k, v]) => `    .addHeader("${k}", "${v}")`)
  .join("\n")}
    .build();

Response response = client.newCall(request).execute();
System.out.println(response.body().string());
`;
    default:
      return "";
  }
}

export default function CodeSnippet({ data }) {
  const [lang, setLang] = useState("curl");
  const code = generateCode(data, lang);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    alert("Copied to clipboard!");
  };

  return (
    <div className="mt-6">
      <label className="block font-medium text-sm mb-1">💻 Code Snippet</label>
      <div className="flex gap-2 mb-2">
        {["curl", "fetch", "python", "okhttp"].map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`px-3 py-1 rounded text-sm ${
              lang === l
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 dark:bg-gray-700"
            } transition-colors duration-200 hover:bg-indigo-100`}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>
      <pre className="p-2 bg-gray-100 dark:bg-gray-800 rounded font-mono text-sm overflow-auto">
        {code}
      </pre>
      <button
        onClick={copyToClipboard}
        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded transition-colors duration-200 hover:bg-blue-700"
      >
        Copy Snippet
      </button>
    </div>
  );
}
