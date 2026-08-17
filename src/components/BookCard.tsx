import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { BookMeta } from "../types";

interface Props {
  book: BookMeta;
  onDelete: (id: string) => void;
}

export default function BookCard({ book, onDelete }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const progress = book.numPages > 0 ? Math.round((book.currentPage / book.numPages) * 100) : 0;

  return (
    <div className="relative rounded-xl overflow-visible group">
      <div
        className="relative rounded-xl overflow-hidden aspect-[2/3] shadow-md border border-white/30 bg-surface-variant cursor-pointer"
        onClick={() => navigate(`/book/${book.id}`)}
      >
        {book.coverDataUrl ? (
          <img className="w-full h-full object-cover" src={book.coverDataUrl} alt={book.title} />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary-container/30">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: 40 }}>
              picture_as_pdf
            </span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 glass-panel border-t border-white/20 p-3 pt-4">
          <div className="flex justify-between items-start gap-1">
            <div className="min-w-0">
              <h3 className="font-medium text-body-md text-on-surface truncate">{book.title}</h3>
              <p className="text-label-sm text-on-surface-variant mt-0.5 truncate">{book.author || "بدون مؤلف"}</p>
            </div>
            <button
              className="text-on-surface-variant hover:text-primary p-1 -mt-1 rounded-full hover:bg-white/50 shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((v) => !v);
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                more_vert
              </span>
            </button>
          </div>
          <div className="w-full bg-primary/20 h-1 rounded-full mt-3 overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
          <div className="absolute top-[85%] left-2 w-44 glass-modal rounded-xl shadow-xl z-20 overflow-hidden border border-white/40">
            <ul className="py-1">
              <li>
                <button
                  className="w-full text-right px-4 py-3 text-sm text-on-surface hover:bg-white/60 flex items-center gap-3"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate(`/book/${book.id}`);
                  }}
                >
                  <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 18 }}>
                    edit
                  </span>
                  تفاصيل الكتاب
                </button>
              </li>
              <div className="h-[1px] bg-outline-variant/30 w-full my-1" />
              <li>
                <button
                  className="w-full text-right px-4 py-3 text-sm text-error hover:bg-error/10 flex items-center gap-3"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(book.id);
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    delete
                  </span>
                  حذف
                </button>
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
