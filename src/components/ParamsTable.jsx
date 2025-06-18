import React from "react";

export default function ParamsTable({
  title,
  params,
  setParams,
  hasRequired = false,
}) {
  const updateParam = (i, key, value) => {
    const next = params.slice();
    next[i][key] = value;
    setParams(next);
  };

  const addParam = () => {
    setParams([
      ...params,
      { name: "", type: "", required: false, description: "" },
    ]);
  };

  const removeParam = (i) => {
    setParams(params.filter((_, idx) => idx !== i));
  };

  return (
    <div className="mb-4">
      <div className="flex items-center mb-2">
        <h3 className="font-semibold text-md flex-1">{title}</h3>
        <button
          type="button"
          onClick={addParam}
          className="ml-2 bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 text-xs"
        >
          + Add
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
                  className="w-full border rounded px-1 py-0.5"
                  value={row.name}
                  onChange={(e) => updateParam(idx, "name", e.target.value)}
                />
              </td>
              <td className="border px-2 py-1">
                <input
                  className="w-full border rounded px-1 py-0.5"
                  value={row.type}
                  onChange={(e) => updateParam(idx, "type", e.target.value)}
                />
              </td>
              {hasRequired && (
                <td className="border px-2 py-1 text-center">
                  <input
                    type="checkbox"
                    checked={row.required}
                    onChange={(e) =>
                      updateParam(idx, "required", e.target.checked)
                    }
                  />
                </td>
              )}
              <td className="border px-2 py-1">
                <input
                  className="w-full border rounded px-1 py-0.5"
                  value={row.description}
                  onChange={(e) =>
                    updateParam(idx, "description", e.target.value)
                  }
                />
              </td>
              <td className="border px-2 py-1 text-center">
                <button
                  type="button"
                  onClick={() => removeParam(idx)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
