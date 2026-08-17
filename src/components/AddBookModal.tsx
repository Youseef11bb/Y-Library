import { useRef, useState } from "react";
import type { Category } from "../types";
import { generateCoverDataUrl } from "../lib/pdf";
import { addBook } from "../db";

interface Props {
  categories: Category[];
  defaultCategoryId: string | null;
  onClose: () => void;
  onAdded: () => void;
}

interface PendingBook {
  file: File;
  title: string;
  author: string;
  categoryId: string | null;
  cover: string | null;
  numPages: number;
}

export default function AddBookModal({ categories, defaultCategoryId, onClose, onAdded }: Props) {
  const [pending, setPending] = useState<PendingBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setLoading(true);
    const items: PendingBook[] = [];
    for (const file of Array.from(files)) {
      const { cover, numPages } = await generateCoverDataUrl(file);
      items.push({
        file,
        title: file.name.replace(/\.pdf$/i, ""),
        author: "",
        categoryId: defaultCategoryId,
        cover,
        numPages,
      });
    }
    setPending((prev) => [...prev, ...items]);
    setLoading(false);
  }

  function updatePending(index: number, patch: Partial<PendingBook>) {
    setPending((prev) => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  }

  function removePending(index: number) {
    setPending((prev) => prev.filter((_, i) => i !== index));
  }

  async function saveAll() {
    setSaving(true);
    for (const item of pending) {
      await addBook({
        title: item.title.trim() || "بدون عنوان",
        author: item.author.trim(),
        categoryId: item.categoryId,
        coverDataUrl: item.cover,
        fileBlob: item.file,
        numPages: item.numPages,
      });
    }
    setSaving(false);
    onAdded();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-6">
      <div className="glass-modal w-full sm:max-w-2xl sm:rounded-xl rounded-t-2xl max-h-[85vh] flex flex-col border border-white/40 shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-outline-variant/30">
          <h2 className="text-headline-md text-on-surface">إضافة كتب</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/50">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-3">
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <button
            className="border-2 border-dashed border-outline-variant rounded-xl py-8 flex flex-col items-center gap-2 text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
            onClick={() => inputRef.current?.click()}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 32 }}>
              upload_file
            </span>
            <span className="text-body-md">اختر ملفات PDF من التابلت</span>
          </button>

          {loading && <p className="text-center text-on-surface-variant text-body-md">جاري تجهيز الأغلفة…</p>}

          {pending.map((item, i) => (
            <div key={i} className="flex gap-3 glass-panel rounded-lg p-3 border border-white/30">
              <div className="w-16 aspect-[2/3] rounded-md overflow-hidden bg-surface-variant shrink-0">
                {item.cover ? (
                  <img src={item.cover} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-surface-variant">picture_as_pdf</span>
                  </div>
                )}
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <input
                  className="recessed-input px-3 py-2 text-body-md"
                  value={item.title}
                  onChange={(e) => updatePending(i, { title: e.target.value })}
                  placeholder="عنوان الكتاب"
                />
                <input
                  className="recessed-input px-3 py-2 text-body-md"
                  value={item.author}
                  onChange={(e) => updatePending(i, { author: e.target.value })}
                  placeholder="اسم المؤلف (اختياري)"
                />
                <select
                  className="recessed-input px-3 py-2 text-body-md"
                  value={item.categoryId ?? ""}
                  onChange={(e) => updatePending(i, { categoryId: e.target.value || null })}
                >
                  <option value="">بدون تصنيف</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="text-on-surface-variant hover:text-error p-1 self-start"
                onClick={() => removePending(i)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  delete
                </span>
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-outline-variant/30 flex justify-end gap-2">
          <button onClick={onClose} className="px-5 py-2 rounded-full text-label-sm glass-panel text-on-surface">
            إلغاء
          </button>
          <button
            disabled={pending.length === 0 || saving}
            onClick={saveAll}
            className="px-5 py-2 rounded-full text-label-sm bg-primary text-on-primary disabled:opacity-40"
          >
            {saving ? "جاري الحفظ…" : `حفظ (${pending.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}
