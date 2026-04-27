# Manual Extraction Notes

This directory documents the extraction process for the local scanned manual:

`docs/Sperimentare_1980_05_supplemento.pdf`

The PDF itself and generated raw extraction artifacts are intentionally ignored
by Git. Keep curated notes, indexes, verified program listings, and emulator
test cases in tracked files; keep raw OCR/text dumps local unless there is a
specific reason to publish them.

## Current Source

- Title page: `costruiamo un vero microelaboratore elettronico e impariamo a programmare`
- Authors: Giovanni Ghiringhelli and Giuseppe Fusaroli
- Publisher: Jacopo Castelfranchi Editore
- Source file: `docs/Sperimentare_1980_05_supplemento.pdf`
- PDF pages: 117
- PDF producer: Adobe Acrobat Paper Capture Plug-in
- Embedded text layer: present, but uneven

## Tooling

Poppler is used for PDF inspection, embedded text extraction, and page rendering:

```bash
pdfinfo docs/Sperimentare_1980_05_supplemento.pdf
pdftotext -layout -enc UTF-8 docs/Sperimentare_1980_05_supplemento.pdf docs/manual-extraction/raw/embedded-layout.txt
pdfimages -list docs/Sperimentare_1980_05_supplemento.pdf
pdftoppm -r 300 -f <page> -l <page> -png docs/Sperimentare_1980_05_supplemento.pdf docs/manual-extraction/rendered-samples/page-<page>
```

Tesseract is used as a fallback when the embedded OCR layer is blank or visibly
wrong:

```bash
tesseract <rendered-page.png> docs/manual-extraction/ocr-samples/page-<page> -l ita+eng --psm 6
```

Use Italian OCR (`ita`) because extracted manual text should remain in the
original Italian. English notes in this directory should explain process,
quality, emulator relevance, and verification status.

## First-Pass Results

The embedded OCR layer extracted successfully for most pages:

- Curated Markdown text: `docs/manual-extraction/sperimentare-1980-05-supplemento-text.md`
- Extracted text file: `docs/manual-extraction/raw/embedded-layout.txt`
- Page stats file: `docs/manual-extraction/raw/page-stats.tsv`
- Extracted size: about 721 KB
- Extracted words: about 62,000
- Weak pages by embedded OCR word count: 1, 2, 6, 34, 42, 52, 90, 94, 97, 112, 114, 115, 117

The weak pages are not all failures. Several appear to be blank pages,
separator pages, cover art, diagrams, or advertising/art pages. Program
listings and technical text generally have usable embedded OCR, but hex listings
must be visually verified against rendered page images before being treated as
runnable code.

The Markdown text file preserves the OCR text in Italian, grouped by PDF page in
`text` fences so column layout and program listings remain close to the scanned
source. Treat it as searchable source text, not as a verified transcription.

## Working Rules

- Preserve extracted source text in Italian.
- Write process notes, summaries, and emulator-facing documentation in English.
- Do not trust OCR for hex bytes, addresses, or labels without visual
  verification.
- Prefer a two-pass listing workflow: extract candidate bytes mechanically,
  then compare against page images before adding a runnable program file.
- Record expected AMICO display/key behavior beside each verified program so it
  can become a manual or automated emulator test later.
