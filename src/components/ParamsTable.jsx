import React from "react";

const TYPE_OPTIONS = [
  "string",
  "integer",
  "float",
  "boolean",
  "array",
  "object",
];

export default function ParamsTable({
  title,
  params,
  setParams,
  hasRequired = true,
  editable = true,
}) {
  const addParam = () => {
    setParams((prev) => [
      ...prev,
      {
        name: "",
        type: "string",
        required: false,
        description: "",
        example: "",
        enum: "",
        depth: 0,
      },
    ]);
  };

  const updateParam = (idx, field, value) => {
    setParams((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p))
    );
  };

  const removeParam = (idx) => {
    setParams((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-lg">{title}</h3>
        {editable && (
          <button
            className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs"
            onClick={addParam}
          >
            + Add Param
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border rounded shadow-sm text-sm">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="border px-2 py-1 font-semibold">
                Name
              </th>
              <th className="border px-2 py-1 font-semibold">
                Type
              </th>
              {hasRequired && (
                <th className="border px-2 py-1 font-semibold" title="Required?">
                  *
                </th>
              )}
              <th className="border px-2 py-1 font-semibold" title="Description">
                Description
              </th>
              <th className="border px-2 py-1 font-semibold" title="Example Value">
                Example
              </th>
              <th className="border px-2 py-1 font-semibold" title="Allowed Values (comma separated)">
                Enum
              </th>
              {editable && (
                <th className="border px-2 py-1"></th>
              )}
            </tr>
          </thead>
          <tbody>
            {params.map((row, idx) => (
              <tr
                key={idx}
                className={
                  idx % 2 === 0
                    ? "bg-white dark:bg-gray-900"
                    : "bg-gray-50 dark:bg-gray-800"
                }
              >
                <td
                  className="border px-2 py-1 font-mono"
                  style={{
                    paddingLeft: `${8 + (row.depth || 0) * 20}px`,
                    fontWeight: row.depth > 0 ? "normal" : "bold",
                  }}
                >
                  {editable ? (
                    <input
                      className="w-full border-none outline-none text-black dark:text-white bg-transparent"
                      value={row.name}
                      onChange={(e) => updateParam(idx, "name", e.target.value)}
                      placeholder="param name"
                    />
                  ) : (
                    row.name
                  )}
                </td>
                <td className="border px-2 py-1">
                  {editable ? (
                    <select
                      className="w-full bg-transparent text-black dark:text-white"
                      value={row.type || "string"}
                      onChange={(e) =>
                        updateParam(idx, "type", e.target.value)
                      }
                    >
                      {TYPE_OPTIONS.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  ) : (
                    row.type
                  )}
                </td>
                {hasRequired && (
                  <td className="border px-2 py-1 text-center">
                    {editable ? (
                      <input
                        type="checkbox"
                        checked={!!row.required}
                        onChange={(e) =>
                          updateParam(idx, "required", e.target.checked)
                        }
                        title="Required"
                      />
                    ) : row.required ? (
                      <span title="Required" className="text-green-700 dark:text-green-400">✔</span>
                    ) : (
                      ""
                    )}
                  </td>
                )}
                <td className="border px-2 py-1">
                  {editable ? (
                    <textarea
                      className="w-full border-none outline-none text-black dark:text-white bg-transparent resize-y"
                      value={row.description}
                      onChange={(e) =>
                        updateParam(idx, "description", e.target.value)
                      }
                      placeholder="Short description"
                      rows={2}
                    />
                  ) : (
                    row.description
                  )}
                </td>
                <td className="border px-2 py-1">
                  {editable ? (
                    <input
                      className="w-full border-none outline-none text-black dark:text-white bg-transparent"
                      value={row.example || ""}
                      onChange={(e) =>
                        updateParam(idx, "example", e.target.value)
                      }
                      placeholder="example"
                    />
                  ) : (
                    row.example
                  )}
                </td>
                <td className="border px-2 py-1">
                  {editable ? (
                    <input
                      className="w-full border-none outline-none text-black dark:text-white bg-transparent"
                      value={row.enum || ""}
                      onChange={(e) =>
                        updateParam(idx, "enum", e.target.value)
                      }
                      placeholder="red,green,blue"
                    />
                  ) : row.enum ? (
                    <span>
                      {row.enum
                        .split(",")
                        .map((val, i) => (
                          <span
                            key={`${val}-${i}`}
                            className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded px-1 mx-0.5 text-xs"
                          >
                            {val.trim()}
                          </span>
                        ))}
                    </span>
                  ) : (
                    ""
                  )}
                </td>
                {editable && (
                  <td className="border px-2 py-1 text-center">
                    <button
                      className="text-red-600 hover:text-red-800 text-xs"
                      onClick={() => removeParam(idx)}
                      title="Remove"
                    >
                      ✕
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-xs text-gray-500 mt-1">
        <span title="Required">*</span>{" "}
        Required | Enum: comma-separated | Example: shown in preview & code
      </div>
    </div>
  );
}
