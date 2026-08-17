import { useEffect, useState } from "react";
import { addCategory, deleteBook, deleteCategory, getAllBooksMeta, getCategories } from "../db";
import type { BookMeta, Category } from "../types";
import CategoryChips from "../components/CategoryChips";
import BookCard from "../components/BookCard";
import AddBookModal from "../components/AddBookModal";

export default function Library() {
  const [books, setBooks] = useState<BookMeta[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [active, setActive] = useState<string | "all" | "uncategorized">("all");
  const [showAdd, setShowAdd] = useState(false);

  async function load() {
    setBooks(await getAllBooksMeta());
    setCategories(await getCategories());
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = books.filter((b) => {
    if (active === "all") return true;
    if (active === "uncategorized") return !b.categoryId;
    return b.categoryId === active;
  });

  async function handleAddCategory(name: string) {
    await addCategory(name);
    load();
  }

  async function handleDeleteCategory(id: string) {
    await deleteCategory(id);
    if (active === id) setActive("all");
    load();
  }

  async function handleDeleteBook(id: string) {
    if (!confirm("تحذف الكتاب ده من المكتبة؟")) return;
    await deleteBook(id);
    load();
  }

  return (
    <div className="max-w-container-max-width mx-auto px-4 sm:px-margin-tablet pt-10 pb-32">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-headline-lg-mobile sm:text-headline-lg text-on-surface">مكتبتي</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-on-primary text-label-sm shadow-sm"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            add
          </span>
          إضافة كتاب
        </button>
      </div>

      <div className="mb-6">
        <CategoryChips
          categories={categories}
          activeId={active}
          onSelect={setActive}
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="glass-panel rounded-xl p-10 text-center text-on-surface-variant">
          مفيش كتب في القسم ده لسه
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-gutter-grid">
          {filtered.map((b) => (
            <BookCard key={b.id} book={b} onDelete={handleDeleteBook} />
          ))}
        </div>
      )}

      {showAdd && (
        <AddBookModal
          categories={categories}
          defaultCategoryId={typeof active === "string" && active !== "all" && active !== "uncategorized" ? active : null}
          onClose={() => setShowAdd(false)}
          onAdded={() => {
            setShowAdd(false);
            load();
          }}
        />
      )}
    </div>
  );
}
