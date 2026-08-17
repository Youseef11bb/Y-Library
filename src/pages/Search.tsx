import { useEffect, useState } from "react";
import { deleteBook, getAllBooksMeta, getCategories } from "../db";
import type { BookMeta, Category } from "../types";
import BookCard from "../components/BookCard";

export default function Search() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState<BookMeta[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  async function load() {
    setBooks(await getAllBooksMeta());
    setCategories(await getCategories());
  }

  useEffect(() => {
    load();
  }, []);

  const catName = (id: string | null) => categories.find((c) => c.id === id)?.name ?? "بدون تصنيف";

  const results = query.trim()
    ? books.filter(
        (b) =>
          b.title.toLowerCase().includes(query.toLowerCase()) ||
          b.author.toLowerCase().includes(query.toLowerCase()) ||
          catName(b.categoryId).toLowerCase().includes(query.toLowerCase())
      )
    : books;

  async function handleDelete(id: string) {
    if (!confirm("تحذف الكتاب ده من المكتبة؟")) return;
    await deleteBook(id);
    load();
  }

  return (
    <div className="max-w-container-max-width mx-auto px-4 sm:px-margin-tablet pt-10 pb-32">
      <h1 className="text-headline-lg-mobile sm:text-headline-lg text-on-surface mb-6">بحث</h1>

      <div className="recessed-input flex items-center gap-3 px-4 py-3 mb-8">
        <span className="material-symbols-outlined text-on-surface-variant">search</span>
        <input
          autoFocus
          className="bg-transparent outline-none flex-1 text-body-lg placeholder:text-on-surface-variant"
          placeholder="دوّر باسم الكتاب أو المؤلف أو القسم…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {results.length === 0 ? (
        <div className="glass-panel rounded-xl p-10 text-center text-on-surface-variant">مفيش نتائج</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-gutter-grid">
          {results.map((b) => (
            <BookCard key={b.id} book={b} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
