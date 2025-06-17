import React from 'react';
import ApiForm from './components/ApiForm';
import DocPreview from './components/DocPreview';

export default function App() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">API Documentation Builder</h1>
      <ApiForm />
      <DocPreview />
    </div>
  );
}