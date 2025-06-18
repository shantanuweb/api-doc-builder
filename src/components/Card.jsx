import React from 'react';

export default function Card({ title, children }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg transition-colors">
      {title && <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">{title}</h3>}
      {children}
    </div>
  );
}