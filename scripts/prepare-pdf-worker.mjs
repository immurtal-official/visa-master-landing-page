import { copyFileSync, mkdirSync } from "node:fs";
// Keep the same-origin worker exactly aligned with the installed PDF.js version.
mkdirSync(new URL("../public/forms/", import.meta.url), { recursive: true });
copyFileSync(
  new URL(
    "../node_modules/pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ),
  new URL("../public/forms/pdf.worker.min.mjs", import.meta.url),
);
