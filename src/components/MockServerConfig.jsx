import React from "react";

export default function MockServerConfig({ data }) {
  return (
    <div className="mt-6">
      <label className="block font-medium text-sm mb-1">🧪 Mock Server</label>
      <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded border text-xs">
        <div>
          <b>TIP:</b> Use <a className="underline text-blue-600" href="https://webhook.site/" target="_blank" rel="noopener noreferrer">webhook.site</a> or <a className="underline text-blue-600" href="https://beeceptor.com/" target="_blank" rel="noopener noreferrer">beeceptor.com</a> for quick HTTP endpoint mocks.
        </div>
        <div className="mt-2">
          Mock URL: <code>https://your-mock-server.com{data.path || "/path"}</code>
        </div>
      </div>
    </div>
  );
}
