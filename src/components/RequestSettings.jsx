import React from "react";

export default function RequestSettings({ authType, setAuthType, authValue, setAuthValue }) {
  return (
    <div className="mb-6">
      <label className="block font-semibold mb-1">Auth:</label>
      <div className="flex items-center gap-2">
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
        {(authType === "bearer" || authType === "apikey-header" || authType === "apikey-query" || authType === "basic") && (
          <input
            className="border rounded px-2 py-1 w-32"
            value={authValue}
            onChange={e => setAuthValue(e.target.value)}
            placeholder={
              authType === "bearer" ? "Token..." :
              authType === "apikey-header" ? "X-API-KEY..." :
              authType === "apikey-query" ? "api_key=..." : "user:pass"
            }
          />
        )}
      </div>
    </div>
  );
}
