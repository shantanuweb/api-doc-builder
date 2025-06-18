import React from "react";

export default function IntegrationNotes({ notes, setNotes }) {
  return (
    <div className="mb-4">
      <label className="font-medium">Integration Notes</label>
      <textarea
        className="border rounded px-2 py-1 w-full font-mono"
        rows={3}
        value={notes || ""}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Any integration tips or notes for this API."
      />
    </div>
  );
}
