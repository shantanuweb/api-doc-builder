import React, { useState } from 'react';

export default function ApiForm() {
  const [endpoint, setEndpoint] = useState('');
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium">Endpoint</label>
      <input type="text" className="w-full border p-2" value={endpoint} onChange={e => setEndpoint(e.target.value)} />
    </div>
  );
}