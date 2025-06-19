import React from "react";

export default function ParamsTable({ title, params, setParams, hasRequired }) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-md">{title}</h3>
        <button
          className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs"
          onClick={() =>
            setParams((params) => [
              ...params,
              {
                name: "",
                type: "",
                required: !!hasRequired,
                description: "",
              },
            ])
          }
        >
          + Add Param
        </button>
      </div>
      <table className="w-full border mb-2 text-xs">
        <thead>
          <tr>
            <th className="border px-2 py-1">Name</th>
            <th className="border px-2 py-1">Type</th>
            {hasRequired && <th className="border px-2 py-1">Required</th>}
            <th className="border px-2 py-1">Description</th>
            <th className="border px-2 py-1"></th>
          </tr>
        </thead>
        <tbody>
          {params.map((row, idx) => (
            <tr key={idx}>
              <td className="border px-2 py-1">
                <input
                  className="w-full border-none outline-none text-black dark:text-white bg-transparent"
                  value={row.name}
                  onChange={(e) =>
                    setParams((p) =>
                      p.map((item, i) =>
                        i === idx ? { ...item, name: e.target.value } : item
                      )
                    )
                  }
                  placeholder="param name"
                />
              </td>
              <td className="border px-2 py-1">
                <input
                  className="w-full border-none outline-none text-black dark:text-white bg-transparent"
                  value={row.type}
                  onChange={(e) =>
                    setParams((p) =>
                      p.map((item, i) =>
                        i === idx ? { ...item, type: e.target.value } : item
                      )
                    )
                  }
                  placeholder="string"
                />
              </td>
              {hasRequired && (
                <td className="border px-2 py-1 text-center">
                  <input
                    type="checkbox"
                    checked={!!row.required}
                    onChange={(e) =>
                      setParams((p) =>
                        p.map((item, i) =>
                          i === idx
                            ? { ...item, required: e.target.checked }
                            : item
                        )
                      )
                    }
                  />
                </td>
              )}
              <td className="border px-2 py-1">
                <input
                  className="w-full border-none outline-none text-black dark:text-white bg-transparent"
                  value={row.description}
                  onChange={(e) =>
                    setParams((p) =>
                      p.map((item, i) =>
                        i === idx
                          ? { ...item, description: e.target.value }
                          : item
                      )
                    )
                  }
                  placeholder="Short description"
                />
              </td>
              <td className="border px-2 py-1 text-center">
                <button
                  className="text-red-600 hover:text-red-800 text-xs"
                  onClick={() =>
                    setParams((p) => p.filter((_, i) => i !== idx))
                  }
                  title="Remove"
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
