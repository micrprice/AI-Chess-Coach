import * as React from "react";

interface ImportControlsProps {
  fenInput: string;
  pgnInput: string;
  onFenInputChange: (value: string) => void;
  onPgnInputChange: (value: string) => void;
  onFenImport: () => void;
  onPgnImport: () => void;
}

export const ImportControls: React.FC<ImportControlsProps> = ({
  fenInput,
  pgnInput,
  onFenInputChange,
  onPgnInputChange,
  onFenImport,
  onPgnImport,
}) => {
  return (
    <div className="flex flex-col gap-4">
      {/* FEN Import */}
      <div className="flex gap-2 w-full items-center">
        <span className="text-sm font-mono">FEN</span>
        <input
          className="flex-1 border border-gray-500 bg-gray-800 rounded px-2 py-1 text-xs font-mono text-gray-200 placeholder-gray-400"
          value={fenInput}
          onChange={(e) => onFenInputChange(e.target.value)}
          placeholder="Paste FEN here"
        />
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
          onClick={onFenImport}
        >
          Import FEN
        </button>
      </div>
      {/* PGN Import */}
      <div className="w-full">
        <textarea
          className="w-full border border-gray-500 bg-gray-800 rounded px-2 py-1 text-xs font-mono text-gray-200 placeholder-gray-400"
          rows={3}
          value={pgnInput}
          onChange={(e) => onPgnInputChange(e.target.value)}
          placeholder="Paste PGN here"
        />
        <button
          className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded w-full"
          onClick={onPgnImport}
        >
          Import PGN
        </button>
      </div>
    </div>
  );
};
