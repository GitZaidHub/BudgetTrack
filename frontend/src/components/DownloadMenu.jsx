import { useState, useRef, useEffect } from 'react';

const DownloadMenu = ({ onDownloadCsv, onDownloadPdf, disabled }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        disabled={disabled}
        title={disabled ? 'No expenses to download for this range' : 'Download report'}
        className="text-sm px-3 py-1.5 rounded-md font-medium bg-gray-900 text-white
          hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed
          flex items-center gap-1.5"
      >
        ⬇ Download
        <span className="text-xs opacity-70">{open ? '▲' : '▼'}</span>
      </button>

      {open && !disabled && (
        <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg
          shadow-md z-10 overflow-hidden">
          <button
            onClick={() => { onDownloadCsv(); setOpen(false); }}
            className="w-full text-left text-sm px-4 py-2.5 hover:bg-gray-50 text-gray-700
              flex items-center gap-2"
          >
            <span>📄</span> CSV file
          </button>
          <button
            onClick={() => { onDownloadPdf(); setOpen(false); }}
            className="w-full text-left text-sm px-4 py-2.5 hover:bg-gray-50 text-gray-700
              flex items-center gap-2 border-t border-gray-100"
          >
            <span>📑</span> PDF report
          </button>
        </div>
      )}
    </div>
  );
};

export default DownloadMenu;