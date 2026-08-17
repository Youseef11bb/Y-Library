import * as pdfjsLib from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

export async function loadPdf(source: Blob | ArrayBuffer) {
  const data = source instanceof Blob ? await source.arrayBuffer() : source;
  const doc = await pdfjsLib.getDocument({ data }).promise;
  return doc;
}

/** بيرجع صورة الصفحة الأولى كـ data URL عشان نستخدمها كغلاف الكتاب */
export async function generateCoverDataUrl(source: Blob): Promise<{ cover: string | null; numPages: number }> {
  try {
    const doc = await loadPdf(source);
    const page = await doc.getPage(1);
    const viewport = page.getViewport({ scale: 0.6 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return { cover: null, numPages: doc.numPages };
    await page.render({ canvas, canvasContext: ctx, viewport }).promise;
    const cover = canvas.toDataURL("image/jpeg", 0.8);
    const numPages = doc.numPages;
    return { cover, numPages };
  } catch (err) {
    console.error("تعذر توليد غلاف الكتاب", err);
    return { cover: null, numPages: 0 };
  }
}

export async function renderPageToCanvas(
  doc: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  scale: number
) {
  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  await page.render({ canvas, canvasContext: ctx, viewport }).promise;
}
