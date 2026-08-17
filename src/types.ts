export interface Category {
  id: string;
  name: string;
  createdAt: number;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  categoryId: string | null; // null = بدون تصنيف
  coverDataUrl: string | null;
  fileBlob: Blob;
  numPages: number;
  currentPage: number;
  favorite: boolean;
  addedAt: number;
}

// شكل الكتاب بدون البيانات التقيلة (الـblob) عشان نستخدمه في القوائم والعرض
export type BookMeta = Omit<Book, "fileBlob">;
