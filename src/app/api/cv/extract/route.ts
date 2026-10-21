import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import { strFromU8, unzipSync } from "fflate";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(["pdf", "docx", "txt"]);

function getExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16))
    );
}

function extractDocxText(bytes: Uint8Array): string {
  const archive = unzipSync(bytes, {
    filter: (file) => file.name === "word/document.xml",
  });
  const documentXml = archive["word/document.xml"];
  if (!documentXml) throw new Error("DOCX không có word/document.xml");

  return decodeXmlEntities(
    strFromU8(documentXml)
      .replace(/<w:tab\s*\/?>/g, "\t")
      .replace(/<w:br\s*\/?>/g, "\n")
      .replace(/<\/w:p>/g, "\n")
      .replace(/<[^>]+>/g, "")
  );
}

export async function POST(request: Request) {
  let parser: PDFParse | null = null;

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "Thiếu tệp CV" },
        { status: 400 }
      );
    }

    const extension = getExtension(file.name);
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      return NextResponse.json(
        { success: false, error: "Chỉ hỗ trợ tệp PDF, DOCX hoặc TXT" },
        { status: 415 }
      );
    }

    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "Tệp CV phải có dung lượng từ 1 byte đến 10 MB" },
        { status: 413 }
      );
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    let text = "";

    if (extension === "pdf") {
      parser = new PDFParse({ data: bytes });
      const result = await parser.getText();
      text = result.text;
    } else if (extension === "docx") {
      text = extractDocxText(bytes);
    } else {
      text = new TextDecoder("utf-8").decode(bytes);
    }

    const normalizedText = text.replace(/\u0000/g, "").trim();
    if (!normalizedText) {
      return NextResponse.json(
        {
          success: false,
          error:
            extension === "pdf"
              ? "PDF không chứa văn bản có thể trích xuất; hãy dùng PDF có lớp chữ hoặc dán nội dung CV"
              : "Không tìm thấy nội dung văn bản trong tệp CV",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      fileName: file.name,
      text: normalizedText.slice(0, 100_000),
    });
  } catch (error) {
    console.error("CV extraction failed:", error);
    return NextResponse.json(
      { success: false, error: "Không thể đọc nội dung tệp CV" },
      { status: 500 }
    );
  } finally {
    if (parser) await parser.destroy().catch(() => undefined);
  }
}
