import { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, FileSpreadsheet, FileText } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

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
    <div className="relative inline-block text-left" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        disabled={disabled}
        title={disabled ? 'No expenses to download for this range' : 'Download report'}
        className="inline-flex items-center gap-2 rounded-xl border border-glass bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-500/10 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Download Report</span>
        <ChevronDown className={`w-3.5 h-3.5 opacity-85 transition-transform duration-250 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-44 rounded-xl glass-panel border border-glass shadow-2xl z-40 overflow-hidden"
          >
            <div className="p-1.5 space-y-1">
              <button
                onClick={() => {
                  onDownloadCsv();
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>CSV Spreadsheet</span>
              </button>

              <button
                onClick={() => {
                  onDownloadPdf();
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer border-t border-glass pt-2"
              >
                <FileText className="w-4 h-4 text-rose-450 shrink-0" />
                <span>PDF Document</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DownloadMenu;