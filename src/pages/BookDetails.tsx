import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { deleteBook, getBookMeta, getCategories, updateBookMeta } from "../db";
import type { BookMeta, Category } from "../types";

export default function BookDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<BookMeta | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const meta = await getBookMeta(id);
      const cats = await getCategories();
      setCategories(cats);
      if (meta) {
        setBook(meta);
        setTitle(meta.title);
        setAuthor(meta.author);
        setCategoryId(meta.categoryId);
      }
    })();
  }, [id]);

  async function save() {
    if (!id) return;
    await updateBookMeta(id, { title: title.trim() || "بدون عنوان", author: author.trim(), categoryId });
    navigate(-1);
  }

  async function toggleFavorite() {
    if (!id || !book) return;
    const favorite = !book.favorite;
    await updateBookMeta(id, { favorite });
    setBook({ ...book, favorite });
  }

  async function remove() {
    if (!id) return;
    if (!confirm("تحذف الكتاب ده نهائيًا من المكتبة؟")) return;
    await deleteBook(id);
    navigate("/library");
  }

  if (!book) return null;

  const progress = book.numPages > 0 ? Math.round((book.currentPage / book.numPages) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-margin-tablet pt-10 pb-32">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-1 text-on-surface-variant">
        <span className="material-symbols-outlined">arrow_forward</span>
        رجوع
      </button>

      <div className="flex gap-6 mb-8">
        <div className="w-32 aspect-[2/3] rounded-lg overflow-hidden shadow-md bg-surface-variant shrink-0">
          {book.coverDataUrl ? (
            <img src={book.coverDataUrl} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="material-symbols-outlined text-on-surface-variant">picture_as_pdf</span>
            </div>
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-headline-md text-on-surface mb-1">{book.title}</h1>
          <p className="text-body-md text-on-surface-variant mb-4">{book.author || "بدون مؤلف"}</p>
          <div className="w-full bg-primary/20 h-1.5 rounded-full overflow-hidden mb-1">
            <div className="bg-primary h-full rounded-full" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-label-sm text-on-surface-variant mb-4">
            {progress}% — صفحة {book.currentPage} من {book.numPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/reader/${book.id}`)}
              className="px-5 py-2 rounded-full bg-primary text-on-primary text-label-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                menu_book
              </span>
              فتح الكتاب
            </button>
            <button onClick={toggleFavorite} className="p-2.5 rounded-full glass-panel">
              <span
                className="material-symbols-outlined text-primary"
                style={book.favorite ? ({ fontVariationSettings: "'FILL' 1" } as React.CSSProperties) : undefined}
              >
                favorite
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-xl p-5 flex flex-col gap-4 border border-white/30">
        <h2 className="text-body-lg font-medium text-on-surface">تعديل البيانات</h2>
        <label className="flex flex-col gap-1">
          <span className="text-label-sm text-on-surface-variant">العنوان</span>
          <input className="recessed-input px-3 py-2 text-body-md" value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-label-sm text-on-surface-variant">المؤلف</span>
          <input className="recessed-input px-3 py-2 text-body-md" value={author} onChange={(e) => setAuthor(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-label-sm text-on-surface-variant">القسم</span>
          <select
            className="recessed-input px-3 py-2 text-body-md"
            value={categoryId ?? ""}
            onChange={(e) => setCategoryId(e.target.value || null)}
          >
            <option value="">بدون تصنيف</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <div className="flex justify-between pt-2">
          <button onClick={remove} className="px-5 py-2 rounded-full text-label-sm text-error hover:bg-error/10">
            حذف الكتاب
          </button>
          <button onClick={save} className="px-5 py-2 rounded-full bg-primary text-on-primary text-label-sm">
            حفظ التعديلات
          </button>
        </div>
      </div>
    </div>
  );
}
