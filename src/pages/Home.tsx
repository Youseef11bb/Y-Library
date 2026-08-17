import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllBooksMeta, getCategories } from "../db";
import type { BookMeta, Category } from "../types";
import BookCard from "../components/BookCard";
import { deleteBook } from "../db";

export default function Home() {
  const [books, setBooks] = useState<BookMeta[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  async function load() {
    setBooks(await getAllBooksMeta());
    setCategories(await getCategories());
  }

  useEffect(() => {
    load();
  }, []);

  const continueReading = books.filter((b) => b.currentPage > 1 && b.currentPage < b.numPages).slice(0, 6);
  const recent = books.slice(0, 8);

  async function handleDelete(id: string) {
    if (!confirm("تحذف الكتاب ده من المكتبة؟")) return;
    await deleteBook(id);
    load();
  }

  return (
    <div className="max-w-container-max-width mx-auto px-4 sm:px-margin-tablet pt-10 pb-32">
      <h1 className="text-headline-lg-mobile sm:text-display-lg text-on-surface mb-1">مرحبًا بيك 👋</h1>
      <p className="text-body-lg text-on-surface-variant mb-8">
        عندك {books.length} كتاب في {categories.length} قسم
      </p>

      {continueReading.length > 0 && (
        <section className="mb-10">
          <h2 className="text-headline-md text-on-surface mb-4">استكمل القراءة</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-gutter-grid">
            {continueReading.map((b) => (
              <BookCard key={b.id} book={b} onDelete={handleDelete} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-headline-md text-on-surface">أضيف مؤخرًا</h2>
          <Link to="/library" className="text-label-sm text-primary">
            عرض الكل
          </Link>
        </div>
        {recent.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-gutter-grid">
            {recent.map((b) => (
              <BookCard key={b.id} book={b} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="glass-panel rounded-xl p-10 text-center flex flex-col items-center gap-3">
      <span className="material-symbols-outlined text-primary" style={{ fontSize: 40 }}>
        auto_stories
      </span>
      <p className="text-body-lg text-on-surface">مكتبتك لسه فاضية</p>
      <Link to="/library" className="px-5 py-2 rounded-full bg-primary text-on-primary text-label-sm">
        ضيف أول كتاب
      </Link>
    </div>
  );
}
