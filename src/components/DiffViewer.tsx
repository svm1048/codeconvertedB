import React from 'react';
import { diffLines } from 'diff';

interface DiffViewerProps {
  originalCode: string;
  convertedCode: string;
  originalLanguage: string;
  targetLanguage: string;
}

const DiffViewer: React.FC<DiffViewerProps> = ({
  originalCode,
  convertedCode,
  originalLanguage,
  targetLanguage
}) => {
  const diff = diffLines(originalCode, convertedCode);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
      <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b border-gray-300 dark:border-gray-600">
        <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
          <span>{originalLanguage} (Original)</span>
          <span>{targetLanguage} (Converted)</span>
        </div>
      </div>
      <div className="max-h-96 overflow-auto">
        {diff.map((part, index) => (
          <div
            key={index}
            className={`px-4 py-1 font-mono text-sm ${
              part.added
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                : part.removed
                ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                : 'text-gray-900 dark:text-gray-100'
            }`}
          >
            {part.value.split('\n').map((line, lineIndex) => (
              <div key={lineIndex} className="whitespace-pre-wrap">
                {part.added && '+ '}
                {part.removed && '- '}
                {line}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiffViewer;