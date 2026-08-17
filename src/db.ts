import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Book, BookMeta, Category } from "./types";

interface LibraryDB extends DBSchema {
  books: {
    key: string;
    value: Book;
    indexes: { categoryId: string };
  };
  categories: {
    key: string;
    value: Category;
  };
}

let dbPromise: Promise<IDBPDatabase<LibraryDB>> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<LibraryDB>("y-library-db", 1, {
      upgrade(db) {
        const bookStore = db.createObjectStore("books", { keyPath: "id" });
        bookStore.createIndex("categoryId", "categoryId");
        db.createObjectStore("categories", { keyPath: "id" });
      },
    });
  }
  return dbPromise;
}

function uid() {
  return crypto.randomUUID();
}

function stripBlob(book: Book): BookMeta {
  const { fileBlob, ...meta } = book;
  return meta;
}

// ---------- الأقسام ----------

export async function getCategories(): Promise<Category[]> {
  const db = await getDb();
  const cats = await db.getAll("categories");
  return cats.sort((a, b) => a.createdAt - b.createdAt);
}

export async function addCategory(name: string): Promise<Category> {
  const db = await getDb();
  const category: Category = { id: uid(), name: name.trim(), createdAt: Date.now() };
  await db.put("categories", category);
  return category;
}

export async function renameCategory(id: string, name: string) {
  const db = await getDb();
  const cat = await db.get("categories", id);
  if (!cat) return;
  cat.name = name.trim();
  await db.put("categories", cat);
}

export async function deleteCategory(id: string) {
  const db = await getDb();
  // الكتب اللي كانت في القسم ده بترجع "بدون تصنيف" بدل ما تتمسح
  const tx = db.transaction(["categories", "books"], "readwrite");
  const books = await tx.objectStore("books").index("categoryId").getAll(id);
  for (const b of books) {
    b.categoryId = null;
    await tx.objectStore("books").put(b);
  }
  await tx.objectStore("categories").delete(id);
  await tx.done;
}

// ---------- الكتب ----------

export async function getAllBooksMeta(): Promise<BookMeta[]> {
  const db = await getDb();
  const books = await db.getAll("books");
  return books.map(stripBlob).sort((a, b) => b.addedAt - a.addedAt);
}

export async function getBookMeta(id: string): Promise<BookMeta | undefined> {
  const db = await getDb();
  const book = await db.get("books", id);
  return book ? stripBlob(book) : undefined;
}

export async function getBookFile(id: string): Promise<Blob | undefined> {
  const db = await getDb();
  const book = await db.get("books", id);
  return book?.fileBlob;
}

export interface NewBookInput {
  title: string;
  author: string;
  categoryId: string | null;
  coverDataUrl: string | null;
  fileBlob: Blob;
  numPages: number;
}

export async function addBook(input: NewBookInput): Promise<BookMeta> {
  const db = await getDb();
  const book: Book = {
    id: uid(),
    title: input.title,
    author: input.author,
    categoryId: input.categoryId,
    coverDataUrl: input.coverDataUrl,
    fileBlob: input.fileBlob,
    numPages: input.numPages,
    currentPage: 1,
    favorite: false,
    addedAt: Date.now(),
  };
  await db.put("books", book);
  return stripBlob(book);
}

export async function updateBookMeta(id: string, patch: Partial<Omit<Book, "id" | "fileBlob">>) {
  const db = await getDb();
  const book = await db.get("books", id);
  if (!book) return;
  Object.assign(book, patch);
  await db.put("books", book);
}

export async function deleteBook(id: string) {
  const db = await getDb();
  await db.delete("books", id);
}
