import React, { useState } from "react";

function makeCode({ endpoint, method, headers, params, body, authType, authValue }) {
  let headerLines = Object.entries(headers || {})
    .map(([k, v]) => `-H "${k}: ${v}"`)
    .join(" ");

  let url = endpoint;
  if (method === "GET" && params && Object.keys(params).length > 0) {
    url += "?" + Object.entries(params).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&");
  }

  let curl = `curl -X ${method} "${url}" ${headerLines}`;
  if (method !== "GET" && body) curl += ` -d '${JSON.stringify(body, null, 2)}'`;

  let fetchCode = `fetch("${url}", {
  method: "${method}",
  headers: ${JSON.stringify(headers, null, 2)},${method !== "GET" && body ? `\n  body: JSON.stringify(${JSON.stringify(body, null, 2)})` : ""}
})
  .then(res => res.json())
  .then(console.log);`;

  let pyLines = [
    "import requests",
    `url = "${url}"`,
    `headers = ${JSON.stringify(headers, null, 2)}`
  ];
  if (method === "GET") {
    pyLines.push("response = requests.get(url, headers=headers)");
  } else {
    pyLines.push(`data = ${JSON.stringify(body || {}, null, 2)}`);
    pyLines.push(`response = requests.${method.toLowerCase()}(url, headers=headers, json=data)`);
  }
  pyLines.push("print(response.json())");
  let python = pyLines.join("\n");

  return { curl, fetch: fetchCode, python };
}

const LANGUAGES = [
  { key: "curl", label: "cURL" },
  { key: "fetch", label: "Fetch (JS)" },
  { key: "python", label: "Python" },
];

export default function CodeSamples({ endpoint, method, headers, params, body, authType, authValue }) {
  const [lang, setLang] = useState("curl");

  const codes = makeCode({ endpoint, method, headers, params, body, authType, authValue });

  function handleCopy() {
    navigator.clipboard.writeText(codes[lang]);
  }

  return (
    <div className="my-4 p-4 rounded bg-gray-50 dark:bg-gray-800">
      <div className="flex gap-2 mb-2">
        {LANGUAGES.map(l => (
          <button
            key={l.key}
            onClick={() => setLang(l.key)}
            className={`px-3 py-1 rounded text-xs font-semibold ${lang === l.key ? "bg-indigo-600 text-white" : "bg-gray-200 dark:bg-gray-600"}`}
          >
            {l.label}
          </button>
        ))}
        <button
          className="ml-auto text-xs px-2 py-1 rounded bg-green-600 text-white"
          onClick={handleCopy}
        >
          Copy
        </button>
      </div>
      <pre className="overflow-x-auto text-xs bg-transparent text-gray-800 dark:text-gray-100">
        {codes[lang]}
      </pre>
    </div>
  );
}