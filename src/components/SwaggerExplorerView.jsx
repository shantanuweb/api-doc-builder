import React from "react";
import ParamsTable from "./ParamsTable";
import CodeSamples from "./CodeSamples";

export default function SwaggerExplorerView({ endpoints }) {
  if (!endpoints || !endpoints.length) return <div>No endpoints found.</div>;
  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl">
      <h2 className="text-2xl font-bold mb-4">API Explorer</h2>
      {endpoints.map((ep, i) => (
        <details key={`${ep.method}-${ep.path}-${i}`} className="mb-3 border rounded">
          <summary className="font-mono text-indigo-700 dark:text-indigo-300 font-bold px-2 py-1 cursor-pointer">
            {ep.method} {ep.path} <span className="ml-3">{ep.summary || ep.title}</span>
          </summary>
          <div className="p-3">
            <div className="text-sm mb-2">{ep.summary || ep.description}</div>
            <ParamsTable
              title="Request Parameters"
              params={ep.requestParams || []}
              hasRequired={true}
              editable={false}
            />
            <ParamsTable
              title="Response Parameters"
              params={ep.responseParams || []}
              hasRequired={false}
              editable={false}
            />
            <CodeSamples
              endpoint={ep.baseUrl ? ep.baseUrl + ep.path : ep.path}
              method={ep.method}
              headers={ep.headers || {}}
              params={(ep.requestParams || []).reduce((a, p) => (a[p.name]=p.example||"", a), {})}
              body={ep.requestBody}
            />
          </div>
        </details>
      ))}
    </div>
  );
}
