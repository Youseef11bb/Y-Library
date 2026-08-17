import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getBookFile, getBookMeta, updateBookMeta } from "../db";
import { loadPdf, renderPageToCanvas } from "../lib/pdf";
import type { BookMeta } from "../types";
import type { PDFDocumentProxy } from "pdfjs-dist";

export default function Reader() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const docRef = useRef<PDFDocumentProxy | null>(null);

  const [book, setBook] = useState<BookMeta | null>(null);
  const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [loading, setLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      if (!id) return;
      const meta = await getBookMeta(id);
      const blob = await getBookFile(id);
      if (!meta || !blob || cancelled) return;
      setBook(meta);
      setPage(meta.currentPage || 1);
      const doc = await loadPdf(blob);
      if (cancelled) return;
      docRef.current = doc;
      setNumPages(doc.numPages);
      setLoading(false);
    }
    init();
    return () => {
      cancelled = true;
      docRef.current = null;
    };
  }, [id]);

  useEffect(() => {
    if (!docRef.current || !canvasRef.current || loading) return;
    renderPageToCanvas(docRef.current, page, canvasRef.current, scale);
    if (id) updateBookMeta(id, { currentPage: page });
  }, [page, scale, loading]);

  function goTo(p: number) {
    if (p < 1 || p > numPages) return;
    setPage(p);
  }

  if (loading || !book) {
    return (
      <div className="h-screen flex items-center justify-center text-on-surface-variant">
        جاري تحميل الكتاب…
      </div>
    );
  }

  return (
    <div className="h-screen bg-inverse-surface flex flex-col overflow-hidden">
      <header
        className={`glass-modal border-b border-white/10 px-4 py-3 flex items-center justify-between z-10 transition-transform ${
          showControls ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/50">
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
        <div className="text-center min-w-0 px-2">
          <h1 className="text-body-md font-medium text-on-surface truncate max-w-[50vw]">{book.title}</h1>
          <p className="text-label-sm text-on-surface-variant">
            صفحة {page} من {numPages}
          </p>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setScale((s) => Math.max(0.6, s - 0.2))} className="p-2 rounded-full hover:bg-white/50">
            <span className="material-symbols-outlined">zoom_out</span>
          </button>
          <button onClick={() => setScale((s) => Math.min(3, s + 0.2))} className="p-2 rounded-full hover:bg-white/50">
            <span className="material-symbols-outlined">zoom_in</span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto flex justify-center py-6" onClick={() => setShowControls((v) => !v)}>
        <canvas ref={canvasRef} className="shadow-2xl rounded-sm" onClick={(e) => e.stopPropagation()} />
      </div>

      <footer
        className={`glass-modal border-t border-white/10 px-6 py-4 flex items-center gap-4 transition-transform ${
          showControls ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <button
          onClick={() => goTo(page + 1)}
          disabled={page >= numPages}
          className="p-2 rounded-full hover:bg-white/50 disabled:opacity-30"
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <input
          type="range"
          min={1}
          max={numPages}
          value={page}
          onChange={(e) => goTo(Number(e.target.value))}
          className="flex-1 accent-primary"
        />
        <button
          onClick={() => goTo(page - 1)}
          disabled={page <= 1}
          className="p-2 rounded-full hover:bg-white/50 disabled:opacity-30"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </footer>
    </div>
  );
}
